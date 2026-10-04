import { mountAssistantRoutes } from '@happyvertical/smrt-chat/sveltekit';

import { runtime } from '$lib/server/smrt';

// Provider, model, and key variable come from the `ai` block in smrt.config.ts.
export const { GET, POST } = mountAssistantRoutes({
  runtime,
  /** The only tools the assistant may call. The list is fail-closed. */
  allowedTools: ['notes.read', 'notes.create'],
  systemPrompt:
    'You are the assistant in a personal notes app. Use the notes tools to read and write the owner’s notes.',
});
