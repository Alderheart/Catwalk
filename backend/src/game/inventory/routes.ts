// HTTP endpoints for the player's inventory under /api/inventory. Read only:
// items are added by game rules on the server (such as patrols), never by the client.

import { Router } from 'express'
import { getCurrentPlayer } from '../../platform/players/current.ts'
import { listInventory } from './service.ts'

export const inventoryRouter = Router()

inventoryRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	res.json(await listInventory(player.id))
})
