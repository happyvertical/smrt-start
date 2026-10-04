import { createSmrtSvelteKitRuntime } from '@happyvertical/smrt-app-runtime/sveltekit';

/** Local profile: SQLite outside the checkout, single owner, signed session. */
export const runtime = createSmrtSvelteKitRuntime();
