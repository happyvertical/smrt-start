import { smrt } from '@happyvertical/smrt-core/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), smrt({ objectsDir: 'src/lib/models' })],
});
