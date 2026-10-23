// HTTP endpoints for the camp as a whole under /api/camp: its xp and level.

import { Router } from 'express'
import { prisma } from '../db.ts'
import { getCurrentPlayer } from '../players/current.ts'
import { progressFor } from '../progression/level.ts'

export const campRouter = Router()

campRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	const camp = await prisma.camp.upsert({
		where: { playerId: player.id },
		update: {},
		create: { playerId: player.id },
	})
	res.json({ xp: camp.xp, ...progressFor(camp.xp) })
})
