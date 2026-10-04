import { fail, redirect } from '@sveltejs/kit';

import type { Note } from '$lib/models/Note';
import { runtime } from '$lib/server/smrt';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, locals }) => {
  depends('app:notes');
  if (!locals.user) redirect(303, '/setup');
  if (!locals.permissions.includes('notes.read')) {
    return { notes: [], canCreate: false };
  }
  const notes = await runtime.getCollection<Note>('Note');
  const rows = await notes.list({ orderBy: 'created_at DESC', limit: 100 });
  return {
    notes: rows.map((note) => ({
      id: String(note.id),
      title: note.title,
      body: note.body,
    })),
    canCreate: locals.permissions.includes('notes.create'),
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user || !locals.permissions.includes('notes.create')) {
      return fail(403, { error: 'You cannot create notes.' });
    }
    const form = await request.formData();
    const title = String(form.get('title') ?? '').trim();
    const body = String(form.get('body') ?? '').trim();
    if (!title) return fail(400, { error: 'A title is required.' });

    const notes = await runtime.getCollection<Note>('Note');
    await notes.create({ title, body });
    return { created: title };
  },
};
