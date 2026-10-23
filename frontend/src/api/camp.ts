import { api } from './client.ts'

// Mirrors the backend camp response (backend/src/game/camp). Keep in sync by hand.
export type Camp = {
	xp: number
	level: number
	levelStartXp: number
	nextLevelXp: number
}

export const getCamp = () => api<Camp>('/camp')
