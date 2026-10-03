# smrt starter

A small application to fork: one owner, local SQLite, a Notes model, an
assistant that can read and write your notes, WebMCP tools for browser agents,
and a read-only MCP endpoint. Built on [s-m-r-t](https://github.com/happyvertical/smrt).

The application itself is `src/lib/models/Note.ts`, the Notes page, and the
choices in the assistant and MCP routes. Everything else is framework wiring;
the files that are still here only because s-m-r-t does not provide them yet
are listed at the end, with the issue that would remove each one.

## Requirements

- Node.js 26 or newer
- pnpm 11.25 (`packageManager` pins it)
- An Anthropic API key for the assistant (or an OpenAI key; see below)

## Run it

```bash
pnpm install
cp .env.example .env        # then set ANTHROPIC_API_KEY in .env
pnpm app:setup              # build, create the local database, issue a one-time owner invitation
pnpm dev                    # http://localhost:5173
pnpm app:open               # opens the one-time /setup?token=… page in your browser
```

On the setup page, enter your name and email. That creates you as the owner,
signs you in, and takes you to your notes. The invitation works once, only
from this machine, and expires; if it has expired, run `pnpm app:stop`,
`pnpm app:recover`, then `pnpm app:open` again.

> **Known issue:** `pnpm dev` listens on `localhost`, but the invitation URL
> names `127.0.0.1`. On machines where `localhost` resolves to `::1` the page
> will not load; replace `127.0.0.1` with `localhost` in the address bar. See
> "Framework gaps" below.

Your data lives in your operating system's application-data directory, never
in this checkout. `pnpm app:doctor` prints where, plus any problems it finds.

## Use it

- **Notes.** Add notes on the home page.
- **Assistant.** Open the Assistant tool on the right edge of the shell, start
  a conversation, and ask for something like "add a note called Groceries
  listing eggs and flour, then tell me how many notes I have". It can only use
  the two tools named in `src/routes/api/assistant/[...path]/+server.ts`:
  `notes.read` and `notes.create`.
- **Browser agents (WebMCP).** While you are signed in, the page registers
  read-only `note_list` and `note_get` tools with browsers that support
  WebMCP.
- **MCP clients.** `POST /mcp` serves the read-only Note tools to a caller
  that holds `notes.read`. Locally that caller is your signed-in browser
  session. There is not yet a supported way to give a local MCP client (or
  ChatGPT) its own credential; see "Framework gaps".

## Use OpenAI instead of Anthropic

Change the `ai` block in `smrt.config.ts` and put the key in `.env`:

```ts
ai: { provider: 'openai', model: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
```

```bash
OPENAI_API_KEY=sk-…
```

Restart `pnpm dev` after changing `smrt.config.ts`.

## Change the data model

Edit or add classes in `src/lib/models/`, then run `pnpm db:migrate`. The
`smrt()` plugin in `vite.config.ts` regenerates the REST routes, types,
WebMCP definitions, and registration on every `pnpm dev` / `pnpm build`;
`db:migrate` applies the matching schema. Never edit the generated files (they
are gitignored).

## Scripts

| Script | Does |
| --- | --- |
| `pnpm dev` | Vite dev server (`smrt app dev`) |
| `pnpm build` | Production build (`smrt app build`) |
| `pnpm app:setup` | Build, migrate, and issue the owner invitation |
| `pnpm app:start` / `app:stop` | Run / stop the production build on loopback |
| `pnpm app:open` | Open the app (or the pending owner invitation) |
| `pnpm app:recover` | Replace an expired, unclaimed owner invitation |
| `pnpm app:doctor` | Secret-free diagnostics and recovery steps |
| `pnpm db:migrate` | Rebuild, then apply schema changes |
| `pnpm typecheck` | `tsc` and `svelte-check` |
| `pnpm test` | Vitest |
| `pnpm lint` | Biome |

## What this template still carries

These files (or parts of files) are not about notes. Each stays until the
s-m-r-t change named next to it lands; the proposed issues are not filed yet.

| File | Why it is here | Removed by (proposed smrt issue) |
| --- | --- | --- |
| `src/lib/server/smrt.ts` | Creates the runtime, passes the `smrt app` writer lease, imports the generated registration, and exports the `getCollection` that generated `/api/*` routes import | "Generated SvelteKit routes resolve collections without an app-authored `getCollection`"; "createSmrtSvelteKitRuntime holds the `smrt app` writer lease by default in the local profile"; "Load generated registration without an app import" |
| `src/hooks.server.ts` | Re-exports the runtime's `handle` / `init` | Same as above (once the runtime needs no app module, this is one generated line) |
| `src/app.d.ts` | Types `App.Locals` as the runtime's locals | "smrt() preset: emit the `App.Locals` declaration" |
| `src/routes/+layout.server.ts` | Mounts `createSessionLayoutLoad()` | "smrt() preset: mount the standard runtime routes (session load, setup, settings, health, diagnostics)" |
| `src/routes/setup/+page.svelte`, `+page.server.ts` | Mounts the owner-setup form and action | Same as above |
| `src/routes/settings/+page.svelte` | Mounts `ShellSettingsPage` | Same as above |
| `src/routes/api/_runtime/health/+server.ts`, `diagnostics/+server.ts` | Mount the health and diagnostics handlers | Same as above |
| `src/lib/server/mcp.ts`, `src/routes/.well-known/oauth-protected-resource/mcp/+server.ts` | Hosted-MCP bearer plumbing. In the local profile it is inert (`null` / 404); a hosted deployment would still need an app-written `resolvePrincipal` | "Hosted MCP: ship a default membership-backed `resolvePrincipal` and mount the protected-resource route with `mountMcpAppRoute`" |
| `src/routes/mcp/+server.ts` (`smrtOptions`, `bindPrincipal`, `auth` lines) | Wires the route to the runtime by hand | "mountMcpAppRoute: take the SMRT runtime instead of `smrtOptions` / `bindPrincipal` / `auth`" |
| `src/routes/api/assistant/[...path]/+server.ts` (`ai`, `db`, `tools` lines, top-level `await`) | Builds the AI client from the `ai` block, passes a database resolved at import time, and repeats `allowedTools` as a manifest tool catalog | "mountAssistantRoutes: default `ai` to the smrt.config `ai` block, take `db` per request (or the runtime), and offer the manifest tools named in `allowedTools`" |
| `src/routes/+layout.svelte` (`createDataSurfaceRegistry()`) | `AssistantDock` requires a registry, and `AppShell` does not share its Provider's | "AppShell: give the dock snippet the Provider's DataSurfaceRegistry (and make AssistantDock's registry optional)" |
| `smrt.config.ts` (`runtime: { profile: 'local' }`) | `smrt app` fails without it, although the web runtime already defaults to local | "smrt app: default to the local profile when smrt.config declares no runtime" |
| `smrt.config.ts` (`packages.cli.database`) | `smrt db:migrate` reads the database only from config, not from the `DATABASE_URL` that `smrt app` sets | "smrt db:migrate: honour DATABASE_URL / DATABASE_TYPE from smrt app" |
| `package.json` `name` (`@smrt-app/starter`) | Must be a scoped name; an unscoped name breaks generated registration at runtime | "Generated isolated registration: accept unscoped app package names" |
| `vite.config.ts` (`objectsDir`) | The preset scans `src/lib/objects` by default; this app keeps models in `src/lib/models` | Not a gap: an app choice |
| `svelte.config.js`, `tsconfig.json`, `src/app.html`, `vitest.config.ts`, `biome.json` | SvelteKit, TypeScript, Vitest, and Biome configuration | Not a smrt gap |

## Framework gaps

Found while building this starter; reproductions are in the coordinator
report for happyvertical/smrt#3367.

- `pnpm dev` (`smrt app dev`) binds `localhost`, while `pnpm app:setup` writes
  an invitation for `127.0.0.1`.
- Signing in does not remove the `smrt app` invitation hand-off files, so
  `pnpm app:open` keeps a dead invitation around.
- The generated WebMCP `note_list` tool fails: the generated REST list route
  answers `{ items, … }` and the browser client accepts only an array or
  `{ data }`. `note_get` works.
- No local credential for MCP clients: in the local profile `/mcp` accepts
  only the browser session cookie, the runtime issues no bearer tokens, and
  the `smrt-mcp-bridge` stdio bridge sends only a bearer token. The bridge
  binary also cannot target `/mcp` (it always uses `/api/mcp`).
- Reaching the app from ChatGPT needs a hosted profile with public OAuth; this
  template is local-only.

## License

MIT © Happy Vertical Corporation
