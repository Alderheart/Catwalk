import { api } from './client.ts'

// Mirrors the backend patrol response (backend/src/patrols). Placeholder shapes
// until patrols are designed; keep in sync by hand.
export type PatrolType = 'hunting' | 'border' | 'training' | 'herb'

export type Patrol = {
	id: string
	type: PatrolType
	catIds: string[]
}

export const listPatrols = () => api<Patrol[]>('/patrols')
