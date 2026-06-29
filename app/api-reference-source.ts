import { createOpenAPI } from 'fumadocs-openapi/server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const openapi = createOpenAPI({
  // Spec will be generated at build time
  // For development, the sync-openapi script populates public/openapi.json
  path: path.resolve(__dirname, '../public/openapi.json'),
});
