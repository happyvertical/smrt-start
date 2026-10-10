import { error, json } from '@sveltejs/kit';

import { saveCookbookEdits } from '$lib/server/cookbook';
import type { RequestHandler } from './$types';

/**
 * Stores the layout and overview edits `CookbookApp` reports after an edit,
 * as the signed-in person's preferences (or the organization default with
 * `?scope=tenant`). The body is the cookbook the shell holds; only its
 * `layout` and `overviews` are read, and each is validated before it is stored.
 */
export const POST: RequestHandler = async ({ request, locals, url }) => {
  if (!locals.user) error(401, 'Sign in to save your layout.');
  const scope = url.searchParams.get('scope') === 'tenant' ? 'tenant' : 'user';
  const result = await saveCookbookEdits(await request.json(), scope);
  if (result.ok) return json(result);
  const status =
    result.reason === 'not_allowed'
      ? 403
      : result.reason === 'conflict'
        ? 409
        : 400;
  return json(result, { status });
};
