import { defineConfig } from '@happyvertical/smrt-config';

export default defineConfig({
  // Single owner, SQLite in the OS data directory, loopback only.
  runtime: { profile: 'local' },

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

  // `smrt app setup` / `smrt app migrate` set DATABASE_URL to the local data
  // path; `smrt db:migrate` reads it only from here.
  packages: {
    cli: {
      database: { type: 'sqlite', url: process.env.DATABASE_URL },
    },
  },
});
