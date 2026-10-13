<script lang="ts">
import { ShellSettingsPage } from '@happyvertical/smrt-svelte/app';
import { signOut } from '$lib/sign-out';
</script>

<svelte:head>
  <title>Settings · smrt starter</title>
</svelte:head>

<!-- Appearance, account, and layout; preferences persist through the shell storageKey. -->
<ShellSettingsPage onSignOut={signOut} />
