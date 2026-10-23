import { api } from './client.ts'

// Mirrors the backend cat response (backend/src/cats). Frontend and backend
// share no code, so keep these in sync by hand.
export type LifeStage = 'kit' | 'adolescent' | 'adult' | 'elder'
export type Gender = 'tom' | 'she-cat' | 'nonbinary'

// Trait values come from backend/src/cats/personality.ts. Kept as string here
// because the UI only displays them
export type Personality = {
	mainTrait: string
	sideTrait: string
}

export type Cat = {
	id: string
	name: string
	breed: string
	gender: Gender
	ageMoons: number
	lifeStage: LifeStage
	xp: number
	// Derived from xp on the server (backend/src/progression/level.ts)
	level: number
	levelStartXp: number
	nextLevelXp: number
	// null only for cats made before personalities existed
	personality: Personality | null
	createdAt: string
	updatedAt: string
}

export const listCats = () => api<Cat[]>('/cats')

export const getCat = (id: string) => api<Cat>(`/cats/${id}`)

export const generateRandomCat = (lifeStage?: LifeStage) =>
	api<Cat>('/cats/random', { method: 'POST', body: JSON.stringify({ lifeStage }) })
