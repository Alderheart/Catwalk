// How long patrols take and how minigames shorten them. Pure functions of the
// clock, so routes.ts passes in "now" and tests can too.

// Running on its own, a hunting patrol takes this long. Overridable so it can
// be tested without waiting half an hour
export const PATROL_DURATION_MS = (Number(process.env.HUNTING_PATROL_MINUTES) || 30) * 60_000

// Each minigame won takes this share of the full duration off the remaining time
const BOOST_SHARE = 1 / 6
export const MAX_BOOSTS = 4

// The client reports minigame wins, so the server can't check them. These two
// limits cap what a faked win can gain: at most MAX_BOOSTS in total, and no
// more than one report (one hand of cards) per cooldown
export const BOOST_COOLDOWN_MS = 5_000

export function patrolEndsAt(startedAt: Date): Date {
	return new Date(startedAt.getTime() + PATROL_DURATION_MS)
}

export function isReady(patrol: { endsAt: Date }, now: Date): boolean {
	return now >= patrol.endsAt
}

type BoostState = { endsAt: Date; boostCount: number; lastBoostAt: Date | null }

// Why a boost isn't allowed right now, or null if it is
export function boostBlocker(patrol: BoostState, now: Date): string | null {
	if (isReady(patrol, now)) return 'Patrol is already back'
	if (patrol.boostCount >= MAX_BOOSTS) return 'No minigames left for this patrol'
	if (patrol.lastBoostAt && now.getTime() - patrol.lastBoostAt.getTime() < BOOST_COOLDOWN_MS) {
		return 'Too soon after the last minigame'
	}
	return null
}

// Never moves the end time into the past, so a boosted patrol is simply ready
export function boostedEndsAt(endsAt: Date, now: Date, boosts = 1): Date {
	const cut = PATROL_DURATION_MS * BOOST_SHARE * boosts
	return new Date(Math.max(now.getTime(), endsAt.getTime() - cut))
}
