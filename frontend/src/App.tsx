// App shell: a phone-sized column that respects safe areas, with a header and
// the camp filling the rest.

import { useCallback, useEffect, useState } from 'react'
import { generateRandomCat, listCats, type Cat } from './api/cats.ts'
import type { CatFocus } from './game/CampScene.ts'
import { CatTooltip } from './game/CatTooltip.tsx'
import { PixiStage } from './game/PixiStage.tsx'

function App() {
	const [cats, setCats] = useState<Cat[]>([])
	const [error, setError] = useState<string | null>(null)
	const [focus, setFocus] = useState<CatFocus>(null)

	useEffect(() => {
		listCats()
			.then(setCats)
			.catch(() => setError('Could not reach the backend'))
	}, [])

	// Dev helper until cats can be earned: asks the backend to roll a cat
	const addCat = useCallback(() => {
		generateRandomCat()
			.then((cat) => setCats((prev) => [...prev, cat]))
			.catch(() => setError('Could not add a cat'))
	}, [])

	return (
		<main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
			<header className="z-10 flex items-center justify-between p-4">
				<div>
					<h1 className="text-2xl font-bold">Camp</h1>
					<p className="text-sm text-stone-400">
						{error ?? `${cats.length} ${cats.length === 1 ? 'cat' : 'cats'}`}
					</p>
				</div>
				<button
					type="button"
					onClick={addCat}
					className="min-h-11 rounded-lg bg-amber-600 px-4 font-semibold active:bg-amber-700"
				>
					Add cat
				</button>
			</header>
			<section className="relative flex-1">
				<PixiStage cats={cats} onFocus={setFocus} />
				{focus && <CatTooltip cat={focus.cat} rect={focus.rect} stageWidth={focus.stageWidth} />}
			</section>
		</main>
	)
}

export default App
