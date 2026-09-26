<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { createCarPlaceholder } from '$lib/three/car';

	const COLORES = [
		{ id: 'plateado', hex: '#c5c8ce', label: 'Plateado' },
		{ id: 'negro', hex: '#111111', label: 'Negro' },
		{ id: 'blanco', hex: '#f4f4f4', label: 'Blanco' }
	] as const;

	let canvas: HTMLCanvasElement | undefined;
	let colorActivo = $state<(typeof COLORES)[number]['id']>('plateado');

	let renderer: THREE.WebGLRenderer | undefined;
	let scene: THREE.Scene | undefined;
	let camera: THREE.PerspectiveCamera | undefined;
	let controls: OrbitControls | undefined;
	let car: THREE.Group | undefined;
	let frame = 0;
	let autoRotar = true;
	let resumeTimer: ReturnType<typeof setTimeout> | undefined;

	function aplicarColor(hex: string) {
		const paint = car?.userData.paint as THREE.MeshStandardMaterial | undefined;
		paint?.color.set(hex);
	}

	function elegir(id: (typeof COLORES)[number]['id'], hex: string) {
		colorActivo = id;
		aplicarColor(hex);
	}

	onMount(() => {
		if (!canvas) return;
		scene = new THREE.Scene();
		scene.background = new THREE.Color(0x0a0a0a);

		camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
		camera.position.set(3.4, 1.8, 3.2);

		renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
		renderer.setClearColor(0x0a0a0a, 1);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.shadowMap.enabled = true;
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		const key = new THREE.DirectionalLight(0xffffff, 2.2);
		key.position.set(4, 6, 5);
		key.castShadow = true;
		const fill = new THREE.DirectionalLight(0xb0c4de, 0.55);
		fill.position.set(-5, 2, 2);
		const rim = new THREE.DirectionalLight(0xffffff, 1.35);
		rim.position.set(0, 3.5, -6);
		scene.add(new THREE.AmbientLight(0xffffff, 0.22), key, fill, rim);

		const floor = new THREE.Mesh(
			new THREE.CircleGeometry(4.2, 48),
			new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.2, roughness: 0.9 })
		);
		floor.rotation.x = -Math.PI / 2;
		floor.receiveShadow = true;
		scene.add(floor);

		car = createCarPlaceholder(COLORES[0].hex);
		scene.add(car);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.target.set(0, 0.5, 0);
		controls.maxPolarAngle = Math.PI / 1.7;
		controls.minDistance = 2.2;
		controls.maxDistance = 8;
		controls.addEventListener('start', () => {
			autoRotar = false;
			if (resumeTimer) clearTimeout(resumeTimer);
		});
		controls.addEventListener('end', () => {
			if (resumeTimer) clearTimeout(resumeTimer);
			resumeTimer = setTimeout(() => {
				autoRotar = true;
			}, 2000);
		});

		const resize = () => {
			if (!camera || !renderer || !canvas.parentElement) return;
			const w = canvas.parentElement.clientWidth;
			const h = Math.max(320, Math.round(w * 0.52));
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h, false);
		};
		resize();
		window.addEventListener('resize', resize);

		const tick = () => {
			frame = requestAnimationFrame(tick);
			if (autoRotar && car) car.rotation.y += 0.006;
			controls?.update();
			if (scene && camera) renderer?.render(scene, camera);
		};
		tick();

		return () => {
			window.removeEventListener('resize', resize);
		};
	});

	onDestroy(() => {
		cancelAnimationFrame(frame);
		if (resumeTimer) clearTimeout(resumeTimer);
		controls?.dispose();
		renderer?.dispose();
	});
</script>

<div>
	<div class="min-h-[360px] overflow-hidden rounded-xl border border-line bg-ink">
		<canvas bind:this={canvas} class="block h-[360px] w-full"></canvas>
	</div>
	<div class="mt-4 flex items-center gap-3">
		<p class="text-sm text-muted">Color</p>
		{#each COLORES as c (c.id)}
			<button
				type="button"
				class="h-8 w-8 rounded-full border-2 {colorActivo === c.id ? 'border-accent' : 'border-line'}"
				style="background:{c.hex}"
				aria-label={c.label}
				onclick={() => elegir(c.id, c.hex)}
			></button>
		{/each}
	</div>
</div>
