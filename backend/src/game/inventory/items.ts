// Every kind of item the player can hold. The database stores item keys as
// plain strings, so this list is the source of truth for what a key means.

export const ITEMS = {
	mouse: { name: 'Mouse', category: 'prey' },
	vole: { name: 'Vole', category: 'prey' },
	sparrow: { name: 'Sparrow', category: 'prey' },
	squirrel: { name: 'Squirrel', category: 'prey' },
	rabbit: { name: 'Rabbit', category: 'prey' },
} as const

export type ItemKey = keyof typeof ITEMS
export type ItemCategory = (typeof ITEMS)[ItemKey]['category']

export function isItemKey(key: string): key is ItemKey {
	return Object.hasOwn(ITEMS, key)
}
