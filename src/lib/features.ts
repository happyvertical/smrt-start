/**
 * What this checkout is composed of, decided from files on disk. Node-only:
 * the build configs (`vite.config.ts`, `smrt.config.ts`, `vitest.config.ts`)
 * and server code read it, so the build and the running app agree.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** The cookbook `smrt cookbook apply` writes at the project root. */
export const COOKBOOK_FILE = 'smrt.cookbook.json';

/**
 * The Notes example (`src/lib/models/Note.ts`, its page, the assistant tools
 * and the MCP route).
 *
 * - `'auto'`: kept when there is no cookbook, dropped when there is one.
 * - `'keep'`: always kept; it sits next to the cookbook's sections.
 * - `'drop'`: never built, even with no cookbook.
 *
 * To remove Notes for good, set `'drop'` (or delete `Note.ts`, the Notes page
 * and its tests).
 */
export const NOTES: 'auto' | 'keep' | 'drop' = 'auto';

export function hasCookbookFile(
  root: string = process.cwd(),
  file: string = COOKBOOK_FILE,
): boolean {
  return existsSync(join(resolve(root), file));
}

export function notesEnabled(root: string = process.cwd()): boolean {
  if (NOTES === 'keep') return true;
  if (NOTES === 'drop') return false;
  return !hasCookbookFile(root);
}

/** Never a model provider, even though it exports a manifest. */
const NOT_MODEL_PROVIDERS = new Set(['@happyvertical/smrt-core']);

/**
 * The s-m-r-t packages whose models this app consumes: every dependency in
 * `package.json` named `@happyvertical/smrt-*` that exports a `./manifest`.
 * `smrt cookbook apply` adds the packages a cookbook needs to `dependencies`;
 * this list follows, so an applied cookbook's models and migrations are picked
 * up without editing `smrt.config.ts`. Tooling and UI packages publish no
 * manifest and are left out.
 */
export function modelPackages(root: string = process.cwd()): string[] {
  const dir = resolve(root);
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    .filter(
      (name) =>
        name.startsWith('@happyvertical/smrt-') &&
        !NOT_MODEL_PROVIDERS.has(name),
    )
    .sort();
  return names.filter((name) => {
    try {
      // Direct dependencies are linked at node_modules/<name>.
      const installed = JSON.parse(
        readFileSync(join(dir, 'node_modules', name, 'package.json'), 'utf8'),
      ) as { exports?: Record<string, unknown> };
      const exports = installed.exports;
      return Boolean(exports?.['./manifest'] || exports?.['./manifest.json']);
    } catch {
      return false;
    }
  });
}
