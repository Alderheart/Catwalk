// Database access for the inventory. No HTTP here.

import { prisma } from '../../platform/db.ts'
import { isItemKey, ITEMS } from './items.ts'

// What the player holds, with names and categories filled in from ITEMS. Skips
// keys that are no longer in ITEMS rather than failing the whole list
export async function listInventory(playerId: string) {
	const rows = await prisma.inventoryItem.findMany({
		where: { playerId, quantity: { gt: 0 } },
		orderBy: { itemKey: 'asc' },
	})
	return rows
		.filter((row) => isItemKey(row.itemKey))
		.map((row) => {
			const item = ITEMS[row.itemKey as keyof typeof ITEMS]
			return { itemKey: row.itemKey, name: item.name, category: item.category, quantity: row.quantity }
		})
}
