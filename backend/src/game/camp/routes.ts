// HTTP endpoints for the camp as a whole under /api/camp: its xp and level.

import { Router } from 'express'
import { getCurrentPlayer } from '../../platform/players/current.ts'
import { progressFor } from '../progression/level.ts'
import { getCamp } from './service.ts'

export const campRouter = Router()

campRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	const camp = await getCamp(player.id)
	res.json({ xp: camp.xp, ...progressFor(camp.xp) })
})
