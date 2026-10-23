// The bottom tab bar. Adding a screen means adding it to SCREENS here and
// rendering it in App.tsx.

export type Screen = 'camp' | 'patrols' | 'inventory'

const SCREENS: { id: Screen; label: string }[] = [
	{ id: 'camp', label: 'Camp' },
	{ id: 'patrols', label: 'Patrols' },
	{ id: 'inventory', label: 'Inventory' },
]

type Props = {
	current: Screen
	onChange: (screen: Screen) => void
}

export function TabBar({ current, onChange }: Props) {
	return (
		<nav className="z-10 flex border-t border-stone-700">
			{SCREENS.map(({ id, label }) => (
				<button
					key={id}
					type="button"
					onClick={() => onChange(id)}
					aria-current={current === id ? 'page' : undefined}
					className={`min-h-12 flex-1 font-semibold ${current === id ? 'text-amber-500' : 'text-stone-400'}`}
				>
					{label}
				</button>
			))}
		</nav>
	)
}
