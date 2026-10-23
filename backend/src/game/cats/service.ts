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

// Saves a cat and its personality together, so no cat is ever made without one.
// xp is only set by the admin panel; new cats normally start at 0
export function createCat({ personality, ...fields }: CatTraits & { xp?: number }): Promise<CatWithPersonality> {
	return prisma.cat.create({
		include: withPersonality,
		data: { ...fields, personality: { create: personality } },
	})
}

export type CatChanges = Partial<Omit<CatTraits, 'personality'>> & {
	xp?: number
	personality?: CatTraits['personality']
}

// Admin edits. Personality is upserted because cats made before personalities
// existed have no row yet. Returns null when there is no such cat
export async function updateCat(id: string, { personality, ...fields }: CatChanges): Promise<CatWithPersonality | null> {
	return prisma.$transaction(async (tx) => {
		const existing = await tx.cat.findUnique({ where: { id } })
		if (!existing) return null
		return tx.cat.update({
			include: withPersonality,
			where: { id },
			data: {
				...fields,
				...(personality && { personality: { upsert: { create: personality, update: personality } } }),
			},
		})
	})
}
