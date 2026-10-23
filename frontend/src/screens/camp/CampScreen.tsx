// The camp tab: a header with the colony summary over the Pixi camp, and the
// tooltip for whichever cat is focused. Focus lives here so leaving the tab
// clears it.

import { useState } from 'react'
import type { Camp } from '../../api/camp.ts'
import type { Cat } from '../../api/cats.ts'
import type { CatFocus } from './CampScene.ts'
import { CampStage } from './CampStage.tsx'
import { CatTooltip } from './CatTooltip.tsx'

type Props = {
	cats: Cat[]
	camp: Camp | null
	error: string | null
	onOpenAdmin: () => void
}

export function CampScreen({ cats, camp, error, onOpenAdmin }: Props) {
	const [focus, setFocus] = useState<CatFocus>(null)

	return (
		<>
			<header className="z-10 flex items-center justify-between p-4">
				<div>
					<h1 className="text-2xl font-bold">Camp</h1>
					<p className="text-sm text-stone-400">
						{error ??
							`${cats.length} ${cats.length === 1 ? 'cat' : 'cats'}${camp ? ` · Level ${camp.level} · ${camp.xp}/${camp.nextLevelXp} xp` : ''}`}
					</p>
				</div>
				<button
					type="button"
					onClick={onOpenAdmin}
					className="min-h-11 rounded-lg bg-stone-700 px-4 font-semibold active:bg-stone-600"
				>
					Admin
				</button>
			</header>
			<section className="relative flex-1">
				<CampStage cats={cats} onFocus={setFocus} />
				{focus && <CatTooltip cat={focus.cat} rect={focus.rect} stageWidth={focus.stageWidth} />}
			</section>
		</>
	)
}
