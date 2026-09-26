import { env } from '$env/dynamic/public';

const BASE = env.PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
	const { headers, signal, ...rest } = init ?? {};
	const res = await fetch(`${BASE}${path}`, {
		...rest,
		headers: { 'Content-Type': 'application/json', ...(headers as HeadersInit) },
		signal: signal ?? AbortSignal.timeout(10000)
	});
	const body = await res.json().catch(() => ({}));
	if (!res.ok) {
		throw new ApiError(res.status, body.error || 'Error en el servidor.');
	}
	return body as T;
}
