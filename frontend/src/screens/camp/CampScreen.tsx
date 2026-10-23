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
	onAddCat: () => void
}

export function CampScreen({ cats, camp, error, onAddCat }: Props) {
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
					onClick={onAddCat}
					className="min-h-11 rounded-lg bg-amber-600 px-4 font-semibold active:bg-amber-700"
				>
					Add cat
				</button>
			</header>
			<section className="relative flex-1">
				<CampStage cats={cats} onFocus={setFocus} />
				{focus && <CatTooltip cat={focus.cat} rect={focus.rect} stageWidth={focus.stageWidth} />}
			</section>
		</>
	)
}
