<script lang="ts">
	import type { Pieza } from '$lib/types';

	let { pieza }: { pieza: Pieza } = $props();

	const agotado = $derived(pieza.stock <= 0);
</script>

<article
	class="overflow-hidden rounded-xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:border-accent/40"
>
	<div class="flex h-36 items-center justify-center bg-gradient-to-br from-surface-raised to-ink">
		<span class="text-4xl font-semibold text-white/15">{pieza.nombre.slice(0, 1)}</span>
	</div>
	<div class="p-4">
		<p class="text-xs uppercase tracking-wider text-accent">{pieza.categoria || 'General'}</p>
		<h2 class="mt-1 font-medium">{pieza.nombre}</h2>
		<p class="mt-2 text-lg font-semibold">${Number(pieza.precio).toFixed(2)}</p>
		<p class="mt-1 text-sm {agotado ? 'text-accent' : 'text-muted'}">
			{agotado ? 'Sin stock' : `Stock: ${pieza.stock}`}
		</p>
	</div>
</article>
