# smrt-start

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
pnpm dev                    # http://127.0.0.1:5173
pnpm app:open               # opens the one-time /setup?token=… page in your browser
```

On the setup page, enter your name and email. That creates you as the owner,
signs you in, and takes you to your notes. The invitation works once, only
from this machine, and expires; if it has expired, run `pnpm app:stop`,
`pnpm app:recover`, then `pnpm app:open` again.

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
  that holds `notes.read`: your signed-in browser session, or a local MCP
  client with a token (next section).

## Use it from a local MCP client

Mint a token after `pnpm app:setup` (it works while the app is running). The
token is printed once, in the `token` field; only its hash is stored:

```bash
pnpm exec smrt app token create --scopes notes.read --label claude-desktop
pnpm exec smrt app token list            # ids, scopes, expiry; never the token
pnpm exec smrt app token revoke <id>
```

Tokens expire after 30 days (`--expires` changes that). Then point the client
at the `smrt-mcp-bridge` stdio bridge in this checkout, with `pnpm dev` (or
`pnpm app:start`) running. For Claude Desktop:

```json
{
  "mcpServers": {
    "notes": {
      "command": "/absolute/path/to/smrt-start/node_modules/.bin/smrt-mcp-bridge",
      "args": ["--env-prefix=NOTES", "--mcp-path=/mcp"],
      "env": {
        "NOTES_SERVER_URL": "http://127.0.0.1:5173",
        "NOTES_TOKEN": "smrt_mcp_…"
      }
    }
  }
}
```

The bridge sends the token only to `NOTES_SERVER_URL`. On `/mcp` a valid token
acts as you, capped to its scopes and your current permissions; an unknown,
revoked, or expired token gets `401` and never falls back to a browser
session.

Through the bridge, a `notes.read` token lists `note_get` and `note_list` and
can call them, in `pnpm dev` and in the production build. Without a token,
`tools/list` returns an empty list. A refused token makes every request after
`initialize` fail with the bridge error `MCP upstream request failed`.

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
s-m-r-t change named next to it ships, or is marked as staying.

| File | Why it is here | Removed by |
| --- | --- | --- |
| `src/lib/server/smrt.ts` | One call, `createSmrtSvelteKitRuntime()`; hooks, pages, mounted routes, and generated `/api/*` routes import its `runtime` | Stays: the module the framework looks for, and where runtime options go |
| `src/hooks.server.ts` | Re-exports the runtime's `handle` / `init` | Not filed: a two-line file; revisit with happyvertical/smrt#3378 |
| `src/app.d.ts` | Types `App.Locals` as the runtime's locals | Not filed: a two-line file; revisit with happyvertical/smrt#3378 |
| `src/routes/+layout.server.ts` | Mounts `createSessionLayoutLoad()` | happyvertical/smrt#3378 (`smrt add`, mount by default) |
| `src/routes/setup/+page.svelte`, `+page.server.ts` | Mounts the owner-setup form and action | Same as above |
| `src/routes/settings/+page.svelte` | Mounts `ShellSettingsPage` | Same as above |
| `src/routes/api/_runtime/health/+server.ts`, `diagnostics/+server.ts` | Mount the health and diagnostics handlers | Same as above |
| `src/routes/.well-known/oauth-protected-resource/mcp/+server.ts` | RFC 9728 metadata for hosted bearer challenges; 404 in the local profile | Not filed: only a hosted profile uses it; revisit with happyvertical/smrt#3378 |
| `package.json` `name` (`@smrt-app/start`) | Must be a scoped name; an unscoped name breaks generated registration at runtime | Stays: happyvertical/smrt#3408 makes the scoped-name rule explicit and fails early instead |
| `vite.config.ts` (`objectsDir`) | The preset scans `src/lib/objects` by default; this app keeps models in `src/lib/models` | Not a gap: an app choice |
| `pnpm-workspace.yaml` (`minimumReleaseAgeExclude`) | Lets pnpm install s-m-r-t releases younger than its supply-chain age window | Not a smrt gap: entries can go once the release is older than the window |
| `svelte.config.js`, `tsconfig.json`, `src/app.html`, `vitest.config.ts`, `biome.json` | SvelteKit, TypeScript, Vitest, and Biome configuration | Not a smrt gap |

## Framework gaps

Tracked under happyvertical/smrt#3367. s-m-r-t 0.53.5 fixed everything the
earlier versions of this list named: `smrt app dev` binds `127.0.0.1` like the
invitation URL, and `smrt app` needs no `runtime` or `packages.cli.database`
config (#3410); signing in removes the invitation hand-off files (#3411); the
WebMCP `note_list` tool accepts the generated `{ items }` list (#3412); local
MCP tokens and the bridge's `--mcp-path` (#3413); the assistant mount's
defaults (#3414); `AppShell`'s dock registry (#3415); and the runtime-only
`smrt.ts` (#3416). s-m-r-t 0.55.1 fixed `/mcp` failing every `tools/list` and
`tools/call` with `Duplicate MCP tool name: agentconfig_list` (#3490), and
0.55.1 lets the MCP routes take the runtime directly, which removed this
template's last hand-written MCP wiring (#3491).

Still open on 0.55.1:

- **ChatGPT** needs a hosted profile with public OAuth; this template is
  local-only.

## License

MIT © Happy Vertical Corporation
