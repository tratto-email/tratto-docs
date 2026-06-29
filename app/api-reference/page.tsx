import Link from 'next/link';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export default function APIReferencePage() {
  let spec = null;
  const specPath = path.resolve(process.cwd(), 'public/openapi.json');

  if (existsSync(specPath)) {
    try {
      const specContent = readFileSync(specPath, 'utf-8');
      spec = JSON.parse(specContent);
    } catch (error) {
      console.error('Failed to parse OpenAPI spec:', error);
    }
  }

  const tags = spec?.tags || [];
  const paths = spec?.paths || {};

  // Group endpoints by tag
  const endpointsByTag: Record<string, any[]> = {};
  Object.entries(paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, details]: [string, any]) => {
      if (typeof details === 'object' && details.tags) {
        details.tags.forEach((tag: string) => {
          if (!endpointsByTag[tag]) {
            endpointsByTag[tag] = [];
          }
          endpointsByTag[tag].push({
            path,
            method: method.toUpperCase(),
            summary: details.summary || 'No summary',
            operationId: details.operationId,
          });
        });
      }
    });
  });

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>API Reference</h1>
      <p>
        Complete REST API documentation for Tratto Email. All endpoints require authentication
        with an API key in the <code>Authorization</code> header.
      </p>

      {tags.length > 0 ? (
        <div className="space-y-8">
          {tags.map((tag) => (
            <section key={tag.name}>
              <h2>{tag.name}</h2>
              <p>{tag.description || 'API endpoints'}</p>

              <div className="space-y-3 not-prose">
                {endpointsByTag[tag.name]?.map((endpoint) => (
                  <div
                    key={`${endpoint.method}-${endpoint.path}`}
                    className="border rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-mono font-bold text-white ${
                          endpoint.method === 'GET'
                            ? 'bg-blue-500'
                            : endpoint.method === 'POST'
                              ? 'bg-green-500'
                              : endpoint.method === 'PUT'
                                ? 'bg-yellow-500'
                                : endpoint.method === 'DELETE'
                                  ? 'bg-red-500'
                                  : 'bg-gray-500'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-slate-600 dark:text-slate-400">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 m-0">
                      {endpoint.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm">
            📥 <strong>Syncing OpenAPI spec...</strong> Run{' '}
            <code>pnpm run sync-openapi</code> to fetch the API specification.
          </p>
        </div>
      )}

      <hr />

      <h2>Getting Started with the API</h2>
      <ol>
        <li>
          <strong>Get an API Key</strong> — Create one in your Tratto dashboard
        </li>
        <li>
          <strong>Authenticate Requests</strong> — Include your key in the{' '}
          <code>Authorization: Bearer YOUR_API_KEY</code> header
        </li>
        <li>
          <strong>Make Your First Request</strong> — Use cURL, your SDK, or any HTTP client
        </li>
        <li>
          <strong>Handle Errors</strong> — Check the error response format and status codes
        </li>
      </ol>
    </div>
  );
}
