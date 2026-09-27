<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { auth } from '$lib/stores/auth';

	const links = [
		{ href: '/usuarios', label: 'Usuarios' },
		{ href: '/piezas', label: 'Piezas' },
		{ href: '/autos', label: 'Autos' },
		{ href: '/perfil', label: 'Perfil' }
	];

	const visibles = $derived(
		links.filter((link) => link.href !== '/usuarios' || $auth?.rol === 'admin')
	);

	let abierto = $state(false);

	function activo(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<header
	class="fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/90 backdrop-blur-md"
>
	<nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
		<a href="/" class="flex items-center gap-2 font-semibold tracking-tight">
			<span class="h-2.5 w-2.5 rounded-full bg-accent shadow-glow"></span>
			<span>Refaccionaria</span>
		</a>

		<div class="hidden items-center gap-1 md:flex">
			{#each visibles as link (link.href)}
				<a
					href={link.href}
					class="rounded-md px-3 py-2 text-sm transition-colors {activo(link.href)
						? 'bg-accent-soft text-white'
						: 'text-muted hover:text-white'}"
				>
					{link.label}
				</a>
			{/each}
			{#if !$auth}
				<a
					href="/login"
					class="ml-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover {activo('/login') || activo('/registro')
						? 'ring-1 ring-white/20'
						: ''}"
				>
					Entrar
				</a>
			{/if}
		</div>

		<button
			type="button"
			class="rounded-md border border-line px-3 py-1.5 text-sm text-muted md:hidden"
			aria-expanded={abierto}
			aria-label="Abrir menú"
			onclick={() => (abierto = !abierto)}
		>
			Menú
		</button>
	</nav>

	{#if abierto}
		<div
			class="border-t border-line bg-surface px-4 py-3 md:hidden"
			transition:fly={{ y: -8, duration: 180 }}
		>
			{#each visibles as link (link.href)}
				<a
					href={link.href}
					class="block rounded-md px-3 py-2 text-sm {activo(link.href)
						? 'bg-accent-soft text-white'
						: 'text-muted'}"
					onclick={() => (abierto = false)}
				>
					{link.label}
				</a>
			{/each}
			{#if !$auth}
				<a
					href="/login"
					class="mt-1 block rounded-md bg-accent px-3 py-2 text-sm text-white"
					onclick={() => (abierto = false)}
				>
					Entrar
				</a>
			{/if}
		</div>
	{/if}
</header>
