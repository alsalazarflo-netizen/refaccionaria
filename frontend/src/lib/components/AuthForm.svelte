<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { api, ApiError } from '$lib/api';
	import { auth } from '$lib/stores/auth';
	import type { Usuario } from '$lib/types';
	import { isEmail, minLen } from '$lib/validation';

	let { modo }: { modo: 'login' | 'registro' } = $props();

	let nombre = $state('');
	let apellido = $state('');
	let correo = $state('');
	let password = $state('');
	let confirmacion = $state('');
	let enviado = $state(false);
	let cargando = $state(false);
	let errorApi = $state('');

	const esRegistro = $derived(modo === 'registro');

	const errNombre = $derived(!minLen(nombre, 2) ? 'Mínimo 2 caracteres.' : '');
	const errApellido = $derived(!minLen(apellido, 2) ? 'Mínimo 2 caracteres.' : '');
	const errCorreo = $derived(!isEmail(correo) ? 'Correo inválido.' : '');
	const errPass = $derived(!minLen(password, 6) ? 'Mínimo 6 caracteres.' : '');
	const errConfirm = $derived(password !== confirmacion ? 'Las contraseñas no coinciden.' : '');

	const valido = $derived(
		!errCorreo &&
			!errPass &&
			(!esRegistro || (!errNombre && !errApellido && !errConfirm))
	);

	function mostrar(err: string, valor: string) {
		return (enviado || valor.length > 0) && err;
	}

	async function onSubmit(e: Event) {
		e.preventDefault();
		enviado = true;
		errorApi = '';
		if (!valido) return;

		cargando = true;
		try {
			if (esRegistro) {
				const usuario = await api<Usuario>('/api/auth/register', {
					method: 'POST',
					body: JSON.stringify({
						nombre: nombre.trim(),
						apellido: apellido.trim(),
						correo: correo.trim(),
						password
					})
				});
				auth.setUsuario(usuario);
			} else {
				const data = await api<{ usuario: Usuario; token: string }>('/api/auth/login', {
					method: 'POST',
					body: JSON.stringify({ correo: correo.trim(), password })
				});
				auth.setUsuario(data.usuario, data.token);
			}
			await goto('/perfil');
		} catch (err) {
			errorApi = err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.';
		} finally {
			cargando = false;
		}
	}
</script>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
	<div
		class="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-card md:p-8"
		in:fly={{ y: 16, duration: 280 }}
	>
		{#key modo}
			<div in:fade={{ duration: 180 }}>
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Acceso</p>
				<h1 class="mt-2 text-2xl font-semibold tracking-tight">
					{esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
				</h1>
				<p class="mt-2 text-sm text-muted">
					{esRegistro ? 'Regístrate para gestionar autos y pedidos.' : 'Entra con tu correo y contraseña.'}
				</p>

				<form class="mt-6 space-y-4" onsubmit={onSubmit}>
					{#if esRegistro}
						<label class="block">
							<span class="mb-1 block text-sm text-muted">Nombre</span>
							<input
								bind:value={nombre}
								class="w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent"
								autocomplete="given-name"
							/>
							{#if mostrar(errNombre, nombre)}
								<p class="mt-1 text-xs text-accent">{errNombre}</p>
							{/if}
						</label>
						<label class="block">
							<span class="mb-1 block text-sm text-muted">Apellido</span>
							<input
								bind:value={apellido}
								class="w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent"
								autocomplete="family-name"
							/>
							{#if mostrar(errApellido, apellido)}
								<p class="mt-1 text-xs text-accent">{errApellido}</p>
							{/if}
						</label>
					{/if}

					<label class="block">
						<span class="mb-1 block text-sm text-muted">Email</span>
						<input
							bind:value={correo}
							class="w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent"
							type="email"
							autocomplete="email"
						/>
						{#if mostrar(errCorreo, correo)}
							<p class="mt-1 text-xs text-accent">{errCorreo}</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm text-muted">Contraseña</span>
						<input
							bind:value={password}
							class="w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent"
							type="password"
							autocomplete={esRegistro ? 'new-password' : 'current-password'}
						/>
						{#if mostrar(errPass, password)}
							<p class="mt-1 text-xs text-accent">{errPass}</p>
						{/if}
					</label>

					{#if esRegistro}
						<label class="block">
							<span class="mb-1 block text-sm text-muted">Confirmar contraseña</span>
							<input
								bind:value={confirmacion}
								class="w-full rounded-lg border border-line bg-ink px-3 py-2 outline-none focus:border-accent"
								type="password"
								autocomplete="new-password"
							/>
							{#if mostrar(errConfirm, confirmacion)}
								<p class="mt-1 text-xs text-accent">{errConfirm}</p>
							{/if}
						</label>
					{/if}

					{#if errorApi}
						<p class="text-sm text-accent">{errorApi}</p>
					{/if}

					<button
						class="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
						disabled={cargando}
						type="submit"
					>
						{cargando ? 'Enviando…' : esRegistro ? 'Registrarme' : 'Entrar'}
					</button>
				</form>

				<p class="mt-5 text-center text-sm text-muted">
					{#if esRegistro}
						¿Ya tienes cuenta?
						<a class="text-white underline-offset-2 hover:underline" href="/login">Inicia sesión</a>
					{:else}
						¿No tienes cuenta?
						<a class="text-white underline-offset-2 hover:underline" href="/registro">Regístrate</a>
					{/if}
				</p>
			</div>
		{/key}
	</div>
</div>
