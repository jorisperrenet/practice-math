<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';
	import SiteShell from '$lib/site-kit/SiteShell.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#fff" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Practice Math" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<SiteShell projectName="Practice Math" currentProjectId="practice-math" projectHref="/practice-math/" logoSrc={`${base}/personal-logo.svg`} sourceHref="https://github.com/jorisperrenet/practice-math">
	{@render children()}
</SiteShell>
