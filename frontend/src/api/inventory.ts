import { api } from './client.ts'

// Mirrors the backend inventory response (backend/src/game/inventory). Item keys
// come from backend/src/game/inventory/items.ts; kept as string because the UI only
// displays them.
export type InventoryItem = {
	itemKey: string
	name: string
	category: string
	quantity: number
}

export const listInventory = () => api<InventoryItem[]>('/inventory')
