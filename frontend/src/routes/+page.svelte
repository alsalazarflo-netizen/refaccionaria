<section class="mx-auto max-w-6xl px-4 py-12">
	<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent">Showroom digital</p>
	<h1 class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
		Refaccionaria automotriz
	</h1>
	<p class="mt-4 max-w-xl text-muted">
		Login, usuarios, piezas y visor 3D de autos ya están conectados.
	</p>

	<div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each [
			{ href: '/usuarios', label: 'Usuarios', desc: 'Cuentas y roles' },
			{ href: '/piezas', label: 'Piezas', desc: 'Catálogo e inventario' },
			{ href: '/autos', label: 'Autos', desc: 'Vitrina 3D' },
			{ href: '/perfil', label: 'Perfil', desc: 'Sesión del cliente' }
		] as card (card.href)}
			<a
				href={card.href}
				class="rounded-xl border border-line bg-surface p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent/50"
			>
				<h2 class="font-medium">{card.label}</h2>
				<p class="mt-1 text-sm text-muted">{card.desc}</p>
			</a>
		{/each}
	</div>
</section>
