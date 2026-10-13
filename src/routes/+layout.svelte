<script lang="ts">
import {
  AssistantDock,
  createAssistantHttpTransport,
} from '@happyvertical/smrt-chat/svelte';
import { AppShell } from '@happyvertical/smrt-svelte/app';
import { CookbookApp } from '@happyvertical/smrt-svelte/cookbook';
import {
  ShellDockTool,
  type ShellNavItem,
} from '@happyvertical/smrt-svelte/workspace';
import type { Cookbook } from '@happyvertical/smrt-types';
import { webMcpToolDefinitions } from '@happyvertical/smrt-virt-web';
import type { ComponentProps } from 'svelte';
import { page } from '$app/state';
import { resolveExport } from '$lib/cookbook/exports';
import { signOut } from '$lib/sign-out';
import type { LayoutProps } from './$types';

type DockRegistry = Parameters<
  NonNullable<ComponentProps<typeof AppShell>['dock']>
>[0];

let { data, children }: LayoutProps = $props();

const nav: ShellNavItem[] = [
  { href: '/', label: 'Notes', icon: 'book', description: 'Your notes' },
  {
    href: '/settings',
    label: 'Settings',
    icon: 'settings',
    description: 'Appearance, account and layout',
  },
];

const transport = createAssistantHttpTransport({ endpoint: '/api/assistant' });

// Browser agents (WebMCP) get the generated read-only tools while the owner is
// signed in.
const webmcp = $derived(
  data.session.authenticated
    ? {
        definitions: webMcpToolDefinitions,
        basePath: '/api',
        effects: ['read' as const],
      }
    : false,
);

// The assistant's tools are the Notes tools, so it comes and goes with Notes.
const assistant = $derived(data.session.authenticated && data.notes);

// The shell builds `/s/<section>/` paths; this app's routes have no trailing slash.
const withoutTrailingSlash = (path: string) => path.replace(/(.)\/$/, '$1');

// Layout and overview edits are stored as the person's own preferences.
async function saveEdits(next: Cookbook) {
  await fetch('/api/cookbook/preferences', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(next),
  });
}
</script>

{#snippet dock(registry: DockRegistry)}
  {#if assistant}
    <ShellDockTool id="assistant" label="Assistant">
      {#snippet render()}
        <AssistantDock {transport} {registry} />
      {/snippet}
    </ShellDockTool>
  {/if}
{/snippet}

{#if data.cookbookApp}
  <CookbookApp
    cookbook={data.cookbookApp.cookbook}
    catalog={data.cookbookApp.catalog}
    {resolveExport}
    href={withoutTrailingSlash}
    title="smrt starter"
    currentHref={page.url.pathname}
    settingsHref="/settings"
    {webmcp}
    runtimeDiagnostics={data.session.authenticated}
    layoutEditing={data.session.authenticated}
    oncookbookchange={data.session.authenticated ? saveEdits : undefined}
    {dock}
  >
    {@render children()}
  </CookbookApp>
{:else}
  <AppShell
    title="smrt starter"
    nav={data.notes ? nav : nav.slice(1)}
    currentHref={page.url.pathname}
    settingsHref="/settings"
    {webmcp}
    runtimeDiagnostics={data.session.authenticated}
    edgeToggles={{ left: true }}
    config={{ left: { initial: 'expanded' } }}
    user={data.session.user}
    onSignOut={signOut}
    phoneTabBar
    chrome={!page.route.id?.startsWith('/setup')}
    {dock}
  >
    {@render children()}
  </AppShell>
{/if}
