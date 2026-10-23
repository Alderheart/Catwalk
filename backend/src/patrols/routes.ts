// HTTP endpoints for patrols under /api/patrols. Starting, speeding up and
// collecting a patrol all happen here, and rewards are rolled here on the
// server when a patrol is collected, never on the client.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.ts'
import type { Cat, Patrol, PatrolMember } from '../generated/prisma/client.ts'
import { lifeStageFor } from '../cats/lifeStage.ts'
import { ITEMS, type ItemKey } from '../inventory/items.ts'
import { getCurrentPlayer } from '../players/current.ts'
import { levelFor, progressFor } from '../progression/level.ts'
import { rollHunting, type HuntingCat } from './hunting.ts'
import { boostBlocker, boostedEndsAt, isReady, MAX_BOOSTS, patrolEndsAt } from './timing.ts'
import { MAX_PATROL_MEMBERS, PATROL_TYPES, type PatrolRole } from './types.ts'

export const patrolsRouter = Router()

type PatrolWithMembers = Patrol & { members: (PatrolMember & { cat: Cat })[] }

const withMembers = { members: { include: { cat: true } } } as const

// Thrown inside a transaction to roll it back and answer with this status
class PatrolError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message)
	}
}

// Leader first, so the client can show the patrol in slot order
function toDto(patrol: PatrolWithMembers, now: Date) {
	const members = [...patrol.members]
		.sort((a, b) => (a.role === b.role ? 0 : a.role === 'leader' ? -1 : 1))
		.map((m) => ({ catId: m.catId, name: m.cat.name, role: m.role }))
	return {
		id: patrol.id,
		type: patrol.type,
		status: patrol.status,
		members,
		startedAt: patrol.startedAt,
		endsAt: patrol.endsAt,
		ready: isReady(patrol, now),
		boostsLeft: MAX_BOOSTS - patrol.boostCount,
	}
}

const startPatrolBody = z
	.object({
		type: z.enum(PATROL_TYPES),
		leaderId: z.string().min(1),
		memberIds: z.array(z.string().min(1)).max(MAX_PATROL_MEMBERS).default([]),
	})
	.refine(
		(b) => new Set([b.leaderId, ...b.memberIds]).size === b.memberIds.length + 1,
		'A cat can only take one slot on a patrol',
	)

// Patrols still out or waiting to be collected
patrolsRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	const patrols = await prisma.patrol.findMany({
		where: { playerId: player.id, status: 'active' },
		include: withMembers,
		orderBy: { startedAt: 'asc' },
	})
	const now = new Date()
	res.json(patrols.map((p) => toDto(p, now)))
})

patrolsRouter.post('/', async (req, res) => {
	const parsed = startPatrolBody.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const { type, leaderId, memberIds } = parsed.data
	const catIds = [leaderId, ...memberIds]
	const player = await getCurrentPlayer()
	const now = new Date()

	try {
		const patrol = await prisma.$transaction(async (tx) => {
			const cats = await tx.cat.findMany({ where: { id: { in: catIds } } })
			if (cats.length !== catIds.length) throw new PatrolError(404, 'Cat not found')
			const kit = cats.find((c) => lifeStageFor(c.ageMoons) === 'kit')
			if (kit) throw new PatrolError(409, `${kit.name} is too young to patrol`)

			const busy = await tx.patrolMember.findFirst({
				where: { catId: { in: catIds }, patrol: { status: 'active' } },
				include: { cat: true },
			})
			if (busy) throw new PatrolError(409, `${busy.cat.name} is already on a patrol`)

			const roleOf = (id: string): PatrolRole => (id === leaderId ? 'leader' : 'member')
			return tx.patrol.create({
				include: withMembers,
				data: {
					playerId: player.id,
					type,
					status: 'active',
					startedAt: now,
					endsAt: patrolEndsAt(now),
					members: { create: catIds.map((catId) => ({ catId, role: roleOf(catId) })) },
				},
			})
		})
		res.status(201).json(toDto(patrol, now))
	} catch (err) {
		if (!(err instanceof PatrolError)) throw err
		res.status(err.status).json({ error: err.message })
	}
})

