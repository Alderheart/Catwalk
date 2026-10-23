// Turns experience into a level, for cats and the camp alike. Level is never
// stored, only xp, so the curve can be retuned without migrating any data.

// XP needed to go from one level to the next grows by this much each level:
// level 2 at 100, level 3 at 300, level 4 at 600, and so on
const XP_STEP = 100

// Total xp at which a level starts
export function xpForLevel(level: number): number {
	return (XP_STEP * level * (level - 1)) / 2
}

export function levelFor(xp: number): number {
	let level = 1
	while (xp >= xpForLevel(level + 1)) level++
	return level
}

// What the client needs to draw a level and a progress bar
export function progressFor(xp: number) {
	const level = levelFor(xp)
	return { level, levelStartXp: xpForLevel(level), nextLevelXp: xpForLevel(level + 1) }
}
