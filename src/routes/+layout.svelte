<script lang="ts">
	import favicon from '$lib/theme/favicon.svg';
	import '$lib/theme/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
