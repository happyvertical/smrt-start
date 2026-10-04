import { createHostedMcpResourceAuth } from '@happyvertical/smrt-app-mcp/auth';

import { runtime } from './smrt';

const { profile } = await runtime.resolvedRuntime();

/**
 * Bearer authentication for `/mcp`. In the local profile it accepts the
 * owner-minted tokens from `smrt app token`; a request without a token keeps
 * the signed-in browser session.
 */
export const mcpAuth = createHostedMcpResourceAuth({ profile, runtime });
