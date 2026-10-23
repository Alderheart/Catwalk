// HTTP endpoints for patrols under /api/patrols. Validates requests, calls
// service.ts, and turns PatrolError into a status code. Rewards are rolled in
// the service when a patrol is collected, never on the client.

import { Router, type Response } from 'express'
import { z } from 'zod'
import { getCurrentPlayer } from '../../platform/players/current.ts'
import { boostPatrol, collectPatrol, listActivePatrols, PatrolError, startPatrol, type PatrolWithMembers } from './service.ts'
import { isReady, MAX_BOOSTS } from './timing.ts'
import { MAX_PATROL_MEMBERS, PATROL_TYPES } from './types.ts'

export const patrolsRouter = Router()

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

// Answers a PatrolError with its status; anything else is a real failure
function sendPatrolError(res: Response, err: unknown) {
	if (!(err instanceof PatrolError)) throw err
	res.status(err.status).json({ error: err.message })
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

const boostBody = z.object({
	wins: z.number().int().min(1).max(MAX_BOOSTS).default(1),
})

patrolsRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	const patrols = await listActivePatrols(player.id)
	const now = new Date()
	res.json(patrols.map((p) => toDto(p, now)))
})

patrolsRouter.post('/', async (req, res) => {
	const parsed = startPatrolBody.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const player = await getCurrentPlayer()
	const now = new Date()
	try {
		const patrol = await startPatrol({ ...parsed.data, playerId: player.id, now })
		res.status(201).json(toDto(patrol, now))
	} catch (err) {
		sendPatrolError(res, err)
	}
})

// Called once a hand of minigame cards is over, with how many the player won.
// Reported together rather than per card, because a hand is played faster than
// the cooldown in timing.ts allows
patrolsRouter.post('/:id/boost', async (req, res) => {
	const parsed = boostBody.safeParse(req.body ?? {})
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const player = await getCurrentPlayer()
	const now = new Date()
	try {
		const patrol = await boostPatrol(player.id, req.params.id, parsed.data.wins, now)
		res.json(toDto(patrol, now))
	} catch (err) {
		sendPatrolError(res, err)
	}
})

patrolsRouter.post('/:id/collect', async (req, res) => {
	const player = await getCurrentPlayer()
	try {
		res.json(await collectPatrol(player.id, req.params.id, new Date()))
	} catch (err) {
		sendPatrolError(res, err)
	}
})
