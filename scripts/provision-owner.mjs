// Creates the stand-in owner for the container stack (idempotent: a second run
// reports `unchanged`). The defaults below exist so `docker compose up` gives
// you something to sign in with; set SMRT_OWNER_EMAIL and SMRT_OWNER_PASSWORD
// (or provision your own owner and delete this step) before real use.
import { provisionPasswordOwner } from '@happyvertical/smrt-users/operator';
import { getDatabase } from '@happyvertical/sql';

const email = process.env.SMRT_OWNER_EMAIL || 'owner@example.com';
const password = process.env.SMRT_OWNER_PASSWORD || 'change-this-stand-in-password';
const db = await getDatabase({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  cache: false,
});
try {
  const result = await provisionPasswordOwner(db, {
    tenantId: '00000000-0000-4000-8000-000000000001',
    tenantName: 'smrt-start',
    userId: '00000000-0000-4000-8000-000000000002',
    email,
    password,
  });
  console.log(`owner ${email}: ${result.status}`);
} finally {
  await db.close?.();
}
