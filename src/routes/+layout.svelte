<script lang="ts">
	import '../app.css';
	import Footer from '../components/footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="theme-color" content="#fff" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Practice Math" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="flex h-screen flex-col">
  {@render children()}
	<Footer />
</div>
