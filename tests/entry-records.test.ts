import { describe, expect, it, vi } from 'vitest';

import { entryRecords } from '../src/lib/cookbook/records';

const orders = {
  name: 'orders',
  objectRef: '@happyvertical/smrt-commerce:Order',
  className: 'Order',
  endpoint: '/orders',
  idField: 'id',
  actions: ['list', 'get'],
  fields: {},
};
const customers = {
  ...orders,
  name: 'customers',
  objectRef: '@happyvertical/smrt-commerce:Customer',
  className: 'Customer',
  endpoint: '/customers',
  actions: ['list', 'get', 'create', 'update', 'delete'],
};
const definitions = { orders, customers };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe('entry page records', () => {
  it('has no records for a model the API does not expose', () => {
    expect(
      entryRecords(definitions, { model: '@happyvertical/smrt-commerce:Cart' }),
    ).toBeNull();
    expect(entryRecords({}, { model: orders.objectRef })).toBeNull();
  });

  it('takes the definition by the entry model and reads /api/<collection>', async () => {
    const fetch = vi.fn(async (url: string | URL | Request) =>
      String(url).startsWith('/api/orders/o1')
        ? json({ id: 'o1', status: 'open' })
        : json({ items: [{ id: 'o1', status: 'open' }] }),
    ) as unknown as typeof globalThis.fetch;

    const records = entryRecords(
      definitions,
      { model: orders.objectRef },
      { fetch },
    );
    expect(records?.definition).toBe(orders);
    expect(await records?.source.list()).toEqual([
      { id: 'o1', status: 'open' },
    ]);
    expect(await records?.source.get?.('o1')).toEqual({
      id: 'o1',
      status: 'open',
    });
    expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).toEqual([
      '/api/orders?limit=500&offset=0',
      '/api/orders/o1',
    ]);
  });

  it('offers writes only where the definition has the action', async () => {
    const readOnly = entryRecords(definitions, { model: orders.objectRef });
    expect(readOnly?.source.create).toBeUndefined();
    expect(readOnly?.source.update).toBeUndefined();
    expect(readOnly?.source.delete).toBeUndefined();

    const fetch = vi.fn(async () =>
      json({ id: 'c1', name: 'Ada' }),
    ) as unknown as typeof globalThis.fetch;
    const writable = entryRecords(
      definitions,
      { model: customers.objectRef },
      { fetch },
    );
    await writable?.source.create?.({ name: 'Ada' });
    await writable?.source.update?.('c1', { name: 'Ada' });
    expect(
      vi
        .mocked(fetch)
        .mock.calls.map(([url, init]) => [String(url), init?.method]),
    ).toEqual([
      ['/api/customers', 'POST'],
      ['/api/customers/c1', 'PUT'],
    ]);
  });

  it('scopes a keyed entry to its rows', async () => {
    const fetch = vi.fn(async () =>
      json({
        items: [
          { id: 'o1', status: 'open' },
          { id: 'o2', status: 'paid' },
        ],
      }),
    ) as unknown as typeof globalThis.fetch;
    const records = entryRecords(
      definitions,
      {
        model: orders.objectRef,
        filter: { field: 'status', value: 'paid' },
      },
      { fetch },
    );
    expect(await records?.source.list()).toEqual([
      { id: 'o2', status: 'paid' },
    ]);
  });

  it('pages through a collection so a keyed entry sees rows past the first page', async () => {
    const first = Array.from({ length: 500 }, (_, i) => ({
      id: `a${i}`,
      status: 'open',
    }));
    const fetch = vi.fn(async (url: string | URL | Request) =>
      String(url).includes('offset=500')
        ? json({ items: [{ id: 'late', status: 'paid' }] })
        : json({ items: first }),
    ) as unknown as typeof globalThis.fetch;
    const records = entryRecords(
      definitions,
      { model: orders.objectRef, filter: { field: 'status', value: 'paid' } },
      { fetch },
    );
    expect(await records?.source.list()).toEqual([
      { id: 'late', status: 'paid' },
    ]);
  });

  it('keeps an edited row inside its keyed entry', async () => {
    const fetch = vi.fn(async () =>
      json({ id: 'c1' }),
    ) as unknown as typeof globalThis.fetch;
    const records = entryRecords(
      definitions,
      {
        model: customers.objectRef,
        filter: { field: 'customerType', value: 'dtc' },
      },
      { fetch },
    );
    await records?.source.update?.('c1', { customerType: 'wholesale' });
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body))).toEqual(
      { customerType: 'dtc' },
    );
  });
});
