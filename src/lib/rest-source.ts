import type {
  RecipeScreensSource,
  ScreenRecord,
} from '@happyvertical/smrt-svelte/screens';

/** The part of a generated web collection definition the source reads. */
export interface RestCollection {
  /** `/<collection>`, relative to the API base. */
  endpoint: string;
  idField?: string;
  /** The exposed CRUD actions (`list`, `get`, `create`, `update`, `delete`). */
  actions: readonly string[];
}

/** The same row filter a keyed navigation entry applies. */
export interface RowFilter {
  field: string;
  value: string;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`.trim());
  }
  return (await response.json()) as T;
}

/**
 * A `RecipeScreens` source over a model's generated REST routes. It offers
 * only the operations the model exposes, and scopes a keyed entry to its rows.
 */
export function createRestSource(
  collection: RestCollection,
  options: { base?: string; filter?: RowFilter; fetch?: typeof fetch } = {},
): RecipeScreensSource {
  const base = `${options.base ?? '/api'}${collection.endpoint}`;
  const request = options.fetch ?? fetch;
  const { filter } = options;
  const idOf = (id: string) => `${base}/${encodeURIComponent(id)}`;
  const json = (values: unknown, method: string): RequestInit => ({
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(values),
  });
  const has = (action: string) => collection.actions.includes(action);
  const inScope = (row: ScreenRecord) =>
    !filter || String(row[filter.field] ?? '') === filter.value;

  const source: RecipeScreensSource = {
    async list() {
      const body = await read<{ items?: ScreenRecord[] }>(
        await request(`${base}?limit=500`),
      );
      return (body.items ?? []).filter(inScope);
    },
  };
  if (has('get')) {
    source.get = async (id) => {
      const response = await request(idOf(id));
      if (response.status === 404) return undefined;
      return read<ScreenRecord>(response);
    };
  }
  if (has('create')) {
    source.create = async (values) =>
      read<ScreenRecord>(
        await request(
          base,
          json(
            filter ? { ...values, [filter.field]: filter.value } : values,
            'POST',
          ),
        ),
      );
  }
  if (has('update')) {
    source.update = async (id, values) =>
      read<ScreenRecord>(await request(idOf(id), json(values, 'PUT')));
  }
  if (has('delete')) {
    source.delete = async (id) => {
      const response = await request(idOf(id), { method: 'DELETE' });
      if (!response.ok) throw new Error(`${response.status}`);
    };
  }
  return source;
}
