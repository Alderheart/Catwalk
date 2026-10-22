import { Application, Graphics } from 'pixi.js'
import { useEffect, useRef } from 'react'

// Mounts a Pixi canvas that fills its parent. Game scenes will draw into this.
export function PixiStage() {
	const hostRef = useRef<HTMLDivElement>(null)

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

				const ball = new Graphics().circle(0, 0, 24).fill(0xf59e0b)
				app.stage.addChild(ball)

				let t = 0
				app.ticker.add((ticker) => {
					t += ticker.deltaTime / 60
					ball.x = app.screen.width / 2 + Math.cos(t) * app.screen.width * 0.3
					ball.y = app.screen.height / 2 + Math.sin(t * 2) * app.screen.height * 0.15
				})
			})

		return () => {
			destroyed = true
			if (ready) app.destroy(true)
		}
	}, [])

	return <div ref={hostRef} className="absolute inset-0" />
}
