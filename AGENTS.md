# smrt-start

A forkable s-m-r-t application: one owner, local SQLite, a Notes model, an
in-app assistant, WebMCP for browser agents, and a read-only remote MCP
endpoint. It is also the proving ground for s-m-r-t's consumer surface
(happyvertical/smrt#3367).

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
  `@happyvertical/smrt-app-runtime/sveltekit` and the `getCollection` the
  generated `/api/*` routes import.
- `src/routes/` — pages and mounted framework routes (`/setup`, `/settings`,
  `/api/assistant/[...path]`, `/mcp`, `/api/_runtime/*`).
- Generated and gitignored: `.smrt/`, `src/lib/server/smrt-register.ts`,
  `src/lib/types/smrt-generated/`, and the generated `src/routes/api/**`
  routes listed in `.gitignore`'s bounded block. Never edit or commit them.

## Invariants

- Tenant-scoped models use `@TenantScoped({ mode: 'required' })` with
  `@tenantId()`. Never query across tenants.
- Authorization comes from the signed session (`locals.permissions`); the
  owner role holds the generated `<collection>.<action>` grants.
- The assistant's `allowedTools` is fail-closed; name every tool explicitly.
- Remote MCP stays read-only (`effects: ['read']`).
- The AI key lives only in the environment variable named by
  `smrt.config.ts` `ai.apiKeyEnv`.
- Schema changes go through `pnpm db:migrate`; runtime never creates tables.

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
