// Where the camp and each cat's placeholder square sit on screen. Pure math with
// no Pixi, so layout rules stay easy to read and change. Positions are visual
// only and are not game state, so they are fine to compute on the client.

export type Rect = { x: number; y: number; width: number; height: number }

// Space between the camp edge and the canvas edge, and between the camp edge and the cats
const CAMP_MARGIN = 16
const CAMP_PADDING = 16

// Squares stay at least a touch target wide until the camp is too full to allow it
const MIN_CAT_SIZE = 44
const MAX_CAT_SIZE = 64

// The biggest square that fits the screen, centred
export function campRect(screenWidth: number, screenHeight: number): Rect {
	const size = Math.max(0, Math.min(screenWidth, screenHeight) - CAMP_MARGIN * 2)
	return {
		x: (screenWidth - size) / 2,
		y: (screenHeight - size) / 2,
		width: size,
		height: size,
	}
}

// Lays cats out on an even grid inside the camp, in the order given
export function catRects(count: number, camp: Rect): Rect[] {
	if (count === 0) return []
	const cols = Math.ceil(Math.sqrt(count))
	const rows = Math.ceil(count / cols)
	const inner = camp.width - CAMP_PADDING * 2
	const cell = inner / cols
	const size = Math.min(MAX_CAT_SIZE, Math.max(Math.min(MIN_CAT_SIZE, cell * 0.8), cell * 0.6))
	const top = camp.y + CAMP_PADDING + (inner - rows * cell) / 2

	return Array.from({ length: count }, (_, i) => {
		const col = i % cols
		const row = Math.floor(i / cols)
		return {
			x: camp.x + CAMP_PADDING + col * cell + (cell - size) / 2,
			y: top + row * cell + (cell - size) / 2,
			width: size,
			height: size,
		}
	})
}
