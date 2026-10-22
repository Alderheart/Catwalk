import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './generated/prisma/client.ts'

// The only file that knows which database we use. To move to Postgres, swap
// this adapter for @prisma/adapter-pg and change the provider in schema.prisma.
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' })

export const prisma = new PrismaClient({ adapter })
