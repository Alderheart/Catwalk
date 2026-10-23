// The pounce minigame's game world: a mouse that hops around and must be
// tapped. It only counts hits; the timer, score and win check are React's
// (see PounceGame.tsx), and the reward is the backend's.

import { Graphics, type Application } from 'pixi.js'

// Big enough to stay a comfortable touch target
const RADIUS = 28
// The mouse hops on its own this often, and right away when hit
const HOP_MS = 900

export class PounceScene {
	private readonly app: Application
	private readonly onHit: () => void
	private readonly mouse = new Graphics()
	private sinceHop = 0

	constructor(app: Application, onHit: () => void) {
		this.app = app
		this.onHit = onHit

		this.mouse.circle(0, 0, RADIUS).fill(0x78716c).stroke({ width: 3, color: 0xe7e5e4 })
		// Ears, so it reads as a mouse rather than a dot
		this.mouse.circle(-16, -22, 9).fill(0x78716c).circle(16, -22, 9).fill(0x78716c)
		this.mouse.eventMode = 'static'
		this.mouse.cursor = 'pointer'
		this.mouse.on('pointerdown', () => {
			this.onHit()
			this.hop()
		})

		app.stage.addChild(this.mouse)
		app.ticker.add(this.tick)
		app.renderer.on('resize', this.hop)
		this.hop()
	}

	destroy() {
		this.app.ticker.remove(this.tick)
		this.app.renderer.off('resize', this.hop)
	}

	private readonly tick = () => {
		this.sinceHop += this.app.ticker.deltaMS
		if (this.sinceHop >= HOP_MS) this.hop()
	}

	// Jumps to a random spot that keeps the whole mouse on screen
	private readonly hop = () => {
		this.sinceHop = 0
		const { width, height } = this.app.screen
		const margin = RADIUS + 12
		this.mouse.position.set(
			margin + Math.random() * Math.max(0, width - margin * 2),
			margin + Math.random() * Math.max(0, height - margin * 2),
		)
	}
}
