import express from 'express'
import { prisma } from './db.ts'

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
