<script lang="ts">
	import favicon from '$lib/theme/favicon.svg';
	import '$lib/theme/global.css';
	import Topbar from '$lib/theme/Topbar.svelte';
	import Footer from '$lib/theme/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<Topbar />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>

<style>
	.shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}
</style>
