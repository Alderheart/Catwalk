// Owns a Pixi Application's lifecycle inside a React component. Pixi init is
// async, so this handles the component unmounting before init finishes
// (StrictMode does that on every mount in dev).

import { Application } from 'pixi.js'
import { useEffect, useRef, type RefObject } from 'react'

// mount runs once the canvas is ready and returns its own cleanup, which runs
// before the app is destroyed
export function usePixiApp(hostRef: RefObject<HTMLDivElement | null>, mount: (app: Application) => () => void) {
	// Read the latest mount from inside the async init without restarting Pixi
	const mountRef = useRef(mount)
	useEffect(() => {
		mountRef.current = mount
	})

	useEffect(() => {
		const host = hostRef.current
		if (!host) return

		const app = new Application()
		let destroyed = false
		let ready = false
		let unmount: (() => void) | null = null

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
				unmount = mountRef.current(app)
			})

		return () => {
			destroyed = true
			unmount?.()
			if (ready) app.destroy(true)
		}
	}, [hostRef])
}
