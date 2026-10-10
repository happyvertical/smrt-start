<script lang="ts">
import { RecipeScreens } from '@happyvertical/smrt-svelte/screens';
import { collectionDefinitions } from '@smrt/web';
import { entryRecords } from '$lib/cookbook/records';
import type { PageProps } from './$types';

let { data }: PageProps = $props();

// The generated web definition of the entry's model and a source over its
// `/api/<collection>` routes. `@smrt/web` covers the cookbook's package models,
// which the `smrt()` preset hosts; a model the API does not expose has no
// definition and gets the notice below.
const records = $derived(entryRecords(collectionDefinitions, data.entry));
</script>

<svelte:head><title>{data.entry.label}</title></svelte:head>

<main>
  {#if records}
    {#key data.entry.id}
      <RecipeScreens definition={records.definition} source={records.source} title={data.entry.label} />
    {/key}
  {:else}
    <h1>{data.entry.label}</h1>
    <p>
      {data.entry.className} is not exposed over this app's API, so there
      are no record screens for it.
    </p>
  {/if}
</main>

<style>
  main {
    padding: var(--smrt-spacing-6);
  }
</style>
