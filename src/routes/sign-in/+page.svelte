<script lang="ts">
import { goto } from '$app/navigation';

let email = $state('');
let password = $state('');
let error = $state('');
let busy = $state(false);

async function signIn(event: SubmitEvent) {
  event.preventDefault();
  busy = true;
  error = '';
  const response = await fetch('/auth/password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  busy = false;
  if (response.ok) {
    await goto('/', { invalidateAll: true });
    return;
  }
  error =
    response.status === 429
      ? 'Too many attempts. Try again later.'
      : 'Email or password is not right.';
}
</script>

<svelte:head><title>Sign in</title></svelte:head>

<main>
  <h1>Sign in</h1>
  <form onsubmit={signIn}>
    <label>Email <input type="email" bind:value={email} autocomplete="username" required /></label>
    <label>Password <input type="password" bind:value={password} autocomplete="current-password" required /></label>
    {#if error}<p role="alert">{error}</p>{/if}
    <button type="submit" disabled={busy}>Sign in</button>
  </form>
</main>

<style>
  main { max-width: 22rem; margin: 4rem auto; padding: 0 1rem; display: grid; gap: 1rem; }
  form, label { display: grid; gap: 0.5rem; }
  input { padding: 0.5rem; font: inherit; }
  button { padding: 0.6rem; font: inherit; }
</style>
