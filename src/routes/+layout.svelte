<script lang="ts">
import {
  AssistantDock,
  createAssistantHttpTransport,
} from '@happyvertical/smrt-chat/svelte';
import { AppShell } from '@happyvertical/smrt-svelte/app';
import {
  ShellDockTool,
  type ShellNavItem,
} from '@happyvertical/smrt-svelte/workspace';
import { createDataSurfaceRegistry } from '@happyvertical/smrt-ui/data';
import { webMcpToolDefinitions } from '@happyvertical/smrt-virt-web';
import { page } from '$app/state';
import type { LayoutProps } from './$types';

let { data, children }: LayoutProps = $props();

const nav: ShellNavItem[] = [
  { href: '/', label: 'Notes' },
  { href: '/settings', label: 'Settings' },
];

const transport = createAssistantHttpTransport({ endpoint: '/api/assistant' });
const surfaces = createDataSurfaceRegistry();

// Browser agents (WebMCP) get the generated read-only Note tools while the
// owner is signed in.
const webmcp = $derived(
  data.session.authenticated
    ? {
        definitions: webMcpToolDefinitions,
        basePath: '/api',
        effects: ['read' as const],
      }
    : false,
);
</script>

<AppShell
  title="smrt starter"
  {nav}
  currentHref={page.url.pathname}
  settingsHref="/settings"
  {webmcp}
  runtimeDiagnostics={data.session.authenticated}
>
  {#snippet dock()}
    {#if data.session.authenticated}
      <ShellDockTool id="assistant" label="Assistant">
        {#snippet render()}
          <AssistantDock {transport} registry={surfaces} />
        {/snippet}
      </ShellDockTool>
    {/if}
  {/snippet}
  {@render children()}
</AppShell>
