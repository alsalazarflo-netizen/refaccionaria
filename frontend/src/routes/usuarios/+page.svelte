<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { api } from '$lib/api';
	import type { Usuario } from '$lib/types';

	let usuarios = $state<Usuario[]>([]);
	let error = $state('');
	let cargando = $state(true);

	onMount(() => {
		api<Usuario[]>('/api/usuarios')
			.then((data) => {
				usuarios = data;
			})
			.catch((err) => {
				error = err instanceof Error ? err.message : 'No se pudo cargar usuarios.';
			})
			.finally(() => {
				cargando = false;
			});
	});
</script>

<section class="mx-auto max-w-6xl px-4 py-10">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Cuentas</p>
			<h1 class="mt-2 text-3xl font-semibold tracking-tight">Usuarios</h1>
			<p class="mt-2 text-muted">Listado desde el API. Para crear uno usa Registro.</p>
		</div>
		<a
			class="rounded-lg bg-accent px-4 py-2 text-center text-sm font-medium text-white hover:bg-accent-hover"
			href="/registro"
		>
			Nuevo usuario
		</a>
	</div>

	{#if cargando}
		<p class="mt-8 text-muted">Cargando…</p>
	{:else if error}
		<p class="mt-8 text-accent">{error}</p>
	{:else if usuarios.length === 0}
		<p class="mt-8 text-muted">Aún no hay usuarios.</p>
	{:else}
		<div class="mt-8 overflow-x-auto rounded-xl border border-line bg-surface shadow-card" in:fly={{ y: 12, duration: 220 }}>
			<table class="w-full min-w-[32rem] text-left text-sm">
				<thead class="border-b border-line text-muted">
					<tr>
						<th class="px-4 py-3 font-medium">Nombre</th>
						<th class="px-4 py-3 font-medium">Correo</th>
						<th class="px-4 py-3 font-medium">Rol</th>
						<th class="px-4 py-3 font-medium">Teléfono</th>
					</tr>
				</thead>
				<tbody>
					{#each usuarios as u (u.id)}
						<tr class="border-b border-line/60 last:border-0">
							<td class="px-4 py-3">{u.nombre} {u.apellido}</td>
							<td class="px-4 py-3 text-muted">{u.correo}</td>
							<td class="px-4 py-3">{u.rol}</td>
							<td class="px-4 py-3 text-muted">{u.telefono || '—'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
