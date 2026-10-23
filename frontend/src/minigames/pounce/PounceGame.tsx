// The pounce card: tap the mouse enough times before time runs out. It only
// reports won or lost; the session around it decides what comes next, and the
// backend decides what a win is worth.

import { useEffect, useRef, useState } from 'react'
import { usePixiApp } from '../../pixi/usePixiApp.ts'
import type { MinigameProps } from '../types.ts'
import { PounceScene } from './PounceScene.ts'

export const HITS_TO_WIN = 5
const TIME_LIMIT_S = 10

export function PounceGame({ onFinish }: MinigameProps) {
	const hostRef = useRef<HTMLDivElement>(null)
	const [hits, setHits] = useState(0)
	const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_S)
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
	}, [playing])

	// Report the result once, as soon as the round ends
	const reported = useRef(false)
	useEffect(() => {
		if (!playing && !reported.current) {
			reported.current = true
			onFinish(won)
		}
	}, [playing, won, onFinish])

	return (
		<div className="flex flex-1 flex-col">
			<p className="px-4 text-sm text-stone-300 tabular-nums">
				{hits}/{HITS_TO_WIN} · {Math.max(timeLeft, 0)}s
			</p>
			<div className="relative flex-1">
				<div ref={hostRef} className={`absolute inset-0 ${playing ? '' : 'pointer-events-none'}`} />
			</div>
		</div>
	)
}
