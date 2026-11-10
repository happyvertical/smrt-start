import { defineConfig } from '@happyvertical/smrt-config';

import { modelPackages } from './src/lib/features.ts';

// No `runtime` block: the profile comes from the environment. Unset it is
// `local` (single owner, SQLite in the OS data directory, loopback only); the
// container stack sets SMRT_RUNTIME_PROFILE=self-hosted, which selects
// PostgreSQL, public authentication and separate workers (see compose.yaml).
export default defineConfig({
  // s-m-r-t packages whose models this app uses. Their tables are migrated
  // with the app's own (`pnpm db:migrate`). The list is every s-m-r-t
  // dependency in package.json that publishes models (see `modelPackages`),
  // so `smrt cookbook apply` extends it by adding dependencies.
  consumer: {
    packages: modelPackages(),
  },

  // The assistant's model. The key is read from the named environment
  // variable (put it in `.env`); it is never stored in this file.
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-5-5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
  },
});
