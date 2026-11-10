import { createPasswordCredentialHandlers } from '@happyvertical/smrt-users/sveltekit';

/**
 * Email and password sign-in for the container (`self-hosted`) profile. The
 * local profile signs the owner in through the one-time setup link and never
 * calls this. It is the default sign-in provider (SMRT_AUTHENTICATION_PROVIDER
 * =password); replace it with your own before real use (see README).
 */
export const passwordAuth = createPasswordCredentialHandlers({
  db: { type: 'postgres', url: process.env.DATABASE_URL },
  tenantId: 'unique-active-membership',
});
