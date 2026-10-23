// Plays one hand of minigame cards, always in the same flow: shuffle the deck
// it is given, draw a hand, then play the cards one at a time, each as its own
// minigame. Every feature that uses minigames goes through this, so the flow
// only lives here. It only reports results; the caller asks the backend what
// they are worth.

import { useCallback, useState, type ReactNode } from 'react'
import { drawHand } from './deck.ts'
import type { CardResult, DeckEntry } from './types.ts'

type Props = {
	// Shown in the header, like "Hunting patrol"
	title: string
	deck: readonly DeckEntry[]
	handSize: number
	// Called once, when the player is done or leaves early, with the cards played so far
	onEnd: (results: CardResult[]) => void
}

// ready: card face up, waiting for Play. playing: the minigame is on screen.
// result: that card's outcome. summary: every card has been played
type Phase = 'ready' | 'playing' | 'result' | 'summary'

export function MinigameSession({ title, deck, handSize, onEnd }: Props) {
	// Drawn once per session, so re-renders don't reshuffle
	const [hand] = useState(() => drawHand(deck, handSize))
	const [index, setIndex] = useState(0)
	const [phase, setPhase] = useState<Phase>(hand.length > 0 ? 'ready' : 'summary')
	const [results, setResults] = useState<CardResult[]>([])
	const card = hand[index]
	const last = results[results.length - 1]

	const finish = useCallback(
		(won: boolean) => {
			setResults((prev) => [...prev, { card, won }])
			setPhase('result')
		},
		[card],
	)

	const next = () => {
		if (index + 1 >= hand.length) {
			setPhase('summary')
			return
		}
		setIndex(index + 1)
		setPhase('ready')
	}

	const wins = results.filter((r) => r.won).length

	return (
		<div className="absolute inset-0 z-30 flex flex-col bg-emerald-950">
			<header className="flex items-center justify-between p-4">
				<div>
					<h2 className="text-xl font-bold">{phase === 'summary' ? title : card.name}</h2>
					<p className="text-sm text-stone-300">
						{phase === 'summary' ? 'Every card played' : `${title} · card ${index + 1} of ${hand.length}`}
					</p>
				</div>
				{phase !== 'summary' && (
					<button
						type="button"
						onClick={() => onEnd(results)}
						className="min-h-11 rounded-lg bg-stone-700 px-4 font-semibold"
					>
						Leave
					</button>
				)}
			</header>

			{/* One row of cards, so the player can see how far through the hand they are */}
			<ol className="flex gap-2 px-4 pb-3">
				{hand.map((c, i) => {
					const result = results[i]
					const tone = result
						? result.won
							? 'bg-amber-600'
							: 'bg-stone-700 text-stone-400'
						: i === index
							? 'bg-emerald-700'
							: 'bg-emerald-900'
					return (
						<li
							key={i}
							className={`flex h-14 flex-1 items-center justify-center rounded-md text-center text-xs font-semibold ${tone}`}
						>
							{result || i === index ? c.name : '?'}
						</li>
					)
				})}
			</ol>

			<div className="relative flex flex-1 flex-col">
				{phase === 'ready' && (
					<Centered>
						<p className="text-2xl font-bold">{card.name}</p>
						<p className="text-stone-300">{card.howToPlay}</p>
						<PrimaryButton onClick={() => setPhase('playing')}>Play</PrimaryButton>
					</Centered>
				)}
				{/* Keyed by position, so two copies of the same card in a row still start fresh */}
				{phase === 'playing' && <card.Game key={index} onFinish={finish} />}
				{phase === 'result' && last && (
					<Centered>
						<p className="text-2xl font-bold">{last.won ? last.card.wonText : last.card.lostText}</p>
						<PrimaryButton onClick={next}>{index + 1 >= hand.length ? 'See results' : 'Next card'}</PrimaryButton>
					</Centered>
				)}
				{phase === 'summary' && (
					<Centered>
						<p className="text-2xl font-bold">
							Won {wins} of {hand.length}
						</p>
						<PrimaryButton onClick={() => onEnd(results)}>Done</PrimaryButton>
					</Centered>
				)}
			</div>
		</div>
	)
}

function Centered({ children }: { children: ReactNode }) {
	return <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">{children}</div>
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="min-h-11 rounded-lg bg-amber-600 px-6 font-semibold active:bg-amber-700"
		>
			{children}
		</button>
	)
}
