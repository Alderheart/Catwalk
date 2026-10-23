// HTTP endpoints for the player's inventory under /api/inventory. Read only:
// items are added by game rules on the server (such as patrols), never by the client.

import { Router } from 'express'
import { prisma } from '../db.ts'
import { getCurrentPlayer } from '../players/current.ts'
import { isItemKey, ITEMS } from './items.ts'

export const inventoryRouter = Router()

inventoryRouter.get('/', async (_req, res) => {
	const player = await getCurrentPlayer()
	const rows = await prisma.inventoryItem.findMany({
		where: { playerId: player.id, quantity: { gt: 0 } },
		orderBy: { itemKey: 'asc' },
	})
	// Skip keys that are no longer in ITEMS rather than failing the whole list
	const items = rows
		.filter((row) => isItemKey(row.itemKey))
		.map((row) => {
			const item = ITEMS[row.itemKey as keyof typeof ITEMS]
			return { itemKey: row.itemKey, name: item.name, category: item.category, quantity: row.quantity }
		})
	res.json(items)
})
