// Shapes for the patrols domain. Placeholder until patrol gameplay is designed:
// nothing here is stored yet, and the lists may change freely.

// Provisional, borrowed from ClanGen. Replace once patrols are designed
export const PATROL_TYPES = ['hunting', 'border', 'training', 'herb'] as const
export type PatrolType = (typeof PATROL_TYPES)[number]

export type Patrol = {
	id: string
	type: PatrolType
	catIds: string[]
}
