import type { RecipeExportResolver } from '@happyvertical/smrt-svelte/overview';

/**
 * The components and loaders recipes may name in `surfaces` (an export
 * reference is `<module specifier>#<export name>`). A bundled app cannot
 * import by a runtime string, so every module a recipe may point at is listed
 * here as a lazy import. Only modules this app depends on can be listed: when
 * `smrt cookbook apply` adds a package whose recipes ship Svelte exports,
 * add its entry (`'@happyvertical/smrt-<pkg>/svelte': () =>
 * import('@happyvertical/smrt-<pkg>/svelte')`). A surface naming a module that
 * is not listed is left out of the shell; nothing else breaks.
 */
const modules: Record<string, () => Promise<Record<string, unknown>>> = {
  '@happyvertical/smrt-svelte': () => import('@happyvertical/smrt-svelte'),
  '@happyvertical/smrt-svelte/notifications': () =>
    import('@happyvertical/smrt-svelte/notifications'),
  '@happyvertical/smrt-chat/svelte': () =>
    import('@happyvertical/smrt-chat/svelte'),
  '@happyvertical/smrt-users/svelte': () =>
    import('@happyvertical/smrt-users/svelte'),
};

export const resolveExport: RecipeExportResolver = async (
  specifier,
  exportName,
) => (await modules[specifier]?.())?.[exportName];
