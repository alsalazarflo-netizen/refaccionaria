<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import { auth } from '$lib/stores/auth';

	onMount(() => {
		if ($auth?.rol !== 'admin') goto('/piezas?aviso=permisos');
	});
</script>

<AuthForm modo="registro" />
