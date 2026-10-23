// Database access for patrols: starting, boosting and collecting, each in one
// transaction. Collect is the one place outside their own domains that writes
// cat xp, camp xp and inventory, so the whole payout commits or none of it does.
// No HTTP here: failures are thrown as PatrolError for routes.ts to answer.

import type { Cat, Patrol, PatrolMember } from '../../generated/prisma/client.ts'
import { prisma } from '../../platform/db.ts'
import { lifeStageFor } from '../cats/lifeStage.ts'
import { ITEMS, type ItemKey } from '../inventory/items.ts'
import { levelFor, progressFor } from '../progression/level.ts'
import { rollHunting, type HuntingCat } from './hunting.ts'
import { boostBlocker, boostedEndsAt, isReady, MAX_BOOSTS, patrolEndsAt } from './timing.ts'
import type { PatrolRole, PatrolType } from './types.ts'

export type PatrolWithMembers = Patrol & { members: (PatrolMember & { cat: Cat })[] }

const withMembers = { members: { include: { cat: true } } } as const

// Thrown inside a transaction to roll it back and answer with this status
export class PatrolError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message)
	}
}

// Patrols still out or waiting to be collected
export function listActivePatrols(playerId: string): Promise<PatrolWithMembers[]> {
	return prisma.patrol.findMany({
		where: { playerId, status: 'active' },
		include: withMembers,
		orderBy: { startedAt: 'asc' },
	})
}

type StartPatrol = { playerId: string; type: PatrolType; leaderId: string; memberIds: string[]; now: Date }

export function startPatrol({ playerId, type, leaderId, memberIds, now }: StartPatrol): Promise<PatrolWithMembers> {
	const catIds = [leaderId, ...memberIds]
	return prisma.$transaction(async (tx) => {
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
				playerId,
				type,
				status: 'active',
				startedAt: now,
				endsAt: patrolEndsAt(now),
				members: { create: catIds.map((catId) => ({ catId, role: roleOf(catId) })) },
			},
		})
	})
}

// Takes time off for a hand's wins, within the limits in timing.ts. Wins past
// the boosts left are dropped rather than refused
export function boostPatrol(playerId: string, patrolId: string, wins: number, now: Date): Promise<PatrolWithMembers> {
	return prisma.$transaction(async (tx) => {
		const found = await tx.patrol.findFirst({
			where: { id: patrolId, playerId, status: 'active' },
		})
		if (!found) throw new PatrolError(404, 'Patrol not found')
		const blocker = boostBlocker(found, now)
		if (blocker) throw new PatrolError(409, blocker)
		const boosts = Math.min(wins, MAX_BOOSTS - found.boostCount)
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
}

// Brings a finished patrol home: rolls its rewards, adds the xp and items, and
// returns the report the client shows
export function collectPatrol(playerId: string, patrolId: string, now: Date) {
	return prisma.$transaction(async (tx) => {
		const found = await tx.patrol.findFirst({
			where: { id: patrolId, playerId, status: 'active' },
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
			where: { playerId },
			update: { xp: { increment: outcome.campXp } },
			create: { playerId, xp: outcome.campXp },
		})
		for (const [itemKey, quantity] of Object.entries(outcome.items)) {
			await tx.inventoryItem.upsert({
				where: { playerId_itemKey: { playerId, itemKey } },
				update: { quantity: { increment: quantity } },
				create: { playerId, itemKey, quantity },
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
}
