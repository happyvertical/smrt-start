import {
  CLIENT_CAPABILITIES_META_KEY,
  CLIENT_INFO_META_KEY,
  PROTOCOL_VERSION_META_KEY,
} from '@modelcontextprotocol/server';
import { describe, expect, it } from 'vitest';

import { POST } from '../src/routes/mcp/+server';

/** A signed-in owner who may both read and create notes. */
const owner = {
  user: { id: 'owner-1' },
  tenantId: 'tenant-1',
  sessionId: 'session-1',
  permissions: ['notes.create', 'notes.read'],
};

type McpEvent = Parameters<typeof POST>[0];

function rpc(
  method: string,
  params: Record<string, unknown>,
  locals: unknown,
): McpEvent {
  const url = new URL('http://localhost:5173/mcp');
  return {
    url,
    locals,
    request: new Request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'mcp-protocol-version': '2026-07-28',
        'mcp-method': method,
        ...(typeof params.name === 'string' ? { 'mcp-name': params.name } : {}),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params: {
          ...params,
          _meta: {
            [PROTOCOL_VERSION_META_KEY]: '2026-07-28',
            [CLIENT_INFO_META_KEY]: { name: 'starter-test', version: '0' },
            [CLIENT_CAPABILITIES_META_KEY]: {},
          },
        },
      }),
    }),
  } as unknown as McpEvent;
}

async function toolNames(locals: unknown): Promise<string[]> {
  const response = await POST(rpc('tools/list', {}, locals));
  const body = await response.json();
  return body.result.tools.map((tool: { name: string }) => tool.name).sort();
}

describe('/mcp', () => {
  it('lists only the read tools, even to a principal that may create notes', async () => {
    expect(await toolNames(owner)).toEqual(['note_get', 'note_list']);
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
    expect(await toolNames({ user: null, permissions: [] })).toEqual([]);
  });
});
