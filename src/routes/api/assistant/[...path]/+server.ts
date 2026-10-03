import { getAI } from '@happyvertical/ai';
import { buildManifestToolCatalog } from '@happyvertical/smrt-chat';
import { mountAssistantRoutes } from '@happyvertical/smrt-chat/sveltekit';
import {
  resolveConfiguredAIProvider,
  toAIClientOptions,
} from '@happyvertical/smrt-config';

import { runtime } from '$lib/server/smrt';

/** The only tools the assistant may call. The list is fail-closed. */
const allowedTools = ['notes.read', 'notes.create'];

await runtime.resolvedRuntime();

export const { GET, POST } = mountAssistantRoutes({
  // Provider, model, and key variable come from the `ai` block in smrt.config.ts.
  ai: () => getAI(toAIClientOptions(resolveConfiguredAIProvider())),
  db: runtime.databaseConfig(),
  allowedTools,
  tools: buildManifestToolCatalog({ allowedTools }),
  systemPrompt:
    'You are the assistant in a personal notes app. Use the notes tools to read and write the owner’s notes.',
});
