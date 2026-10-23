// App shell: a phone-sized column that respects safe areas, showing one screen
// at a time with a tab bar at the bottom. Holds the cats and camp level because
// more than one screen shows them; everything else belongs to its screen.

import { useCallback, useEffect, useState } from 'react'
import { getCamp, type Camp } from '../api/camp.ts'
import { listCats, type Cat } from '../api/cats.ts'
import { AdminScreen } from '../screens/admin/AdminScreen.tsx'
import { CampScreen } from '../screens/camp/CampScreen.tsx'
import { InventoryScreen } from '../screens/inventory/InventoryScreen.tsx'
import { PatrolsScreen } from '../screens/patrols/PatrolsScreen.tsx'
import { TabBar, type Screen } from './TabBar.tsx'

function App() {
	const [cats, setCats] = useState<Cat[]>([])
	const [camp, setCamp] = useState<Camp | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [screen, setScreen] = useState<Screen>('camp')

	// Patrol rewards and admin edits change cats and camp xp, so those screens call this too
	const refresh = useCallback(() => {
		Promise.all([listCats(), getCamp()])
			.then(([cats, camp]) => {
				setCats(cats)
				setCamp(camp)
			})
			.catch(() => setError('Could not reach the backend'))
	}, [])

	useEffect(refresh, [refresh])

	return (
		<main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
			{screen === 'camp' ? (
				<CampScreen cats={cats} camp={camp} error={error} onOpenAdmin={() => setScreen('admin')} />
			) : screen === 'admin' ? (
				<AdminScreen cats={cats} onCatsChanged={refresh} onBack={() => setScreen('camp')} />
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
