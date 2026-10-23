// Picks the cats for a new hunting patrol: one leader and up to three members.
// Only checks what the player can see (kits, cats already out); the backend
// checks again when the patrol starts.

import { useState } from 'react'
import type { Cat } from '../../api/cats.ts'

// Slot 0 is the leader
const SLOTS = 4

type Props = {
	cats: Cat[]
	busyCatIds: Set<string>
	starting: boolean
	onStart: (leaderId: string, memberIds: string[]) => void
	onCancel: () => void
}

export function PatrolBuilder({ cats, busyCatIds, starting, onStart, onCancel }: Props) {
	const [slots, setSlots] = useState<(string | null)[]>(Array(SLOTS).fill(null))
	const byId = new Map(cats.map((c) => [c.id, c]))

	// Tapping a cat puts it in the first empty slot, so the first pick leads
	const addCat = (id: string) => {
		setSlots((prev) => {
			const free = prev.indexOf(null)
			if (free === -1 || prev.includes(id)) return prev
			return prev.map((slot, i) => (i === free ? id : slot))
		})
	}
	const clearSlot = (index: number) => setSlots((prev) => prev.map((slot, i) => (i === index ? null : slot)))

	const [leaderId, ...rest] = slots
	const memberIds = rest.filter((id): id is string => id !== null)

	function unavailable(cat: Cat): string | null {
		if (cat.lifeStage === 'kit') return 'Too young'
		if (busyCatIds.has(cat.id)) return 'On patrol'
		return null
	}

	return (
		<section className="rounded-lg bg-stone-800 p-4">
			<h2 className="text-lg font-bold">New hunting patrol</h2>
			<p className="text-sm text-stone-400">Tap cats to fill the slots. The first slot leads.</p>

			<div className="mt-3 grid grid-cols-2 gap-2">
				{slots.map((id, i) => {
					const cat = id ? byId.get(id) : undefined
					return (
						<button
							key={i}
							type="button"
							onClick={() => clearSlot(i)}
							disabled={!cat}
							className="min-h-14 rounded-lg border border-dashed border-stone-600 px-2 text-left text-sm"
						>
							<span className="block text-xs text-stone-400">{i === 0 ? 'Leader' : `Member ${i}`}</span>
							{cat ? <span className="font-semibold">{cat.name}</span> : <span className="text-stone-500">Empty</span>}
						</button>
					)
				})}
			</div>

			<ul className="mt-3 flex max-h-56 flex-col gap-1 overflow-y-auto">
				{cats.map((cat) => {
					const reason = unavailable(cat)
					const picked = slots.includes(cat.id)
					return (
						<li key={cat.id}>
							<button
								type="button"
								onClick={() => addCat(cat.id)}
								disabled={reason !== null || picked}
								className="flex min-h-11 w-full items-center justify-between rounded-lg bg-stone-700 px-3 text-left disabled:opacity-40"
							>
								<span>
									{cat.name} <span className="text-sm text-stone-400">Lv {cat.level}</span>
								</span>
								<span className="text-sm text-stone-400">{reason ?? (picked ? 'Picked' : cat.lifeStage)}</span>
							</button>
						</li>
					)
				})}
			</ul>

			<div className="mt-3 flex gap-2">
				<button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-lg bg-stone-700 font-semibold">
					Cancel
				</button>
				<button
					type="button"
					onClick={() => leaderId && onStart(leaderId, memberIds)}
					disabled={!leaderId || starting}
					className="min-h-11 flex-1 rounded-lg bg-amber-600 font-semibold active:bg-amber-700 disabled:opacity-50"
				>
					Send out
				</button>
			</div>
		</section>
	)
}
