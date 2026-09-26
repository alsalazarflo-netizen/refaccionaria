import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { Usuario } from '$lib/types';

const KEY = 'refaccionaria.usuario';

function leer(): Usuario | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as Usuario) : null;
	} catch {
		return null;
	}
}

function crearStore() {
	const { subscribe, set } = writable<Usuario | null>(leer());

	return {
		subscribe,
		setUsuario(u: Usuario) {
			if (browser) localStorage.setItem(KEY, JSON.stringify(u));
			set(u);
		},
		logout() {
			if (browser) localStorage.removeItem(KEY);
			set(null);
		}
	};
}

export const auth = crearStore();
