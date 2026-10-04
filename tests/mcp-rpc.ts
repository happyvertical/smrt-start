import {
  CLIENT_CAPABILITIES_META_KEY,
  CLIENT_INFO_META_KEY,
  PROTOCOL_VERSION_META_KEY,
} from '@modelcontextprotocol/server';

import type { POST } from '../src/routes/mcp/+server';

export type McpEvent = Parameters<typeof POST>[0];

/** A 2026-07-28 MCP request to `/mcp`, as a stock client sends it. */
export function rpc(
  method: string,
  params: Record<string, unknown>,
  locals: unknown,
  headers: Record<string, string> = {},
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
        ...headers,
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

/** The tool names `tools/list` returns, sorted. */
export async function toolNames(
  post: typeof POST,
  locals: unknown,
  headers?: Record<string, string>,
): Promise<string[]> {
  const response = await post(rpc('tools/list', {}, locals, headers));
  const body = await response.json();
  return body.result.tools.map((tool: { name: string }) => tool.name).sort();
}
