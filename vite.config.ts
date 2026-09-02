import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

// `npm run dev` liest .env sonst NICHT in process.env ein — src/lib/server/llm.ts
// (und jeder andere Server-Code, der process.env direkt liest) sähe ICA_API_KEY
// etc. nie, ohne dass es einen Fehler gibt: der Provider fiele still auf 'mock'
// zurück. loadEnv() ist Teil von Vite selbst, keine neue Abhängigkeit.
export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

	return {
		server: {
			port: 5174
		},
		plugins: [
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
				// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
				// See https://svelte.dev/docs/kit/adapters for more information about adapters.
				adapter: adapter()
			})
		]
	};
});
