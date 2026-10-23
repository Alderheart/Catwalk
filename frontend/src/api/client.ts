// Thin wrapper around fetch. In dev, Vite proxies /api to the backend.

// message is the backend's { error } text when it sent one, so the UI can show
// why a request was refused (for example "Dapple is already on a patrol")
export class ApiError extends Error {
	readonly status: number

	constructor(status: number, message: string) {
		super(message)
		this.status = status
	}
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`/api${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...init?.headers },
	})
	if (!res.ok) {
		const text = await res.text()
		let message = text
		try {
			message = (JSON.parse(text) as { error?: string }).error ?? text
		} catch {
			// Not JSON, so keep the raw text
		}
		throw new ApiError(res.status, message)
	}
	return res.json() as Promise<T>
}

// A message that is safe to show the player for any failed request
export function errorMessage(err: unknown, fallback: string): string {
	return err instanceof ApiError && err.status < 500 ? err.message : fallback
}
