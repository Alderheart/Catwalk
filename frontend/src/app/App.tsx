// App shell: a phone-sized column that respects safe areas, showing one screen
// at a time with a tab bar at the bottom. Holds the cats and camp level because
// more than one screen shows them; everything else belongs to its screen.

import { useCallback, useEffect, useState } from 'react'
import { getCamp, type Camp } from '../api/camp.ts'
import { generateRandomCat, listCats, type Cat } from '../api/cats.ts'
import { CampScreen } from '../screens/camp/CampScreen.tsx'
import { InventoryScreen } from '../screens/inventory/InventoryScreen.tsx'
import { PatrolsScreen } from '../screens/patrols/PatrolsScreen.tsx'
import { TabBar, type Screen } from './TabBar.tsx'

function App() {
	const [cats, setCats] = useState<Cat[]>([])
	const [camp, setCamp] = useState<Camp | null>(null)
	const [error, setError] = useState<string | null>(null)
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
				<CampScreen cats={cats} camp={camp} error={error} onAddCat={addCat} />
			) : screen === 'patrols' ? (
				<PatrolsScreen cats={cats} onRewards={refresh} />
			) : (
				<InventoryScreen />
			)}
			<TabBar current={screen} onChange={setScreen} />
		</main>
	)
}

export default App
