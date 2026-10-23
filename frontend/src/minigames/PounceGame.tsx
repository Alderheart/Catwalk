// Full-screen pounce minigame: tap the mouse enough times before time runs
// out. Winning only tells the caller; the caller asks the backend for the
// reward, which decides whether it counts.

import { useEffect, useRef, useState } from 'react'
import { usePixiApp } from '../game/usePixiApp.ts'
import { PounceScene } from './PounceScene.ts'

const HITS_TO_WIN = 5
const TIME_LIMIT_S = 10

type Props = {
	onWin: () => void
	onClose: () => void
}

export function PounceGame({ onWin, onClose }: Props) {
	const hostRef = useRef<HTMLDivElement>(null)
	const [hits, setHits] = useState(0)
	const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S)
	const [round, setRound] = useState(0)
	const won = hits >= HITS_TO_WIN
	const lost = !won && timeLeft <= 0
	const playing = !won && !lost

	usePixiApp(hostRef, (app) => {
		const scene = new PounceScene(app, () => setHits((h) => h + 1))
		return () => scene.destroy()
	})

	useEffect(() => {
		if (!playing) return
		const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
		return () => clearInterval(timer)
	}, [playing, round])

	// Report a win once, as soon as it happens
	const reported = useRef(false)
	useEffect(() => {
		if (won && !reported.current) {
			reported.current = true
			onWin()
		}
	}, [won, onWin])

	const retry = () => {
		setHits(0)
		setTimeLeft(TIME_LIMIT_S)
		setRound((r) => r + 1)
	}

	return (
		<div className="absolute inset-0 z-30 flex flex-col bg-emerald-950">
			<header className="flex items-center justify-between p-4">
				<div>
					<h2 className="text-xl font-bold">Pounce!</h2>
					<p className="text-sm text-stone-300">
						Tap the mouse {HITS_TO_WIN} times · {hits}/{HITS_TO_WIN} · {Math.max(timeLeft, 0)}s
					</p>
				</div>
				<button type="button" onClick={onClose} className="min-h-11 rounded-lg bg-stone-700 px-4 font-semibold">
					Close
				</button>
			</header>
			<div className="relative flex-1">
				{/* Hidden rather than unmounted when the round ends, so Pixi isn't rebuilt on retry */}
				<div ref={hostRef} className={`absolute inset-0 ${playing ? '' : 'pointer-events-none opacity-30'}`} />
				{!playing && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 text-center">
						<p className="text-2xl font-bold">{won ? 'Caught it!' : 'It got away'}</p>
						{won ? (
							<p className="text-stone-300">The patrol is moving faster.</p>
						) : (
							<button
								type="button"
								onClick={retry}
								className="min-h-11 rounded-lg bg-amber-600 px-6 font-semibold active:bg-amber-700"
							>
								Try again
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
