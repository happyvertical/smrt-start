import { randomUUID } from 'node:crypto';
import { ObjectRegistry } from '@happyvertical/smrt-core';
import { enableTenancy, withTenant } from '@happyvertical/smrt-tenancy';
import { createIsolatedTestDbFromManifest } from '@happyvertical/smrt-vitest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { notesEnabled } from '../src/lib/features';
import type { Note } from '../src/lib/models/Note';
import '../src/lib/models/Note';

const tenantA = randomUUID();
const tenantB = randomUUID();
let db: Awaited<ReturnType<typeof createIsolatedTestDbFromManifest>>;

const notes = () => ObjectRegistry.getCollection<Note>('Note', { db: db.db });

// The Notes example is optional (see src/lib/features.ts).
describe.skipIf(!notesEnabled())('Note', () => {
  beforeAll(async () => {
    enableTenancy();
    db = await createIsolatedTestDbFromManifest({ includeObjects: ['Note'] });
  });

  afterAll(async () => {
    await db?.cleanup();
  });

  it('creates, reads, and updates a note inside its tenant', async () => {
    const id = await withTenant({ tenantId: tenantA }, async () => {
      const created = await (await notes()).create({
        title: 'Groceries',
        body: 'Eggs, flour, coffee',
      });
      return String(created.id);
    });

    await withTenant({ tenantId: tenantA }, async () => {
      const collection = await notes();
      const note = await collection.get({ id });
      expect(note?.title).toBe('Groceries');
      expect(note?.body).toBe('Eggs, flour, coffee');
      expect(note?.tenantId).toBe(tenantA);

      if (!note) throw new Error('note not found');
      note.body = 'Eggs, flour, coffee, milk';
      await note.save();
      expect((await collection.get({ id }))?.body).toBe(
        'Eggs, flour, coffee, milk',
      );
    });
  });

  it('never returns another tenant’s notes', async () => {
    const visible = await withTenant({ tenantId: tenantB }, async () =>
      (await notes()).list({}),
    );
    expect(visible).toEqual([]);
  });
});
