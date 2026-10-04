import { defineConfig } from '@happyvertical/smrt-config';

// No `runtime` block: the local profile (single owner, SQLite in the OS data
// directory, loopback only) is the default.
export default defineConfig({
  // s-m-r-t packages whose models this app uses. Their tables are migrated
  // with the app's own (`pnpm db:migrate`).
  consumer: {
    packages: [
      '@happyvertical/smrt-chat',
      '@happyvertical/smrt-profiles',
      '@happyvertical/smrt-tenancy',
      '@happyvertical/smrt-users',
    ],
  },

  // The assistant's model. The key is read from the named environment
  // variable (put it in `.env`); it is never stored in this file.
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-5-5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
  },
});
