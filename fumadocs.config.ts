import { defineConfig } from 'fumadocs-mdx/config';
import { openAPI } from 'fumadocs-openapi/build';

export const config = defineConfig({
  codeblocks: {
    languages: {
      ts: 'typescript',
      js: 'javascript',
      jsx: 'jsx',
      tsx: 'tsx',
      py: 'python',
      json: 'json',
      yaml: 'yaml',
      sh: 'bash',
      curl: 'bash',
    },
  },
});

export const openapi = openAPI([
  {
    // Load the spec from the public directory
    // This will be populated by the sync-openapi script
    input: './public/openapi.json',
    output: './app/api-reference',
    per: 'tag',
  },
]);
