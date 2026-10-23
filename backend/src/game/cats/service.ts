// Database access for cats. Every query includes the personality, so callers
// always get the row shape toDto() in routes.ts expects. No HTTP here.

import type { Cat, Personality } from '../../generated/prisma/client.ts'
import { prisma } from '../../platform/db.ts'
import type { CatTraits } from './generate.ts'

export type CatWithPersonality = Cat & { personality: Personality | null }

const withPersonality = { personality: true } as const

export function listCats(): Promise<CatWithPersonality[]> {
	return prisma.cat.findMany({ include: withPersonality, orderBy: { createdAt: 'asc' } })
}

export function findCat(id: string): Promise<CatWithPersonality | null> {
	return prisma.cat.findUnique({ include: withPersonality, where: { id } })
}

// Saves a cat and its personality together, so no cat is ever made without one
export function createCat({ personality, ...fields }: CatTraits): Promise<CatWithPersonality> {
	return prisma.cat.create({
		include: withPersonality,
		data: { ...fields, personality: { create: personality } },
	})
}
