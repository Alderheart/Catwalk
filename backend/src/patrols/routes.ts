// HTTP endpoints for patrols under /api/patrols. A placeholder so the frontend
// has something to call; it stores nothing and decides no outcomes yet.

import { Router } from 'express'
import type { Patrol } from './types.ts'

export const patrolsRouter = Router()

// No patrols exist until they are stored, so the list is always empty for now
patrolsRouter.get('/', (_req, res) => {
	const patrols: Patrol[] = []
	res.json(patrols)
})

// Starting a patrol will roll its outcome here, on the server. Not built yet
patrolsRouter.post('/', (_req, res) => {
	res.status(501).json({ error: 'Patrols are not implemented yet' })
})
