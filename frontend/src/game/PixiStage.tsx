// Mounts the Pixi canvas that fills its parent and runs the camp scene in it.
// Cats come in as props; the scene reports the focused cat back through onFocus.

import { Application } from 'pixi.js'
import { useEffect, useRef } from 'react'
import type { Cat } from '../api/cats.ts'
import { CampScene, type CatFocus } from './CampScene.ts'

type Props = {
	cats: Cat[]
	onFocus: (focus: CatFocus) => void
}

export function PixiStage({ cats, onFocus }: Props) {
	const hostRef = useRef<HTMLDivElement>(null)
	const sceneRef = useRef<CampScene | null>(null)
	// Read the latest props from inside the async init without restarting Pixi
	const catsRef = useRef(cats)
	const onFocusRef = useRef(onFocus)
	useEffect(() => {
		catsRef.current = cats
		onFocusRef.current = onFocus
	})

	useEffect(() => {
		const host = hostRef.current
		if (!host) return

		const app = new Application()
		let destroyed = false
		let ready = false

		app
			.init({
				resizeTo: host,
				backgroundAlpha: 0,
				antialias: true,
				autoDensity: true,
				resolution: Math.min(window.devicePixelRatio, 2),
			})
			.then(() => {
				ready = true
				if (destroyed) {
					app.destroy(true)
					return
				}
				host.appendChild(app.canvas)
				const scene = new CampScene(app, (focus) => onFocusRef.current(focus))
				scene.setCats(catsRef.current)
				sceneRef.current = scene
			})

		return () => {
			destroyed = true
			sceneRef.current?.destroy()
			sceneRef.current = null
			if (ready) app.destroy(true)
		}
	}, [])

	useEffect(() => {
		sceneRef.current?.setCats(cats)
	}, [cats])

	return <div ref={hostRef} className="absolute inset-0" />
}
