// The inventory tab: what the player holds. Read only, because items are
// only ever added or spent by the backend.

import { useEffect, useState } from 'react'
import { listInventory, type InventoryItem } from '../api/inventory.ts'

export function InventoryScreen() {
	const [items, setItems] = useState<InventoryItem[] | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		listInventory()
			.then(setItems)
			.catch(() => setError('Could not reach the backend'))
	}, [])

	return (
		<section className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
			<h1 className="text-2xl font-bold">Inventory</h1>
			{error && <p className="text-sm text-stone-400">{error}</p>}
			{items?.length === 0 && (
				<p className="rounded-lg bg-stone-800 p-4 text-stone-300">Empty. Hunting patrols bring back prey.</p>
			)}
			<ul className="grid grid-cols-2 gap-2">
				{items?.map((item) => (
					<li key={item.itemKey} className="rounded-lg bg-stone-800 p-3">
						<p className="font-semibold">{item.name}</p>
						<p className="text-sm text-stone-400">
							×{item.quantity} · <span className="capitalize">{item.category}</span>
						</p>
					</li>
				))}
			</ul>
		</section>
	)
}
