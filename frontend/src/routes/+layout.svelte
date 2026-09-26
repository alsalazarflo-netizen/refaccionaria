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

<div class="min-h-screen bg-ink font-sans text-zinc-100">
	<Navbar />
	<main class="pt-16">
		{@render children()}
	</main>
</div>
