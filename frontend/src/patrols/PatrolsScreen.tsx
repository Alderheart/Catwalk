// Placeholder screen for patrols. It only lists what the backend reports;
// starting a patrol and its outcome will come from the backend once designed.

import { useEffect, useState } from 'react'
import { listPatrols, type Patrol } from '../api/patrols.ts'

export function PatrolsScreen() {
	const [patrols, setPatrols] = useState<Patrol[] | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		listPatrols()
			.then(setPatrols)
			.catch(() => setError('Could not reach the backend'))
	}, [])

	return (
		<section className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
			<h1 className="text-2xl font-bold">Patrols</h1>
			<p className="text-sm text-stone-400">
				{error ?? (patrols === null ? 'Loading…' : `${patrols.length} active`)}
			</p>
			<p className="mt-4 rounded-lg bg-stone-800 p-4 text-stone-300">
				Patrols are coming soon. Cats will head out to hunt, guard the border and train.
			</p>
		</section>
	)
}
