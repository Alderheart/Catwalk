import { api } from './client.ts'

// Mirrors the backend cat response (backend/src/game/cats). Frontend and backend
// share no code, so keep these in sync by hand.
export type LifeStage = 'kit' | 'adolescent' | 'adult' | 'elder'
export type Gender = 'tom' | 'she-cat' | 'nonbinary'

// Trait values come from backend/src/game/cats/personality.ts. Kept as string here
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
	// Derived from xp on the server (backend/src/game/progression/level.ts)
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

// The allowed values for every editable field, from GET /cats/traits. Fetched
// rather than copied so the admin panel's pickers match what the server accepts
export type CatTraitOptions = {
	breeds: string[]
	genders: Gender[]
	personalityTraits: string[]
	// The first moon of each life stage, oldest last
	lifeStages: { stage: LifeStage; minAgeMoons: number }[]
	maxAgeMoons: number
	maxXp: number
}

// What the admin panel can set on a cat. On create, personality is rolled by
// the server when left out and xp defaults to 0
export type CatFields = {
	name: string
	breed: string
	gender: Gender
	ageMoons: number
	xp: number
	personality: Personality
}

export const getCatTraits = () => api<CatTraitOptions>('/cats/traits')

export const createCat = (fields: CatFields) => api<Cat>('/cats', { method: 'POST', body: JSON.stringify(fields) })

export const updateCat = (id: string, changes: Partial<CatFields>) =>
	api<Cat>(`/cats/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
