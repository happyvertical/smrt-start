import { SmrtObject, smrt } from '@happyvertical/smrt-core';
import { TenantScoped, tenantId } from '@happyvertical/smrt-tenancy';

/**
 * A note in the owner's workspace. This one declaration is the app's data
 * model: the `smrt()` Vite plugin turns it into the schema, the REST routes
 * under `/api/notes`, the WebMCP read tools, the assistant's `notes.read` /
 * `notes.create` tools, and the remote MCP read tools.
 */
@smrt({
  api: { include: ['list', 'get', 'create'], writable: ['title', 'body'] },
  mcp: { include: ['list', 'get', 'create'] },
})
@TenantScoped({ mode: 'required' })
export class Note extends SmrtObject {
  @tenantId()
  tenantId: string = '';

  title: string = '';

  body: string = '';
}
