<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { api } from '$lib/api';
	import PiezaCard from '$lib/components/PiezaCard.svelte';
	import type { Pieza } from '$lib/types';

	let piezas = $state<Pieza[]>([]);
	let error = $state('');
	let cargando = $state(true);
	let busqueda = $state('');
	let busquedaDebounced = $state('');
	let categoria = $state('todas');

	$effect(() => {
		const q = busqueda;
		const t = setTimeout(() => {
			busquedaDebounced = q;
		}, 300);
		return () => clearTimeout(t);
	});

	let mostrarForm = $state(false);
	let formError = $state('');
	let enviando = $state(false);
	let nombre = $state('');
	let codigo = $state('');
	let precio = $state('');
	let stock = $state('10');
	let catNueva = $state('Motor');
	let marcaNueva = $state('');

	async function cargar() {
		cargando = true;
		try {
			piezas = await api<Pieza[]>('/api/piezas');
			error = '';
		} catch {
			error = 'No se pudo cargar el catálogo. ¿Está el API en el puerto 4000?';
		} finally {
			cargando = false;
		}
	}

	onMount(cargar);

	async function crearPieza(e: Event) {
		e.preventDefault();
		formError = '';
		enviando = true;
		try {
			const pieza = await api<Pieza>('/api/piezas', {
				method: 'POST',
				body: JSON.stringify({
					nombre,
					codigo,
					precio: Number(precio),
					stock: Number(stock),
					categoria: catNueva,
					marca: marcaNueva || null
				})
			});
			piezas = [pieza, ...piezas];
			nombre = '';
			codigo = '';
			precio = '';
			mostrarForm = false;
		} catch (err) {
			formError = err instanceof Error ? err.message : 'No se pudo guardar.';
		} finally {
			enviando = false;
		}
	}

	const categorias = $derived([
		'todas',
		...[...new Set(piezas.map((p) => p.categoria).filter(Boolean))] as string[]
	]);

	const filtradas = $derived(
		piezas.filter((p) => {
			const q = busquedaDebounced.trim().toLowerCase();
			const okCat = categoria === 'todas' || p.categoria === categoria;
			const okQ =
				!q ||
				p.nombre.toLowerCase().includes(q) ||
				(p.marca ?? '').toLowerCase().includes(q) ||
				p.codigo.toLowerCase().includes(q);
			return okCat && okQ;
		})
	);
</script>

<section class="mx-auto max-w-6xl px-4 py-10">
	<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Inventario</p>
	<div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<h1 class="text-3xl font-semibold tracking-tight">Piezas</h1>
		<button
			class="rounded-lg border border-line px-4 py-2 text-sm hover:border-accent/50"
			type="button"
			onclick={() => (mostrarForm = !mostrarForm)}
		>
			{mostrarForm ? 'Cerrar' : 'Agregar pieza'}
		</button>
	</div>

	{#if mostrarForm}
		<form class="mt-4 grid gap-2 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3" onsubmit={crearPieza}>
			<input bind:value={nombre} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Nombre" required />
			<input bind:value={codigo} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Código" required />
			<input bind:value={precio} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Precio" type="number" step="0.01" required />
			<input bind:value={stock} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Stock" type="number" />
			<input bind:value={marcaNueva} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Marca" />
			<input bind:value={catNueva} class="rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent" placeholder="Categoría" />
			{#if formError}
				<p class="text-sm text-accent sm:col-span-2">{formError}</p>
			{/if}
			<button class="rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60 sm:col-span-2 lg:col-span-3" disabled={enviando} type="submit">
				Guardar
			</button>
		</form>
	{/if}

	<div class="mt-6 flex flex-col gap-3 sm:flex-row">
		<input
			bind:value={busqueda}
			class="w-full rounded-lg border border-line bg-surface px-3 py-2 outline-none focus:border-accent sm:max-w-sm"
			placeholder="Buscar por nombre, marca o código"
			type="search"
		/>
		<select
			bind:value={categoria}
			class="rounded-lg border border-line bg-surface px-3 py-2 outline-none focus:border-accent"
		>
			{#each categorias as cat (cat)}
				<option value={cat}>{cat === 'todas' ? 'Todas las categorías' : cat}</option>
			{/each}
		</select>
	</div>

	{#if cargando}
		<p class="mt-8 text-muted">Cargando…</p>
	{:else if error}
		<p class="mt-8 text-accent">{error}</p>
	{:else if filtradas.length === 0}
		<p class="mt-8 text-muted">No hay piezas que coincidan.</p>
	{:else}
		<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtradas as pieza (pieza.id)}
				<div in:fly={{ y: 12, duration: 220 }} out:fade={{ duration: 120 }}>
					<PiezaCard {pieza} />
				</div>
			{/each}
		</div>
	{/if}
</section>
