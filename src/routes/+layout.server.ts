import { createSessionLayoutLoad } from '@happyvertical/smrt-app-runtime/sveltekit';

import { notesEnabled } from '$lib/features';
import { loadCookbook } from '$lib/server/cookbook';
import type { LayoutServerLoad } from './$types';

const session = createSessionLayoutLoad();

export const load: LayoutServerLoad = async (event) => {
  const data = await session(event);
  return {
    ...data,
    notes: notesEnabled(),
    /** The project's cookbook and recipe catalog; `null` without a cookbook. */
    cookbookApp: await loadCookbook({
      signedIn: data.session.authenticated,
    }),
  };
};
