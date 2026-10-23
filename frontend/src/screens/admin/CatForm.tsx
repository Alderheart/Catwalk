// One form for every cat field, used both to edit an existing cat and to make
// a custom one. The pickers come from the server's trait lists, and the server
// validates whatever is sent, so this form only collects values.

import { useState, type FormEvent, type ReactNode } from 'react'
import type { Cat, CatFields, CatTraitOptions, Gender } from '../../api/cats.ts'

type Props = {
	options: CatTraitOptions
	// The cat being edited, or null to start a new one
	cat: Cat | null
	submitLabel: string
	pending: boolean
	onSubmit: (fields: CatFields) => void
	onCancel: () => void
}

const inputClass = 'min-h-11 w-full rounded-lg bg-stone-800 px-3 text-base'

export function CatForm({ options, cat, submitLabel, pending, onSubmit, onCancel }: Props) {
	const [traitA, traitB] = options.personalityTraits
	const [name, setName] = useState(cat?.name ?? '')
	const [breed, setBreed] = useState(cat?.breed ?? options.breeds[0])
	const [gender, setGender] = useState<Gender>(cat?.gender ?? options.genders[0])
	// Numbers are kept as text while typing, so the field can be emptied
	const [ageMoons, setAgeMoons] = useState(String(cat?.ageMoons ?? options.lifeStages[2]?.minAgeMoons ?? 12))
	const [xp, setXp] = useState(String(cat?.xp ?? 0))
	// Cats made before personalities existed get one when saved
	const [mainTrait, setMainTrait] = useState(cat?.personality?.mainTrait ?? traitA)
	const [sideTrait, setSideTrait] = useState(cat?.personality?.sideTrait ?? traitB)

	// The server refuses a side trait equal to the main one, so move it out of the way
	const changeMainTrait = (trait: string) => {
		setMainTrait(trait)
		if (trait === sideTrait) setSideTrait(options.personalityTraits.find((t) => t !== trait) ?? sideTrait)
	}

	const submit = (e: FormEvent) => {
		e.preventDefault()
		onSubmit({
			name,
			breed,
			gender,
			ageMoons: Number(ageMoons),
			xp: Number(xp),
			personality: { mainTrait, sideTrait },
		})
	}

	return (
		<form onSubmit={submit} className="flex flex-col gap-3">
			<Field label="Name">
				<input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required className={inputClass} />
			</Field>
			<div className="grid grid-cols-2 gap-3">
				<Field label="Breed">
					<select value={breed} onChange={(e) => setBreed(e.target.value)} className={inputClass}>
						{options.breeds.map((b) => (
							<option key={b}>{b}</option>
						))}
					</select>
				</Field>
				<Field label="Gender">
					<select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClass}>
						{options.genders.map((g) => (
							<option key={g}>{g}</option>
						))}
					</select>
				</Field>
			</div>
			<Field label="Age in moons">
				<input
					type="number"
					inputMode="numeric"
					min={0}
					max={options.maxAgeMoons}
					value={ageMoons}
					onChange={(e) => setAgeMoons(e.target.value)}
					required
					className={inputClass}
				/>
			</Field>
			{/* Shortcuts to the first moon of each stage. Stage itself is derived by the server */}
			<div className="flex gap-2">
				{options.lifeStages.map(({ stage, minAgeMoons }) => (
					<button
						key={stage}
						type="button"
						onClick={() => setAgeMoons(String(minAgeMoons))}
						className="min-h-11 flex-1 rounded-lg bg-stone-700 text-sm capitalize"
					>
						{stage}
					</button>
				))}
			</div>
			<Field label="XP">
				<input
					type="number"
					inputMode="numeric"
					min={0}
					max={options.maxXp}
					value={xp}
					onChange={(e) => setXp(e.target.value)}
					required
					className={inputClass}
				/>
			</Field>
			<div className="grid grid-cols-2 gap-3">
				<Field label="Main trait">
					<select value={mainTrait} onChange={(e) => changeMainTrait(e.target.value)} className={inputClass}>
						{options.personalityTraits.map((t) => (
							<option key={t}>{t}</option>
						))}
					</select>
				</Field>
				<Field label="Side trait">
					<select value={sideTrait} onChange={(e) => setSideTrait(e.target.value)} className={inputClass}>
						{options.personalityTraits
							.filter((t) => t !== mainTrait)
							.map((t) => (
								<option key={t}>{t}</option>
							))}
					</select>
				</Field>
			</div>
			<div className="flex gap-3 pt-1">
				<button type="button" onClick={onCancel} className="min-h-11 flex-1 rounded-lg bg-stone-700 font-semibold">
					Cancel
				</button>
				<button
					type="submit"
					disabled={pending}
					className="min-h-11 flex-1 rounded-lg bg-amber-600 font-semibold active:bg-amber-700 disabled:opacity-50"
				>
					{submitLabel}
				</button>
			</div>
		</form>
	)
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<label className="flex flex-col gap-1 text-sm text-stone-400">
			{label}
			{children}
		</label>
	)
}
