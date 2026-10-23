// Mounts the Pixi canvas that fills its parent and runs the camp scene in it.
// Cats come in as props; the scene reports the focused cat back through onFocus.

import { useEffect, useRef } from 'react'
import type { Cat } from '../api/cats.ts'
import { CampScene, type CatFocus } from './CampScene.ts'
import { usePixiApp } from './usePixiApp.ts'

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

	usePixiApp(hostRef, (app) => {
		const scene = new CampScene(app, (focus) => onFocusRef.current(focus))
		scene.setCats(catsRef.current)
		sceneRef.current = scene
		return () => {
			scene.destroy()
			sceneRef.current = null
		}
	})

	useEffect(() => {
		sceneRef.current?.setCats(cats)
	}, [cats])

	return <div ref={hostRef} className="absolute inset-0" />
}
