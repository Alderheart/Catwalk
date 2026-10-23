// The allowed values for each cat trait. Stored as plain strings in the
// database, so these lists are the source of truth for validation.

export const GENDERS = ['tom', 'she-cat', 'nonbinary'] as const
export type Gender = (typeof GENDERS)[number]

export const BREEDS = [
	'Domestic Shorthair',
	'Domestic Longhair',
	'Maine Coon',
	'Siamese',
	'Persian',
	'Bengal',
	'Ragdoll',
	'Norwegian Forest Cat',
	'Abyssinian',
	'Russian Blue',
	'Scottish Fold',
	'Sphynx',
] as const
export type Breed = (typeof BREEDS)[number]
