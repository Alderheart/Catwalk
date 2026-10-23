// Shows a cat's info next to its placeholder square. DOM rather than Pixi
// because it is UI text; it ignores pointer events so it never blocks the canvas.

import type { Cat } from '../../api/cats.ts'
import type { Rect } from './campLayout.ts'

type Props = {
	cat: Cat
	// The cat's square in the stage's CSS pixels
	rect: Rect
	stageWidth: number
}

const WIDTH = 176
const GAP = 8
// Roughly the tooltip's height with its personality section, so it only sits
// above the square when it fits
const HEIGHT = 190

export function CatTooltip({ cat, rect, stageWidth }: Props) {
	const centre = rect.x + rect.width / 2
	const left = Math.min(Math.max(centre - WIDTH / 2, GAP), stageWidth - WIDTH - GAP)
	// Prefer above the square, and flip below when there's no room
	const above = rect.y > HEIGHT + GAP
	const style = above
		? { left, top: rect.y - GAP, width: WIDTH, transform: 'translateY(-100%)' }
		: { left, top: rect.y + rect.height + GAP, width: WIDTH }

	return (
		<div
			role="tooltip"
			className="pointer-events-none absolute z-20 rounded-lg bg-stone-800/95 p-3 text-sm shadow-lg ring-1 ring-stone-600"
			style={style}
		>
			<p className="text-base font-bold">
				{cat.name} <span className="text-sm font-normal text-amber-500">Lv {cat.level}</span>
			</p>
			<p className="text-stone-300">{cat.breed}</p>
			<p className="text-stone-300">
				{cat.gender} · <span className="capitalize">{cat.lifeStage}</span>
			</p>
			<p className="text-stone-400">
				{cat.ageMoons} {cat.ageMoons === 1 ? 'moon' : 'moons'} old
			</p>
			{cat.personality && (
				<div className="mt-2 border-t border-stone-600 pt-2">
					<p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Personality</p>
					<p className="capitalize">{cat.personality.mainTrait}</p>
					<p className="text-stone-300 capitalize">{cat.personality.sideTrait}</p>
				</div>
			)}
		</div>
	)
}
