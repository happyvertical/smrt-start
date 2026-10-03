<script lang="ts">
import { enhance } from '$app/forms';
import type { PageProps } from './$types';

let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>Notes</title>
</svelte:head>

<main>
  <h1>Notes</h1>

  {#if data.canCreate}
    <form method="POST" action="?/create" use:enhance>
      <label>
        Title
        <input name="title" required />
      </label>
      <label>
        Body
        <textarea name="body" rows="4"></textarea>
      </label>
      <button type="submit">Add note</button>
      {#if form?.error}<p role="alert">{form.error}</p>{/if}
    </form>
  {/if}

  {#if data.notes.length === 0}
    <p>No notes yet. Add one above, or ask the assistant to write one.</p>
  {:else}
    <ul>
      {#each data.notes as note (note.id)}
        <li>
          <h2>{note.title}</h2>
          {#if note.body}<p>{note.body}</p>{/if}
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  main {
    display: grid;
    gap: var(--smrt-spacing-6);
    width: min(100%, 48rem);
    margin-inline: auto;
    padding: var(--smrt-spacing-6);
  }

  form,
  label {
    display: grid;
    gap: var(--smrt-spacing-2);
  }

  input,
  textarea,
  button {
    padding: var(--smrt-spacing-2) var(--smrt-spacing-3);
    border-radius: var(--smrt-radius-medium);
    font: inherit;
  }

  input,
  textarea {
    border: 1px solid var(--smrt-color-outline);
    background: var(--smrt-color-surface);
    color: var(--smrt-color-on-surface);
  }

  button {
    justify-self: start;
    border: 0;
    background: var(--smrt-color-primary);
    color: var(--smrt-color-on-primary);
    cursor: pointer;
  }

  ul {
    display: grid;
    gap: var(--smrt-spacing-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding: var(--smrt-spacing-4);
    border: 1px solid var(--smrt-color-outline-variant);
    border-radius: var(--smrt-radius-large);
  }

  h1,
  h2,
  li p {
    margin: 0;
  }

  h2 {
    font-size: 1.1rem;
  }
</style>
