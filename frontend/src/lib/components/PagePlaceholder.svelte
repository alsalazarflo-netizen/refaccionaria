<script lang="ts">
	let { title, hint }: { title: string; hint: string } = $props();
</script>

<section class="mx-auto max-w-6xl px-4 py-10">
	<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Módulo</p>
	<h1 class="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
	<p class="mt-3 max-w-xl text-muted">{hint}</p>
	<div class="mt-8 rounded-xl border border-line bg-surface p-6 shadow-card">
		<p class="text-sm text-muted">Esta pantalla se conectará al API en el siguiente paso.</p>
	</div>
</section>
