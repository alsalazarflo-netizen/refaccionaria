<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Refaccionaria</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-ink font-sans text-zinc-100">
	<Navbar />
	<main class="flex-1 pt-16">
		{@render children()}
	</main>
	<footer class="border-t border-line px-4 py-4 text-center text-sm text-muted">
		Evelyn Soto Avila · Alejandra Salazar Flores
	</footer>
</div>
