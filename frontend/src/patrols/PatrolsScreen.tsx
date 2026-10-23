// The patrols tab: patrols that are out, a builder for a new hunting patrol,
// the minigame that speeds one up, and the report when one comes home. Every
// outcome (timing, rewards) comes from the backend; this only shows it.

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Cat } from '../api/cats.ts'
import { errorMessage } from '../api/client.ts'
import {
	boostPatrol,
	collectPatrol,
	listPatrols,
	startPatrol,
	type Patrol,
	type PatrolRewards,
} from '../api/patrols.ts'
import { PounceGame } from '../minigames/PounceGame.tsx'
import { PatrolBuilder } from './PatrolBuilder.tsx'
import { PatrolCard } from './PatrolCard.tsx'
import { PatrolReport } from './PatrolReport.tsx'

type Props = {
	cats: Cat[]
	// Called after rewards land, so cat and camp levels can be refreshed
	onRewards: () => void
}

export function PatrolsScreen({ cats, onRewards }: Props) {
	const [patrols, setPatrols] = useState<Patrol[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [building, setBuilding] = useState(false)
	const [pending, setPending] = useState(false)
	const [minigameFor, setMinigameFor] = useState<string | null>(null)
	const [report, setReport] = useState<PatrolRewards | null>(null)
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		listPatrols()
			.then(setPatrols)
			.catch(() => setError('Could not reach the backend'))
	}, [])

	// Ticks the countdowns once a second
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(timer)
	}, [])

	const busyCatIds = useMemo(
		() => new Set((patrols ?? []).flatMap((p) => p.members.map((m) => m.catId))),
		[patrols],
	)

	const start = (leaderId: string, memberIds: string[]) => {
		setPending(true)
		setError(null)
		startPatrol({ type: 'hunting', leaderId, memberIds })
			.then((patrol) => {
				setPatrols((prev) => [...(prev ?? []), patrol])
				setBuilding(false)
			})
			.catch((err) => setError(errorMessage(err, 'Could not start the patrol')))
			.finally(() => setPending(false))
	}

	const collect = (id: string) => {
		setPending(true)
		setError(null)
		collectPatrol(id)
			.then((rewards) => {
				setPatrols((prev) => (prev ?? []).filter((p) => p.id !== id))
				setReport(rewards)
				onRewards()
			})
			.catch((err) => setError(errorMessage(err, 'Could not collect the patrol')))
			.finally(() => setPending(false))
	}

	const onMinigameWin = useCallback(() => {
		if (!minigameFor) return
		boostPatrol(minigameFor)
			.then((patrol) => setPatrols((prev) => (prev ?? []).map((p) => (p.id === patrol.id ? patrol : p))))
			.catch((err) => setError(errorMessage(err, 'Could not speed up the patrol')))
	}, [minigameFor])

	return (
		<section className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
			<header className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Patrols</h1>
					<p className="text-sm text-stone-400">
						{patrols === null ? 'Loading…' : `${patrols.length} out of camp`}
					</p>
				</div>
				{!building && (
					<button
						type="button"
						onClick={() => setBuilding(true)}
						className="min-h-11 rounded-lg bg-amber-600 px-4 font-semibold active:bg-amber-700"
					>
						New patrol
					</button>
				)}
			</header>

			{error && <p className="rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}

			{building && (
				<PatrolBuilder
					cats={cats}
					busyCatIds={busyCatIds}
					starting={pending}
					onStart={start}
					onCancel={() => setBuilding(false)}
				/>
			)}

			{patrols?.map((patrol) => (
				<PatrolCard
					key={patrol.id}
					patrol={patrol}
					now={now}
					busy={pending}
					onPlay={() => setMinigameFor(patrol.id)}
					onCollect={() => collect(patrol.id)}
				/>
			))}

			{patrols?.length === 0 && !building && (
				<p className="rounded-lg bg-stone-800 p-4 text-stone-300">
					No patrols are out. Send a hunting patrol to bring back prey and experience.
				</p>
			)}

			{minigameFor && <PounceGame onWin={onMinigameWin} onClose={() => setMinigameFor(null)} />}
			{report && <PatrolReport rewards={report} onDone={() => setReport(null)} />}
		</section>
	)
}
