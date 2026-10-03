import { mountMcpProtectedResourceMetadataRoute } from '@happyvertical/smrt-app-mcp/sveltekit';

import { mcpAuth } from '$lib/server/mcp';

/** RFC 9728 metadata for `/mcp` bearer challenges (404 in the local profile). */
export const GET = mountMcpProtectedResourceMetadataRoute(mcpAuth);
