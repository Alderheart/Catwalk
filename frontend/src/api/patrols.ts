import { api } from './client.ts'
import type { Camp } from './camp.ts'

// Mirrors the backend patrol responses (backend/src/patrols). Frontend and
// backend share no code, so keep these in sync by hand.
export type PatrolType = 'hunting'
export type PatrolRole = 'leader' | 'member'

export type Patrol = {
	id: string
	type: PatrolType
	status: 'active' | 'completed'
	// Leader first
	members: { catId: string; name: string; role: PatrolRole }[]
	startedAt: string
	endsAt: string
	// Whether it was back when the server answered
	ready: boolean
	boostsLeft: number
}

export type PatrolRewards = {
	items: { itemKey: string; name: string; quantity: number }[]
	cats: { catId: string; name: string; caught: number; xp: number; level: number; leveledUp: boolean }[]
	camp: Camp & { xpGained: number; leveledUp: boolean }
}

export const listPatrols = () => api<Patrol[]>('/patrols')

export const startPatrol = (body: { type: PatrolType; leaderId: string; memberIds: string[] }) =>
	api<Patrol>('/patrols', { method: 'POST', body: JSON.stringify(body) })

// Call once a hand of minigame cards is over, with how many were won (at least 1)
export const boostPatrol = (id: string, wins: number) =>
	api<Patrol>(`/patrols/${id}/boost`, { method: 'POST', body: JSON.stringify({ wins }) })

export const collectPatrol = (id: string) => api<PatrolRewards>(`/patrols/${id}/collect`, { method: 'POST' })
