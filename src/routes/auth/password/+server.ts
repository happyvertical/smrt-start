import { error } from '@sveltejs/kit';

import { passwordAuth } from '$lib/server/password-auth';
import type { RequestHandler } from './$types';

// Live only while password sign-in is the selected provider, so choosing
// another one (SMRT_AUTHENTICATION_PROVIDER=oidc) also closes this route.
export const POST: RequestHandler = (event) => {
  if (process.env.SMRT_AUTHENTICATION_PROVIDER !== 'password') {
    error(404, 'Not found');
  }
  return passwordAuth.signIn(event);
};
