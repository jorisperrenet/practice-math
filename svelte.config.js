import adapter from '@sveltejs/adapter-static';
import htmlMinifierAdapter from 'sveltekit-html-minifier';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
	    appDir: 'static',
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: htmlMinifierAdapter(adapter()),
		paths: {
            base: process.env.NODE_ENV === 'production' ? '/practice-math' : '',
        }
    }
};

export default config;
