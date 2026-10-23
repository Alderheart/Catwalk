// What a patrol brought home, shown once after collecting it.

import type { PatrolRewards } from '../api/patrols.ts'

type Props = {
	rewards: PatrolRewards
	onDone: () => void
}

export function PatrolReport({ rewards, onDone }: Props) {
	return (
		<div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
			<section className="w-full rounded-lg bg-stone-800 p-4">
				<h2 className="text-xl font-bold">The patrol is back</h2>

				<h3 className="mt-3 font-semibold">Prey</h3>
				{rewards.items.length === 0 ? (
					<p className="text-sm text-stone-400">They came back empty-pawed.</p>
				) : (
					<ul className="text-sm text-stone-300">
						{rewards.items.map((item) => (
							<li key={item.itemKey}>
								{item.quantity} × {item.name}
							</li>
						))}
					</ul>
				)}

				<h3 className="mt-3 font-semibold">Cats</h3>
				<ul className="text-sm text-stone-300">
					{rewards.cats.map((cat) => (
						<li key={cat.catId}>
							{cat.name}: +{cat.xp} xp
							{cat.leveledUp && <span className="ml-2 text-amber-500">Level {cat.level}!</span>}
						</li>
					))}
				</ul>

				<h3 className="mt-3 font-semibold">Camp</h3>
				<p className="text-sm text-stone-300">
					+{rewards.camp.xpGained} xp
					{rewards.camp.leveledUp && <span className="ml-2 text-amber-500">Level {rewards.camp.level}!</span>}
				</p>

				<button
					type="button"
					onClick={onDone}
					className="mt-4 min-h-11 w-full rounded-lg bg-amber-600 font-semibold active:bg-amber-700"
				>
					Done
				</button>
			</section>
		</div>
	)
}
