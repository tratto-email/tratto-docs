import type { Metadata } from 'next';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { setRequestLocale } from 'next-intl/server';

import { notFound } from 'next/navigation';

import { locales, toLocale } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/site';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface Endpoint {
  path: string;
  method: string;
  summary: string;
  operationId?: string;
}

interface OpenAPISpec {
  info?: { version?: string };
  tags?: { name: string; description?: string }[];
  paths?: Record<string, Record<string, unknown>>;
}

const METHOD_COLOURS: Record<string, string> = {
  GET: 'bg-sky-600',
  POST: 'bg-emerald-600',
  PUT: 'bg-amber-600',
  PATCH: 'bg-amber-600',
  DELETE: 'bg-red-600',
};

function loadSpec(): OpenAPISpec | null {
  const specPath = path.resolve(process.cwd(), 'public/openapi.json');
  if (!existsSync(specPath)) return null;
  try {
    return JSON.parse(readFileSync(specPath, 'utf-8')) as OpenAPISpec;
  } catch {
    // A malformed spec must not take the whole docs build down.
    return null;
  }
}

function groupByTag(spec: OpenAPISpec | null): Record<string, Endpoint[]> {
  const grouped: Record<string, Endpoint[]> = {};
  for (const [route, methods] of Object.entries(spec?.paths ?? {})) {
    for (const [method, raw] of Object.entries(methods)) {
      const details = raw as { tags?: string[]; summary?: string; operationId?: string };
      if (!details || typeof details !== 'object' || !details.tags) continue;
      for (const tag of details.tags) {
        (grouped[tag] ??= []).push({
          path: route,
          method: method.toUpperCase(),
          summary: details.summary ?? '',
          operationId: details.operationId,
        });
      }
    }
  }
  return grouped;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  if (!locale) notFound();

  const canonical = `/${locale}/docs/api-reference`;

  return {
    title: 'API Reference',
    description:
      'Every Tratto Email REST endpoint, generated from the live OpenAPI 3.1 specification.',
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, absoluteUrl(`/${l}/docs/api-reference`)]),
        ),
        'x-default': absoluteUrl('/en/docs/api-reference'),
      },
    },
  };
}

export default async function APIReferencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  if (!locale) notFound();

  setRequestLocale(locale);

  const spec = loadSpec();
  const endpointsByTag = groupByTag(spec);
  const tags = spec?.tags ?? [];

  return (
    <DocsPage
      toc={tags.map((tag) => ({
        title: tag.name,
        url: `#${slugify(tag.name)}`,
        depth: 2,
      }))}
      tableOfContent={{ style: 'clerk' }}
      breadcrumb={{ enabled: false }}
    >
      <DocsTitle>API Reference</DocsTitle>
      <DocsDescription>
        Generated from the live OpenAPI 3.1 specification
        {spec?.info?.version ? ` (v${spec.info.version})` : ''}.
      </DocsDescription>

      <DocsBody>
        {tags.length === 0 ? (
          <div className="border border-fd-border bg-fd-muted p-4 text-sm">
            The OpenAPI specification has not been synced yet. Run{' '}
            <code>pnpm sync-openapi</code> to fetch it from the API.
          </div>
        ) : (
          tags.map((tag) => (
            <section key={tag.name} className="mb-10">
              <h2 id={slugify(tag.name)}>{tag.name}</h2>
              {tag.description && <p>{tag.description}</p>}

              <div className="not-prose flex flex-col gap-2">
                {endpointsByTag[tag.name]?.map((endpoint) => (
                  <div
                    key={`${endpoint.method} ${endpoint.path}`}
                    className="border border-fd-border p-4 transition-colors hover:bg-fd-accent"
                  >
                    <div className="mb-1.5 flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 font-mono text-[11px] font-bold text-[#fff] ${
                          METHOD_COLOURS[endpoint.method] ?? 'bg-neutral-600'
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-[13px]">{endpoint.path}</code>
                    </div>
                    {endpoint.summary && (
                      <p className="m-0 text-[13px] text-fd-muted-foreground">
                        {endpoint.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </DocsBody>
    </DocsPage>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
