import { describe, expect, it } from 'vitest';

import { GET, POST } from '../src/routes/api/assistant/[...path]/+server';

const url = new URL('http://localhost:5173/api/assistant/threads');

describe('/api/assistant', () => {
  it('refuses a request without a signed-in user', async () => {
    const response = await GET({
      request: new Request(url),
      url,
      params: { path: 'threads' },
      locals: { user: null, tenantId: null, permissions: [] },
    });
    expect(response.status).toBe(401);
  });

  it('refuses an anonymous send before running the model', async () => {
    const send = new URL(
      'http://localhost:5173/api/assistant/threads/t1/messages',
    );
    const response = await POST({
      request: new Request(send, {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin: send.origin },
        body: JSON.stringify({ content: 'hello', clientRequestId: 'r1' }),
      }),
      url: send,
      params: { path: 'threads/t1/messages' },
      locals: { user: null, tenantId: null, permissions: [] },
    });
    expect(response.status).toBe(401);
  });
});
