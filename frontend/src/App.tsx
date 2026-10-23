// App shell: a phone-sized column that respects safe areas, showing one screen
// at a time (camp, patrols or inventory) with a tab bar at the bottom. Holds
// the cats and camp level because more than one screen shows them.

import { useCallback, useEffect, useState } from 'react'
import { getCamp, type Camp } from './api/camp.ts'
import { generateRandomCat, listCats, type Cat } from './api/cats.ts'
import type { CatFocus } from './game/CampScene.ts'
import { CatTooltip } from './game/CatTooltip.tsx'
import { PixiStage } from './game/PixiStage.tsx'
import { InventoryScreen } from './inventory/InventoryScreen.tsx'
import { PatrolsScreen } from './patrols/PatrolsScreen.tsx'

type Screen = 'camp' | 'patrols' | 'inventory'

const SCREENS: { id: Screen; label: string }[] = [
	{ id: 'camp', label: 'Camp' },
	{ id: 'patrols', label: 'Patrols' },
	{ id: 'inventory', label: 'Inventory' },
]

function App() {
	const [cats, setCats] = useState<Cat[]>([])
	const [camp, setCamp] = useState<Camp | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [focus, setFocus] = useState<CatFocus>(null)
	const [screen, setScreen] = useState<Screen>('camp')

	// Patrol rewards change cat and camp xp, so the patrols screen calls this too
	const refresh = useCallback(() => {
		Promise.all([listCats(), getCamp()])
			.then(([cats, camp]) => {
				setCats(cats)
				setCamp(camp)
			})
			.catch(() => setError('Could not reach the backend'))
	}, [])

	useEffect(refresh, [refresh])

	// Dev helper until cats can be earned: asks the backend to roll a cat
	const addCat = useCallback(() => {
		generateRandomCat()
			.then((cat) => setCats((prev) => [...prev, cat]))
			.catch(() => setError('Could not add a cat'))
	}, [])

	return (
		<main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
			{screen === 'camp' ? (
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
				</>
			) : screen === 'patrols' ? (
				<PatrolsScreen cats={cats} onRewards={refresh} />
			) : (
				<InventoryScreen />
			)}
			<nav className="z-10 flex border-t border-stone-700">
				{SCREENS.map(({ id, label }) => (
					<button
						key={id}
						type="button"
						onClick={() => {
							setFocus(null)
							setScreen(id)
						}}
						aria-current={screen === id ? 'page' : undefined}
						className={`min-h-12 flex-1 font-semibold ${screen === id ? 'text-amber-500' : 'text-stone-400'}`}
					>
						{label}
					</button>
				))}
			</nav>
		</main>
	)
}

export default App