const boostBody = z.object({
	wins: z.number().int().min(1).max(MAX_BOOSTS).default(1),
})

// Called once a hand of minigame cards is over, with how many the player won.
// Reported together rather than per card, because a hand is played faster than
// the cooldown in timing.ts allows. Takes time off within those limits
patrolsRouter.post('/:id/boost', async (req, res) => {
	const parsed = boostBody.safeParse(req.body ?? {})
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const player = await getCurrentPlayer()
	const now = new Date()
	try {
		const patrol = await prisma.$transaction(async (tx) => {
			const found = await tx.patrol.findFirst({
				where: { id: req.params.id, playerId: player.id, status: 'active' },
			})
			if (!found) throw new PatrolError(404, 'Patrol not found')
			const blocker = boostBlocker(found, now)
			if (blocker) throw new PatrolError(409, blocker)
			const boosts = Math.min(parsed.data.wins, MAX_BOOSTS - found.boostCount)
			return tx.patrol.update({
				where: { id: found.id },
				include: withMembers,
				data: {
					endsAt: boostedEndsAt(found.endsAt, now, boosts),
					boostCount: { increment: boosts },
					lastBoostAt: now,
				},
			})
		})
		res.json(toDto(patrol, now))
	} catch (err) {
		if (!(err instanceof PatrolError)) throw err
		res.status(err.status).json({ error: err.message })
	}
})

// Brings a finished patrol home: rolls its rewards and adds the xp and items
patrolsRouter.post('/:id/collect', async (req, res) => {
	const player = await getCurrentPlayer()
	const now = new Date()
	try {
		const result = await prisma.$transaction(async (tx) => {
			const found = await tx.patrol.findFirst({
				where: { id: req.params.id, playerId: player.id, status: 'active' },
				include: withMembers,
			})
			if (!found) throw new PatrolError(404, 'Patrol not found')
			if (!isReady(found, now)) throw new PatrolError(409, 'Patrol is still out')

			// Guard on status so two collects at once can't both pay out
			const claimed = await tx.patrol.updateMany({
				where: { id: found.id, status: 'active' },
				data: { status: 'completed', completedAt: now },
			})
			if (claimed.count === 0) throw new PatrolError(409, 'Patrol was already collected')

			const huntingCats: HuntingCat[] = found.members.map((m) => ({
				catId: m.catId,
				role: m.role as PatrolRole,
				level: levelFor(m.cat.xp),
			}))
			const outcome = rollHunting(huntingCats)

			const cats = await Promise.all(
				outcome.cats.map((c) => tx.cat.update({ where: { id: c.catId }, data: { xp: { increment: c.xp } } })),
			)
			const camp = await tx.camp.upsert({
				where: { playerId: player.id },
				update: { xp: { increment: outcome.campXp } },
				create: { playerId: player.id, xp: outcome.campXp },
			})
			for (const [itemKey, quantity] of Object.entries(outcome.items)) {
				await tx.inventoryItem.upsert({
					where: { playerId_itemKey: { playerId: player.id, itemKey } },
					update: { quantity: { increment: quantity } },
					create: { playerId: player.id, itemKey, quantity },
				})
			}

			const before = new Map(found.members.map((m) => [m.catId, levelFor(m.cat.xp)]))
			return {
				items: Object.entries(outcome.items).map(([itemKey, quantity]) => ({
					itemKey,
					name: ITEMS[itemKey as ItemKey].name,
					quantity,
				})),
				cats: outcome.cats.map((c) => {
					const cat = cats.find((x) => x.id === c.catId)!
					const level = levelFor(cat.xp)
					return { ...c, name: cat.name, level, leveledUp: level > before.get(c.catId)! }
				}),
				camp: {
					xpGained: outcome.campXp,
					xp: camp.xp,
					...progressFor(camp.xp),
					leveledUp: levelFor(camp.xp) > levelFor(camp.xp - outcome.campXp),
				},
			}
		})
		res.json(result)
	} catch (err) {
		if (!(err instanceof PatrolError)) throw err
		res.status(err.status).json({ error: err.message })
	}
})
