import { describe, expect, it } from 'vitest';
import { notesEnabled } from '../src/lib/features';
import { POST } from '../src/routes/mcp/+server';
import { rpc, toolNames } from './mcp-rpc';

/** A signed-in owner who may both read and create notes. */
const owner = {
  user: { id: 'owner-1' },
  tenantId: 'tenant-1',
  sessionId: 'session-1',
  permissions: ['notes.create', 'notes.read'],
};

describe.skipIf(!notesEnabled())('/mcp', () => {
  it('lists only the read tools, even to a principal that may create notes', async () => {
    expect(await toolNames(POST, owner)).toEqual(['note_get', 'note_list']);
  });

  it('treats the create tool as unknown', async () => {
    const response = await POST(
      rpc(
        'tools/call',
        { name: 'note_create', arguments: { title: 'x' } },
        owner,
      ),
    );
    const body = await response.json();
    expect(body.result?.content ?? []).toEqual([]);
    expect(JSON.stringify(body)).toMatch(/unknown/i);
  });

  it('lists nothing to an anonymous caller', async () => {
    expect(await toolNames(POST, { user: null, permissions: [] })).toEqual([]);
  });

  it('refuses a bad bearer token instead of falling back to the session', async () => {
    const response = await POST(
      rpc('tools/list', {}, owner, { authorization: 'Bearer not-a-token' }),
    );
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toMatch(/invalid_token/);
  });
});
