import type { SmrtRuntimeLocals } from '@happyvertical/smrt-app-runtime/sveltekit';

declare global {
  namespace App {
    interface Locals extends SmrtRuntimeLocals {}
  }
}
