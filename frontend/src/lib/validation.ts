export function isEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function minLen(value: string, n: number) {
	return value.trim().length >= n;
}
