import { smrt } from '@happyvertical/smrt-core/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { notesEnabled } from './src/lib/features.ts';

export default defineConfig({
  plugins: [
    sveltekit(),
    smrt({
      objectsDir: 'src/lib/models',
      // The Notes example is built only while `notesEnabled()` (see features.ts).
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        ...(notesEnabled() ? [] : ['**/Note.ts']),
      ],
    }),
  ],
});
