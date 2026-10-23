// Draws the camp and one placeholder square per cat, and reports which cat is
// being looked at. It does not render the cat info itself: that is React UI
// (see CatTooltip.tsx), so this only hands back the cat and its square.

import { Container, Graphics, type Application, type FederatedPointerEvent } from 'pixi.js'
import type { Cat, LifeStage } from '../../api/cats.ts'
import { campRect, catRects, type Rect } from './campLayout.ts'

// rect is in the stage's CSS pixels, so the DOM can line up with it
export type CatFocus = { cat: Cat; rect: Rect; stageWidth: number } | null

const STAGE_COLORS: Record<LifeStage, number> = {
	kit: 0xfde68a,
	adolescent: 0xfbbf24,
	adult: 0xd97706,
	elder: 0xa8a29e,
}

export class CampScene {
	private readonly app: Application
	private readonly onFocus: (focus: CatFocus) => void
	private readonly ground = new Graphics()
	private readonly catLayer = new Container()
	private cats: Cat[] = []
	private squares: { cat: Cat; rect: Rect; square: Graphics }[] = []
	// Hover only comes from a mouse; a tap pins a cat until something else is tapped
	private hoveredId: string | null = null
	private pinnedId: string | null = null

	constructor(app: Application, onFocus: (focus: CatFocus) => void) {
		this.app = app
		this.onFocus = onFocus

		// Tapping empty space clears the pinned cat
		app.stage.eventMode = 'static'
		app.stage.hitArea = app.screen
		app.stage.on('pointertap', () => this.setPinned(null))

		app.stage.addChild(this.ground, this.catLayer)
		app.renderer.on('resize', this.redraw)
		this.redraw()
	}

	setCats(cats: Cat[]) {
		this.cats = cats
		if (!cats.some((c) => c.id === this.pinnedId)) this.pinnedId = null
		if (!cats.some((c) => c.id === this.hoveredId)) this.hoveredId = null
		this.redraw()
	}

	destroy() {
		this.app.renderer.off('resize', this.redraw)
	}

	private setPinned(id: string | null) {
		this.pinnedId = id
		this.refreshFocus()
	}

	private setHovered(id: string | null) {
		if (this.hoveredId === id) return
		this.hoveredId = id
		this.refreshFocus()
	}

	// Rebuilds every square. Only runs when the cats or the screen size change,
	// so hover doesn't recreate the object under the pointer
	private readonly redraw = () => {
		const camp = campRect(this.app.screen.width, this.app.screen.height)
		this.ground
			.clear()
			.roundRect(camp.x, camp.y, camp.width, camp.height, 12)
			.fill(0x3f6212)
			.stroke({ width: 2, color: 0x65a30d })

		for (const child of this.catLayer.removeChildren()) child.destroy()
		this.squares = []

		const rects = catRects(this.cats.length, camp)
		this.cats.forEach((cat, i) => {
			const square = new Graphics()
			square.eventMode = 'static'
			square.cursor = 'pointer'
			square.on('pointerover', (e: FederatedPointerEvent) => {
				if (e.pointerType === 'mouse') this.setHovered(cat.id)
			})
			square.on('pointerout', (e: FederatedPointerEvent) => {
				if (e.pointerType === 'mouse' && this.hoveredId === cat.id) this.setHovered(null)
			})
			square.on('pointertap', (e: FederatedPointerEvent) => {
				e.stopPropagation()
				this.setPinned(this.pinnedId === cat.id ? null : cat.id)
			})
			this.catLayer.addChild(square)
			this.squares.push({ cat, rect: rects[i], square })
		})

		this.refreshFocus()
	}

	// Outlines the focused cat and tells React which one it is
	private refreshFocus() {
		const focusedId = this.hoveredId ?? this.pinnedId
		let focus: CatFocus = null
		for (const { cat, rect, square } of this.squares) {
			square
				.clear()
				.roundRect(rect.x, rect.y, rect.width, rect.height, 6)
				.fill(STAGE_COLORS[cat.lifeStage])
			if (cat.id === focusedId) {
				square.stroke({ width: 3, color: 0xfafaf9 })
				focus = { cat, rect, stageWidth: this.app.screen.width }
			}
		}
		this.onFocus(focus)
	}
}
