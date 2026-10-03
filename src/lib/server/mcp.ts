import { createHostedMcpResourceAuth } from '@happyvertical/smrt-app-mcp/auth';

import { runtime } from './smrt';

const { profile } = await runtime.resolvedRuntime();

/**
 * Bearer authentication for remote MCP clients. In the local profile this is
 * `null` and `/mcp` uses the signed-in browser session instead.
 */
export const mcpAuth = createHostedMcpResourceAuth({ profile });
