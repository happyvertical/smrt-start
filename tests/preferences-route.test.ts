import { PreferenceAccessError } from '@happyvertical/smrt-preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../src/routes/api/cookbook/preferences/+server';

const state = vi.hoisted(() => ({ cookbook: true, save: vi.fn() }));

vi.mock('../src/lib/features', () => ({
  hasCookbookFile: () => state.cookbook,
}));
vi.mock('../src/lib/server/cookbook', () => ({
  saveCookbookEdits: state.save,
}));

const call = (
  body: string,
  options: { user?: object | null; scope?: string } = {},
) =>
  POST({
    request: new Request('http://localhost/api/cookbook/preferences', {
      method: 'POST',
      body,
    }),
    locals: { user: 'user' in options ? options.user : { id: 'u1' } },
    url: new URL(
      `http://localhost/api/cookbook/preferences${options.scope ? `?scope=${options.scope}` : ''}`,
    ),
  } as unknown as Parameters<typeof POST>[0]);

describe('POST /api/cookbook/preferences', () => {
  beforeEach(() => {
    state.cookbook = true;
    state.save.mockReset().mockResolvedValue({ ok: true, saved: [] });
  });

  it('needs a signed-in person, a cookbook and a JSON object', async () => {
    await expect(call('{}', { user: null })).rejects.toMatchObject({
      status: 401,
    });
    state.cookbook = false;
    await expect(call('{}')).rejects.toMatchObject({ status: 404 });
    state.cookbook = true;
    await expect(call('not json')).rejects.toMatchObject({ status: 400 });
    await expect(call('[]')).rejects.toMatchObject({ status: 400 });
    expect(state.save).not.toHaveBeenCalled();
  });

  it('saves per person unless the organization default is asked for', async () => {
    await call('{"version":1}');
    await call('{"version":1}', { scope: 'tenant' });
    await call('{"version":1}', { scope: 'anything-else' });
    expect(state.save.mock.calls.map(([, scope]) => scope)).toEqual([
      'user',
      'tenant',
      'user',
    ]);
  });

  it('answers a refused save with 403, and a conflict with 409', async () => {
    state.save.mockResolvedValueOnce({ ok: false, reason: 'not_allowed' });
    expect((await call('{}', { scope: 'tenant' })).status).toBe(403);
    state.save.mockResolvedValueOnce({ ok: false, reason: 'conflict' });
    expect((await call('{}')).status).toBe(409);
    state.save.mockRejectedValueOnce(
      new PreferenceAccessError('no tenant principal'),
    );
    await expect(call('{}')).rejects.toMatchObject({ status: 403 });
  });
});
