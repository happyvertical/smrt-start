import { smrtVitestPlugin } from '@happyvertical/smrt-vitest';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

import { notesEnabled } from './src/lib/features.ts';

export default defineConfig({
  plugins: [
    sveltekit(),
    smrtVitestPlugin({
      include: ['src/lib/models/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        ...(notesEnabled() ? [] : ['**/Note.ts']),
      ],
    }),
  ],
  test: { include: ['tests/**/*.test.ts'] },
});
