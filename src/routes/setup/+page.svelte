<script lang="ts">
import { OwnerSetupForm } from '@happyvertical/smrt-svelte/app';
import { enhance } from '$app/forms';
import type { PageProps } from './$types';

let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Set up smrt starter</title></svelte:head>

<OwnerSetupForm {data} {form} {enhance} />
