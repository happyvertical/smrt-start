# smrt-start

A forkable s-m-r-t application: one owner, local SQLite, a Notes model, an
in-app assistant, WebMCP for browser agents, and a read-only remote MCP
endpoint. It is also the proving ground for s-m-r-t's consumer surface
(happyvertical/smrt#3367), and the public, canonical app template:
`smrt cookbook apply` copies this repository by default, so every change here
ships to new apps.

## The rule this repository exists for

This repository holds **application logic only**. When the app needs code that
is not about notes (runtime glue, config forwarding, auth plumbing), that is a
s-m-r-t gap: fix it in `happyvertical/smrt` and delete it here. Never add a
shim, a copied helper from `template-sveltekit`, or a workaround. Anything
non-application that the starter still carries is listed, with the issue that
removes it, in README "What this template still carries"; keep that table
current in the same change that adds or removes such a file.

## Layout

- `src/lib/models/` — `@smrt()` models (the `smrt()` Vite preset scans this
  directory; `vite.config.ts` points it here).
- `src/lib/server/smrt.ts` — the runtime from
  `@happyvertical/smrt-app-runtime/sveltekit`, and nothing else. Pages and the
  generated `/api/*` routes resolve collections per request with
  `runtime.getCollection()`; never keep the result.
- `src/routes/` — pages and mounted framework routes (`/setup`, `/settings`,
  `/api/assistant/[...path]`, `/mcp`, `/api/_runtime/*`). `/mcp` and its
  metadata route take `runtime` and nothing else; local tokens come from
  `smrt app token`.
- `src/lib/features.ts` — what this checkout is composed of: whether
  `smrt.cookbook.json` exists, whether the Notes example is on (`NOTES`), and
  the model packages `smrt.config.ts` hands the build. The build configs and
  the routes read it, so they agree.
- `src/lib/server/cookbook.ts`, `src/lib/cookbook/exports.ts` — the cookbook
  shell: load `smrt.cookbook.json`, lay stored preferences over it, store edits.
  `src/routes/s/[slug]` (section pages) and `src/routes/m/[pkg]/[model]/[[key]]`
  (entry pages) render inside `CookbookApp` from `+layout.svelte`.
- Generated and gitignored: `.smrt/`, `src/lib/server/smrt-register.ts`,
  `src/lib/types/smrt-generated/`, and the generated `src/routes/api/**`
  routes listed in `.gitignore`'s bounded block. Never edit or commit them.

## Invariants

- Tenant-scoped models use `@TenantScoped({ mode: 'required' })` with
  `@tenantId()`. Never query across tenants.
- Authorization comes from the signed session (`locals.permissions`); the
  owner role holds the generated `<collection>.<action>` grants.
- The assistant's `allowedTools` is fail-closed; name every tool explicitly.
- Remote MCP stays read-only (`effects: ['read']`); local tokens are minted
  with the narrowest scope (`--scopes notes.read`).
- The AI key lives only in the environment variable named by
  `smrt.config.ts` `ai.apiKeyEnv`.
- Schema changes go through `pnpm db:migrate`; runtime never creates tables.
- Without `smrt.cookbook.json` the app is the Notes app. With it, Notes is off
  unless `NOTES` is `'keep'`; guard every Notes-only route, tool and test with
  `notesEnabled()`.
- `smrt cookbook apply` only adds dependencies and writes `smrt.cookbook.json`.
  Anything it would need written elsewhere is derived here from those two
  (never hand-edit the package list in `smrt.config.ts`).
- Overview and layout edits are per-person preferences stored through
  smrt-preferences; the cookbook file is the default and is never written back.

## Validation

Node 26, pnpm 11.25. Run, in order:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm lint
```

Tests use `smrtVitestPlugin()`; restart Vitest after adding a model.
