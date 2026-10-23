// Database access for the camp. No HTTP here.

import { prisma } from '../../platform/db.ts'

// Creates the camp if it's missing, so players made before camps existed still get one
export function getCamp(playerId: string) {
	return prisma.camp.upsert({
		where: { playerId },
		update: {},
		create: { playerId },
	})
}
