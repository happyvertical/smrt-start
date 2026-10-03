import { createOwnerSetupPage } from '@happyvertical/smrt-app-runtime/sveltekit';

import { runtime } from '$lib/server/smrt';

export const { load, actions } = createOwnerSetupPage(runtime);
