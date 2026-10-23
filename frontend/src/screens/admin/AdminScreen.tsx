// The admin panel, opened from the camp header: dev tools for testing, not part
// of normal play. Adds random or custom cats, edits any field of an existing
// cat, and launches a single minigame card on its own. Every change still goes
// through the backend, which validates it like any other request.

import { useEffect, useState, type ReactNode } from 'react'
import {
	createCat,
	generateRandomCat,
	getCatTraits,
	updateCat,
	type Cat,
	type CatFields,
	type CatTraitOptions,
	type LifeStage,
} from '../../api/cats.ts'
import { errorMessage } from '../../api/client.ts'
import { ALL_CARDS } from '../../minigames/cards.ts'
import { MinigameSession } from '../../minigames/MinigameSession.tsx'
import type { CardResult, MinigameCard } from '../../minigames/types.ts'
import { CatForm } from './CatForm.tsx'

type Props = {
	cats: Cat[]
	// Called after any cat is added or changed, so every screen sees it
	onCatsChanged: () => void
	onBack: () => void
}

// home: the panel. edit: the form for one cat. new: the form for a custom cat
type View = { kind: 'home' } | { kind: 'edit'; cat: Cat } | { kind: 'new' }

export function AdminScreen({ cats, onCatsChanged, onBack }: Props) {
	const [options, setOptions] = useState<CatTraitOptions | null>(null)
	const [view, setView] = useState<View>({ kind: 'home' })
	const [playing, setPlaying] = useState<MinigameCard | null>(null)
	const [pending, setPending] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [notice, setNotice] = useState<string | null>(null)

	useEffect(() => {
		getCatTraits()
			.then(setOptions)
			.catch(() => setError('Could not reach the backend'))
	}, [])

	// Runs one request at a time and reports how it went at the top of the panel
	const run = (request: Promise<Cat>, done: (cat: Cat) => string, failed: string) => {
		setPending(true)
		setError(null)
		setNotice(null)
		request
			.then((cat) => {
				setNotice(done(cat))
				setView({ kind: 'home' })
				onCatsChanged()
			})
			.catch((err) => setError(errorMessage(err, failed)))
			.finally(() => setPending(false))
	}

	const addRandom = (lifeStage?: LifeStage) =>
		run(generateRandomCat(lifeStage), (cat) => `Added ${cat.name}`, 'Could not add a cat')

	const saveNew = (fields: CatFields) => run(createCat(fields), (cat) => `Added ${cat.name}`, 'Could not add the cat')

	const saveEdit = (id: string, fields: CatFields) =>
		run(updateCat(id, fields), (cat) => `Saved ${cat.name}`, 'Could not save the cat')

	// A test play reports nothing to the backend, so it can't change any patrol
	const endMinigame = (results: CardResult[]) => {
		setPlaying(null)
		setError(null)
		setNotice(results.length === 0 ? 'Left the minigame' : results[0].won ? 'Minigame won' : 'Minigame lost')
	}

	if (view.kind !== 'home' && options) {
		const cat = view.kind === 'edit' ? view.cat : null
		return (
			<section className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
				<h1 className="text-2xl font-bold">{cat ? `Edit ${cat.name}` : 'Custom cat'}</h1>
				{error && <p className="text-sm text-red-400">{error}</p>}
				<CatForm
					// Keyed so switching cats starts the form fresh
					key={cat?.id ?? 'new'}
					options={options}
					cat={cat}
					submitLabel={cat ? 'Save' : 'Add cat'}
					pending={pending}
					onSubmit={(fields) => (cat ? saveEdit(cat.id, fields) : saveNew(fields))}
					onCancel={() => {
						setError(null)
						setView({ kind: 'home' })
					}}
				/>
			</section>
		)
	}

	return (
		<>
			<header className="z-10 flex items-center justify-between p-4">
				<div>
					<h1 className="text-2xl font-bold">Admin</h1>
					<p className="text-sm text-stone-400">Testing tools</p>
				</div>
				<button type="button" onClick={onBack} className="min-h-11 rounded-lg bg-stone-700 px-4 font-semibold">
					Back to camp
				</button>
			</header>
			<section className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4">
				{(error || notice) && (
					<p className={`rounded-lg bg-stone-800 p-3 text-sm ${error ? 'text-red-400' : 'text-stone-300'}`}>
						{error ?? notice}
					</p>
				)}

				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Add cats</h2>
					<div className="grid grid-cols-3 gap-2">
						<SmallButton disabled={pending} onClick={() => addRandom()}>
							Random
						</SmallButton>
						{options?.lifeStages.map(({ stage }) => (
							<SmallButton key={stage} disabled={pending} onClick={() => addRandom(stage)}>
								<span className="capitalize">{stage}</span>
							</SmallButton>
						))}
						<button
							type="button"
							disabled={!options}
							onClick={() => setView({ kind: 'new' })}
							className="min-h-11 rounded-lg bg-amber-600 text-sm font-semibold active:bg-amber-700 disabled:opacity-50"
						>
							Custom
						</button>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Edit cats</h2>
					{cats.length === 0 && <p className="text-sm text-stone-400">No cats yet.</p>}
					<ul className="flex flex-col gap-2">
						{cats.map((cat) => (
							<li key={cat.id}>
								<button
									type="button"
									disabled={!options}
									onClick={() => {
										setError(null)
										setView({ kind: 'edit', cat })
									}}
									className="flex min-h-11 w-full items-center justify-between rounded-lg bg-stone-800 px-3 py-2 text-left"
								>
									<span className="font-semibold">{cat.name}</span>
									<span className="text-sm text-stone-400">
										<span className="capitalize">{cat.lifeStage}</span> · Lv {cat.level}
										{cat.personality && ` · ${cat.personality.mainTrait}/${cat.personality.sideTrait}`}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>

				<div className="flex flex-col gap-2">
					<h2 className="text-lg font-semibold">Minigames</h2>
					<p className="text-sm text-stone-400">Plays one card on its own. Nothing is rewarded.</p>
					<ul className="flex flex-col gap-2">
						{ALL_CARDS.map((card) => (
							<li key={card.key} className="flex items-center justify-between gap-3 rounded-lg bg-stone-800 p-3">
								<div>
									<p className="font-semibold">{card.name}</p>
									<p className="text-sm text-stone-400">{card.howToPlay}</p>
								</div>
								<SmallButton onClick={() => setPlaying(card)}>Play</SmallButton>
							</li>
						))}
					</ul>
				</div>
			</section>
			{playing && (
				<MinigameSession
					title="Admin test"
					deck={[{ card: playing, copies: 1 }]}
					handSize={1}
					onEnd={endMinigame}
				/>
			)}
		</>
	)
}

function SmallButton({
	onClick,
	disabled,
	children,
}: {
	onClick: () => void
	disabled?: boolean
	children: ReactNode
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="min-h-11 shrink-0 rounded-lg bg-stone-700 px-4 text-sm font-semibold disabled:opacity-50"
		>
			{children}
		</button>
	)
}
