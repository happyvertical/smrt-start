import { mountMcpAppRoute } from '@happyvertical/smrt-app-mcp/sveltekit';

import { Note } from '$lib/models/Note';
import { mcpAuth } from '$lib/server/mcp';
import { runtime } from '$lib/server/smrt';

/**
 * Remote MCP: read-only Note tools for a principal holding `notes.read` (the
 * signed-in session, or a client with a token from `smrt app token`).
 */
export const POST = mountMcpAppRoute({
  models: [Note],
  requiredScopes: ['notes.read'],
  effects: ['read'],
  smrtOptions: () => ({ db: runtime.databaseConfig() }),
  auth: mcpAuth,
  bindPrincipal: runtime.runAsPrincipal,
});
