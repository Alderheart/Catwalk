// One patrol that is out of camp: who is on it, a countdown, and the buttons
// to speed it up with minigames or collect it once it is back.

import type { Patrol, PatrolType } from '../../api/patrols.ts'

const TYPE_LABELS: Record<PatrolType, string> = { hunting: 'Hunting patrol' }

type Props = {
	patrol: Patrol
	now: number
	busy: boolean
	onPlay: () => void
	onCollect: () => void
}

function formatRemaining(ms: number): string {
	const total = Math.ceil(ms / 1000)
	const minutes = Math.floor(total / 60)
	const seconds = total % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function PatrolCard({ patrol, now, busy, onPlay, onCollect }: Props) {
	const start = Date.parse(patrol.startedAt)
	const end = Date.parse(patrol.endsAt)
	const remaining = Math.max(end - now, 0)
	// The server has the final say when collecting; this only drives the display
	const back = remaining === 0
	const progress = end > start ? Math.min((now - start) / (end - start), 1) : 1

	return (
		<article className="rounded-lg bg-stone-800 p-4">
			<header className="flex items-baseline justify-between">
				<h2 className="text-lg font-bold">{TYPE_LABELS[patrol.type]}</h2>
				<p className="text-sm text-stone-300 tabular-nums">{back ? 'Back in camp' : formatRemaining(remaining)}</p>
			</header>
			<ul className="mt-1 text-sm text-stone-300">
				{patrol.members.map((m) => (
					<li key={m.catId}>
						{m.name}
						{m.role === 'leader' && <span className="ml-2 text-amber-500">Leader</span>}
					</li>
				))}
			</ul>
			<div className="mt-3 h-2 overflow-hidden rounded bg-stone-700">
				<div className="h-full bg-amber-600" style={{ width: `${progress * 100}%` }} />
			</div>
			<div className="mt-3 flex gap-2">
				{back ? (
					<button
						type="button"
						onClick={onCollect}
						disabled={busy}
						className="min-h-11 flex-1 rounded-lg bg-amber-600 font-semibold active:bg-amber-700 disabled:opacity-50"
					>
						Collect
					</button>
				) : (
					<button
						type="button"
						onClick={onPlay}
						disabled={busy || patrol.boostsLeft === 0}
						className="min-h-11 flex-1 rounded-lg bg-emerald-700 font-semibold active:bg-emerald-800 disabled:opacity-50"
					>
						{patrol.boostsLeft > 0 ? `Speed up: play minigames (${patrol.boostsLeft} boosts left)` : 'No boosts left'}
					</button>
				)}
			</div>
		</article>
	)
}
