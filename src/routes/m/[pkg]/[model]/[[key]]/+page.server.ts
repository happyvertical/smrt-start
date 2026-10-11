import { buildCookbookShell } from '@happyvertical/smrt-svelte/cookbook/server';
import { error, redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

/**
 * One navigation entry of the cookbook: `/m/<package>/<Model>/` (or
 * `/m/<package>/<Model>/<key>/` for a keyed entry such as one status of a
 * model). The page is `RecipeScreens` over the model's generated routes.
 */
export const load: PageServerLoad = async ({ params, parent, locals }) => {
  if (!locals.user) redirect(303, '/setup');
  const { cookbookApp } = await parent();
  if (!cookbookApp) error(404, 'This app has no cookbook.');
  const shell = buildCookbookShell({
    cookbook: cookbookApp.cookbook,
    catalog: cookbookApp.catalog,
  });
  const id = `item:${params.pkg}:${params.model}${params.key ? `:${params.key}` : ''}`;
  const entry = shell.entries.get(id);
  if (!entry) error(404, 'This page is not in your app.');
  return {
    entry: {
      id: entry.id,
      label: entry.label,
      description: entry.description,
      noun: entry.noun ?? null,
      filter: entry.filter ?? null,
      model: entry.model.id,
      className: entry.model.name,
    },
    permissions: locals.permissions,
  };
};
