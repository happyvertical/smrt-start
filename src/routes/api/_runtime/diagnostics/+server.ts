import { createRuntimeDiagnosticsHandler } from '@happyvertical/smrt-app-runtime/sveltekit';

import { runtime } from '$lib/server/smrt';

export const GET = createRuntimeDiagnosticsHandler({ runtime });
