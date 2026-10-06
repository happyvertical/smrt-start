import { mountMcpProtectedResourceMetadataRoute } from '@happyvertical/smrt-app-mcp/sveltekit';

import { runtime } from '$lib/server/smrt';

/** RFC 9728 metadata for `/mcp` bearer challenges (404 in the local profile). */
export const GET = mountMcpProtectedResourceMetadataRoute({ runtime });
