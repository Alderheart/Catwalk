// HTTP endpoints for cats under /api/cats. Validates input with the trait lists
// from traits.ts and personality.ts, and returns cats through toDto() so
// lifeStage, level and personality are always included.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.ts'
import type { Cat, Personality } from '../generated/prisma/client.ts'
import { progressFor } from '../progression/level.ts'
import { generateCat } from './generate.ts'
import { LIFE_STAGES, lifeStageFor } from './lifeStage.ts'
import { generatePersonality, PERSONALITY_TRAITS } from './personality.ts'
import { BREEDS, GENDERS } from './traits.ts'

export const catsRouter = Router()

// Every cat sent to the client carries its derived life stage and level, and
// its personality as a nested object. Personality is null only for cats made
// before personalities existed.
function toDto(cat: Cat & { personality: Personality | null }) {
	const { personality, ...rest } = cat
	return {
		...rest,
		lifeStage: lifeStageFor(cat.ageMoons),
		...progressFor(cat.xp),
		personality: personality && { mainTrait: personality.mainTrait, sideTrait: personality.sideTrait },
	}
}

const createCatBody = z.object({
	name: z.string().trim().min(1).max(40),
	breed: z.enum(BREEDS),
	gender: z.enum(GENDERS),
	ageMoons: z.int().min(0).max(300),
	// Rolled by the server when left out
	personality: z
		.object({
			mainTrait: z.enum(PERSONALITY_TRAITS),
			sideTrait: z.enum(PERSONALITY_TRAITS),
		})
		.refine((p) => p.mainTrait !== p.sideTrait, 'mainTrait and sideTrait must differ')
		.optional(),
})

const randomCatBody = z.object({
	lifeStage: z.enum(LIFE_STAGES).optional(),
})

catsRouter.get('/', async (_req, res) => {
	const cats = await prisma.cat.findMany({
		include: { personality: true },
		orderBy: { createdAt: 'asc' },
	})
	res.json(cats.map(toDto))
})

catsRouter.get('/:id', async (req, res) => {
	const cat = await prisma.cat.findUnique({
		include: { personality: true },
		where: { id: req.params.id },
	})
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
	const cat = await prisma.cat.create({
		include: { personality: true },
		data: { ...fields, personality: { create: personality } },
	})
	res.status(201).json(toDto(cat))
})

// Generates a random cat and saves it. Optionally pin the life stage.
catsRouter.post('/random', async (req, res) => {
	const parsed = randomCatBody.safeParse(req.body ?? {})
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const { personality, ...fields } = generateCat(parsed.data)
	const cat = await prisma.cat.create({
		include: { personality: true },
		data: { ...fields, personality: { create: personality } },
	})
	res.status(201).json(toDto(cat))
})
