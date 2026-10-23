// HTTP endpoints for cats under /api/cats. Validates input with the trait lists
// from traits.ts and personality.ts, and returns cats through toDto() so
// lifeStage, level and personality are always included. Setting xp (on create
// or PATCH) is for the admin panel; nothing in normal play calls it.

import { Router } from 'express'
import { z } from 'zod'
import { progressFor } from '../progression/level.ts'
import { generateCat } from './generate.ts'
import { AGE_RANGES, LIFE_STAGES, lifeStageFor } from './lifeStage.ts'
import { generatePersonality, PERSONALITY_TRAITS } from './personality.ts'
import { createCat, findCat, listCats, updateCat, type CatWithPersonality } from './service.ts'
import { BREEDS, GENDERS } from './traits.ts'

export const catsRouter = Router()

// Every cat sent to the client carries its derived life stage and level, and
// its personality as a nested object. Personality is null only for cats made
// before personalities existed.
function toDto(cat: CatWithPersonality) {
	const { personality, ...rest } = cat
	return {
		...rest,
		lifeStage: lifeStageFor(cat.ageMoons),
		...progressFor(cat.xp),
		personality: personality && { mainTrait: personality.mainTrait, sideTrait: personality.sideTrait },
	}
}

const MAX_AGE_MOONS = 300
const MAX_XP = 1_000_000

const personalityBody = z
	.object({
		mainTrait: z.enum(PERSONALITY_TRAITS),
		sideTrait: z.enum(PERSONALITY_TRAITS),
	})
	.refine((p) => p.mainTrait !== p.sideTrait, 'mainTrait and sideTrait must differ')

const catFields = {
	name: z.string().trim().min(1).max(40),
	breed: z.enum(BREEDS),
	gender: z.enum(GENDERS),
	ageMoons: z.int().min(0).max(MAX_AGE_MOONS),
	xp: z.int().min(0).max(MAX_XP),
}

const createCatBody = z.object({
	...catFields,
	xp: catFields.xp.optional(),
	// Rolled by the server when left out
	personality: personalityBody.optional(),
})

// Every field is optional, so the admin panel can send only what changed
const updateCatBody = z.object({ ...catFields, personality: personalityBody }).partial()

const randomCatBody = z.object({
	lifeStage: z.enum(LIFE_STAGES).optional(),
})

catsRouter.get('/', async (_req, res) => {
	const cats = await listCats()
	res.json(cats.map(toDto))
})

// The allowed values for every editable field, so the admin panel's pickers
// can't drift from the lists the server validates against
catsRouter.get('/traits', (_req, res) => {
	res.json({
		breeds: BREEDS,
		genders: GENDERS,
		personalityTraits: PERSONALITY_TRAITS,
		lifeStages: LIFE_STAGES.map((stage) => ({ stage, minAgeMoons: AGE_RANGES[stage][0] })),
		maxAgeMoons: MAX_AGE_MOONS,
		maxXp: MAX_XP,
	})
})

catsRouter.get('/:id', async (req, res) => {
	const cat = await findCat(req.params.id)
	if (!cat) {
		res.status(404).json({ error: 'Cat not found' })
		return
	}
	res.json(toDto(cat))
})

catsRouter.post('/', async (req, res) => {
	const parsed = createCatBody.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const { personality = generatePersonality(), ...fields } = parsed.data
	const cat = await createCat({ ...fields, personality })
	res.status(201).json(toDto(cat))
})

// Generates a random cat and saves it. Optionally pin the life stage.
catsRouter.post('/random', async (req, res) => {
	const parsed = randomCatBody.safeParse(req.body ?? {})
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const cat = await createCat(generateCat(parsed.data))
	res.status(201).json(toDto(cat))
})

catsRouter.patch('/:id', async (req, res) => {
	const parsed = updateCatBody.safeParse(req.body)
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const cat = await updateCat(req.params.id, parsed.data)
	if (!cat) {
		res.status(404).json({ error: 'Cat not found' })
		return
	}
	res.json(toDto(cat))
})
