import { describe, expect, it, vi } from 'vitest';
import { notesEnabled } from '../src/lib/features';
import { POST } from '../src/routes/mcp/+server';
import { rpc, toolNames } from './mcp-rpc';

/**
 * `/mcp` with an owner-minted local token (`smrt app token`). The runtime is
 * replaced so the test needs no data directory: its `verifyLocalMcpToken`
 * knows two tokens, `resolveMcpPrincipal` maps no hosted identity (local
 * profile), and `runAsPrincipal` hands the token scopes through.
 */
const tokens: Record<string, readonly string[]> = {
  smrt_mcp_read_and_create_0001: ['notes.create', 'notes.read'],
  smrt_mcp_create_only_00000001: ['notes.create'],
};

vi.mock('../src/lib/server/smrt', () => ({
  runtime: {
    resolvedRuntime: async () => ({ profile: 'local' }),
    databaseConfig: () => ({ type: 'sqlite', url: ':memory:' }),
    verifyLocalMcpToken: async (token: string) => {
      const scopes = tokens[token];
      return scopes
        ? { id: 'owner-1', tenantId: 'tenant-1', kind: 'human', scopes }
        : null;
    },
    resolveMcpPrincipal: async () => null,
    runAsPrincipal: async <T>(
      principal: { scopes?: readonly string[] },
      fn: (bound: { scopes: readonly string[] }) => Promise<T>,
    ) => fn({ ...principal, scopes: principal.scopes ?? [] }),
  },
}));

const anonymous = { user: null, permissions: [] };
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

describe.skipIf(!notesEnabled())('/mcp with a local token', () => {
  it('lists only the read tools to a token that may also create notes', async () => {
    expect(
      await toolNames(POST, anonymous, bearer('smrt_mcp_read_and_create_0001')),
    ).toEqual(['note_get', 'note_list']);
  });

  it('lists nothing to a token without notes.read', async () => {
    expect(
      await toolNames(POST, anonymous, bearer('smrt_mcp_create_only_00000001')),
    ).toEqual([]);
  });

  it('refuses an unknown token', async () => {
    const response = await POST(
      rpc('tools/list', {}, anonymous, bearer('smrt_mcp_unknown_0000000001')),
    );
    expect(response.status).toBe(401);
  });
});
