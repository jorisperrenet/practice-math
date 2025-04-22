<script lang="ts">
	import '../app.css';
	import Footer from '../components/Footer.svelte';
	import { pageDescription, pageTitle } from '../const.ts';

	let { children } = $props();
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="theme-color" content="#fff" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
</svelte:head>

<div class="flex h-screen flex-col">
  {@render children()}
	<Footer />
</div>
