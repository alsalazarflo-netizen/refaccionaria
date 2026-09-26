<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';

	function salir() {
		auth.logout();
		goto('/login');
	}
</script>

<section class="mx-auto max-w-xl px-4 py-10">
	<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Cuenta</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight">Perfil</h1>

	{#if $auth}
		<div class="mt-8 rounded-xl border border-line bg-surface p-6 shadow-card">
			<p class="text-lg font-medium">{$auth.nombre} {$auth.apellido}</p>
			<p class="mt-1 text-sm text-muted">{$auth.correo}</p>
			<p class="mt-3 text-sm text-muted">Rol: {$auth.rol}</p>
			{#if $auth.telefono}
				<p class="mt-1 text-sm text-muted">Tel: {$auth.telefono}</p>
			{/if}
			<button
				class="mt-6 rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-white"
				type="button"
				onclick={salir}
			>
				Cerrar sesión
			</button>
		</div>
	{:else}
		<div class="mt-8 rounded-xl border border-line bg-surface p-6 shadow-card">
			<p class="text-muted">No hay sesión activa.</p>
			<a class="mt-4 inline-block text-sm text-accent hover:underline" href="/login">Ir a iniciar sesión</a>
		</div>
	{/if}
</section>
