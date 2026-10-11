import type {
  RecipeScreensSource,
  ScreenCollectionDefinition,
} from '@happyvertical/smrt-svelte/screens';
import {
  createRestSource,
  type RestCollection,
  type RowFilter,
} from '$lib/rest-source';

/** The part of a generated `@smrt/web` collection definition the entry page reads. */
export interface EntryDefinition
  extends RestCollection,
    ScreenCollectionDefinition {
  objectRef: string;
}

/**
 * The record screens of a navigation entry: the generated definition of the
 * entry's model, and a source over its `/api/<collection>` routes. `null` when
 * the model has no definition, which means the API does not expose it.
 */
export function entryRecords(
  definitions: object,
  entry: { model: string; filter?: RowFilter | null },
  options: { fetch?: typeof fetch } = {},
): { definition: EntryDefinition; source: RecipeScreensSource } | null {
  const definition = (Object.values(definitions) as EntryDefinition[]).find(
    (candidate) => candidate.objectRef === entry.model,
  );
  if (!definition) return null;
  return {
    definition,
    source: createRestSource(definition, {
      filter: entry.filter ?? undefined,
      fetch: options.fetch,
    }),
  };
}
