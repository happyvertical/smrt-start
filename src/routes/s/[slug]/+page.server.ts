import { error, redirect } from '@sveltejs/kit';

import { hasCookbookFile } from '$lib/features';
import type { PageServerLoad } from './$types';

/** A section of the cookbook's navigation; the page itself is client-rendered. */
export const load: PageServerLoad = ({ locals }) => {
  if (!hasCookbookFile()) error(404, 'This app has no cookbook.');
  if (!locals.user) redirect(303, '/setup');
  return {};
};
