// App shell: a phone-sized column that respects safe areas, with a header and
// the Pixi game stage filling the rest.

import { useEffect, useState } from 'react'
import { api } from './api/client.ts'
import { PixiStage } from './game/PixiStage.tsx'

type Health = { ok: boolean; db: boolean }

function App() {
	const [health, setHealth] = useState<Health | null>(null)

	useEffect(() => {
		api<Health>('/health')
			.then(setHealth)
			.catch(() => setHealth({ ok: false, db: false }))
	}, [])

	return (
		<main className="relative mx-auto flex h-dvh max-w-md flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
			<header className="z-10 p-4 text-center">
				<h1 className="text-2xl font-bold">Catwalk</h1>
				<p className="text-sm text-stone-400">
					Backend: {health === null ? 'checking…' : health.ok ? `online, db ${health.db ? 'ok' : 'down'}` : 'offline'}
				</p>
			</header>
			<section className="relative flex-1">
				<PixiStage />
			</section>
		</main>
	)
}

export default App
