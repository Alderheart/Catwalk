// Builds the Express app and mounts every router under /api. Kept separate from
// index.ts so the app can be imported by tests without opening a port.

import express from 'express'
import { campRouter } from './camp/routes.ts'
import { catsRouter } from './cats/routes.ts'
import { prisma } from './db.ts'
import { inventoryRouter } from './inventory/routes.ts'
import { patrolsRouter } from './patrols/routes.ts'

export const app = express()

app.use(express.json())

app.get('/api/health', async (_req, res) => {
	let db = false
	try {
		await prisma.$queryRaw`SELECT 1`
		db = true
	} catch {
		// Report the database as down instead of failing the health check
	}
	res.json({ ok: true, db })
})

app.use('/api/cats', catsRouter)
app.use('/api/patrols', patrolsRouter)
app.use('/api/camp', campRouter)
app.use('/api/inventory', inventoryRouter)
