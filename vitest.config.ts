import { smrtVitestPlugin } from '@happyvertical/smrt-vitest';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    sveltekit(),
    smrtVitestPlugin({ include: ['src/lib/models/**/*.ts'] }),
  ],
  test: { include: ['tests/**/*.test.ts'] },
});
