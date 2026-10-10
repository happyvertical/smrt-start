<script lang="ts">
import { RecipeScreens } from '@happyvertical/smrt-svelte/screens';
import { collectionDefinitions } from '@happyvertical/smrt-virt-web';
import { createRestSource } from '$lib/rest-source';
import type { PageProps } from './$types';

let { data }: PageProps = $props();

// The generated web definition of the entry's model (fields and exposed actions).
const definition = $derived(
  Object.values(collectionDefinitions).find(
    (candidate) => candidate.objectRef === data.entry.model,
  ),
);
const source = $derived(
  definition
    ? createRestSource(definition, { filter: data.entry.filter ?? undefined })
    : null,
);
</script>

<svelte:head><title>{data.entry.label}</title></svelte:head>

<main>
  {#if definition && source}
    {#key data.entry.id}
      <RecipeScreens {definition} {source} title={data.entry.label} />
    {/key}
  {:else}
    <h1>{data.entry.label}</h1>
    <p>
      {data.entry.className} has no generated web definition in this app, so
      there are no record screens for it yet.
    </p>
  {/if}
</main>

<style>
  main {
    padding: var(--smrt-spacing-6);
  }
</style>
