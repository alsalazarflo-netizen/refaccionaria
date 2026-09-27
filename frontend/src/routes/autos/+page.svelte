<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { api } from '$lib/api';
	import AutoViewer from '$lib/components/AutoViewer.svelte';
	import { auth } from '$lib/stores/auth';
	import type { Auto, Usuario } from '$lib/types';

	let autos = $state<Auto[]>([]);
	let error = $state('');
	let cargando = $state(true);
	let seleccionado = $state<Auto | null>(null);
	let marca = $state('');
	let modelo = $state('');
	let anio = $state('2020');
	let placa = $state('');
	let formError = $state('');
	let enviando = $state(false);

	async function cargar() {
		cargando = true;
		try {
			autos = await api<Auto[]>('/api/autos');
			if (!seleccionado && autos[0]) seleccionado = autos[0];
			error = '';
		} catch {
			error = 'No se pudieron cargar los autos. ¿Está el API en el puerto 4000?';
		} finally {
			cargando = false;
		}
	}

	onMount(cargar);

	async function crear(e: Event) {
		e.preventDefault();
		formError = '';
		let usuarioId = $auth?.id;
		if (!usuarioId) {
			const users = await api<Usuario[]>('/api/usuarios');
			usuarioId = users[0]?.id;
		}
		if (!usuarioId) {
			formError = 'Regístrate o crea un usuario primero.';
			return;
		}
		enviando = true;
		try {
			const auto = await api<Auto>('/api/autos', {
				method: 'POST',
				body: JSON.stringify({
					usuario_id: usuarioId,
					marca,
					modelo,
					año: anio ? Number(anio) : null,
					placa: placa || null
				})
			});
			autos = [auto, ...autos];
			seleccionado = auto;
			marca = '';
			modelo = '';
			placa = '';
		} catch (err) {
			formError = err instanceof Error ? err.message : 'No se pudo guardar.';
		} finally {
			enviando = false;
		}
	}
</script>

<section class="mx-auto max-w-6xl px-4 py-10">
	<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Showroom</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight">Autos</h1>
	<p class="mt-2 max-w-2xl text-muted">
		Modelo 3D placeholder (geometrías). Arrastra para orbitar; al soltar, la rotación automática
		vuelve a los 2 segundos.
	</p>

	<div class="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
		<div>
			<AutoViewer />
			{#if seleccionado}
				<p class="mt-4 text-lg font-medium">
					{seleccionado.marca} {seleccionado.modelo}
					{#if seleccionado.año}<span class="text-muted"> · {seleccionado.año}</span>{/if}
				</p>
				{#if seleccionado.placa}
					<p class="text-sm text-muted">Placa {seleccionado.placa}</p>
				{/if}
			{/if}
		</div>

		<div class="space-y-6">
			{#if $auth?.rol === 'admin'}
			<form class="rounded-xl border border-line bg-surface p-4 shadow-card" onsubmit={crear}>
				<p class="mb-3 text-sm font-medium">Registrar auto</p>
				<input bind:value={marca} class="mb-2 w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Marca" required />
				<input bind:value={modelo} class="mb-2 w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Modelo" required />
				<input bind:value={anio} class="mb-2 w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Año" type="number" />
				<input bind:value={placa} class="mb-3 w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Placa" />
				{#if formError}
					<p class="mb-2 text-sm text-accent">{formError}</p>
				{/if}
				<button class="w-full rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60" disabled={enviando} type="submit">
					Guardar auto
				</button>
			</form>
			{/if}

			<div>
				<p class="mb-2 text-sm text-muted">Modelos</p>
				{#if cargando}
					<p class="text-muted">Cargando…</p>
				{:else if error}
					<p class="text-accent">{error}</p>
				{:else if autos.length === 0}
					<p class="text-muted">Aún no hay autos. Crea uno.</p>
				{:else}
					<ul class="space-y-2">
						{#each autos as auto (auto.id)}
							<li in:fly={{ y: 8, duration: 180 }}>
								<button
									type="button"
									class="w-full rounded-lg border px-3 py-2 text-left text-sm {seleccionado?.id === auto.id
										? 'border-accent bg-accent-soft'
										: 'border-line bg-surface hover:border-accent/40'}"
									onclick={() => (seleccionado = auto)}
								>
									{auto.marca} {auto.modelo}
									{#if auto.año}<span class="text-muted"> ({auto.año})</span>{/if}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
</section>
