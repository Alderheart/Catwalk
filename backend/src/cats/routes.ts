// HTTP endpoints for cats under /api/cats. Validates input with the trait lists
// from traits.ts and returns cats through toDto() so lifeStage is always included.

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db.ts'
import type { Cat } from '../generated/prisma/client.ts'
import { generateCat } from './generate.ts'
import { LIFE_STAGES, lifeStageFor } from './lifeStage.ts'
import { BREEDS, GENDERS } from './traits.ts'

export const catsRouter = Router()

// Every cat sent to the client carries its derived life stage
function toDto(cat: Cat) {
	return { ...cat, lifeStage: lifeStageFor(cat.ageMoons) }
}

const createCatBody = z.object({
	name: z.string().trim().min(1).max(40),
	breed: z.enum(BREEDS),
	gender: z.enum(GENDERS),
	ageMoons: z.int().min(0).max(300),
})

const randomCatBody = z.object({
	lifeStage: z.enum(LIFE_STAGES).optional(),
})

catsRouter.get('/', async (_req, res) => {
	const cats = await prisma.cat.findMany({ orderBy: { createdAt: 'asc' } })
	res.json(cats.map(toDto))
})

catsRouter.get('/:id', async (req, res) => {
	const cat = await prisma.cat.findUnique({ where: { id: req.params.id } })
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
	const cat = await prisma.cat.create({ data: parsed.data })
	res.status(201).json(toDto(cat))
})

// Generates a random cat and saves it. Optionally pin the life stage.
catsRouter.post('/random', async (req, res) => {
	const parsed = randomCatBody.safeParse(req.body ?? {})
	if (!parsed.success) {
		res.status(400).json({ error: z.prettifyError(parsed.error) })
		return
	}
	const cat = await prisma.cat.create({ data: generateCat(parsed.data) })
	res.status(201).json(toDto(cat))
})
