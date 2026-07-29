# tratto-docs

Documentation site for [tratto.email](https://tratto.email) — served at **docs.tratto.email**.

Bilingual (EN/IT) documentation built with Next.js 15 App Router, Fumadocs and
Tailwind v4, using the same design tokens as the marketing site.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000 → redirects to /en
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with MDX hot reload |
| `pnpm build` | Syncs the OpenAPI spec, then builds |
| `pnpm start` | Serves the production build |
| `pnpm lint` | ESLint (flat config) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm sync-openapi` | Fetches `openapi.json` from the API |
| `pnpm lighthouse` | Lighthouse CI against the local build |

## Writing docs

Pages are MDX files under `content/<locale>/`:

```
content/en/quickstart.mdx   →  /en/docs/quickstart
content/it/quickstart.mdx   →  /it/docs/quickstart
```

Frontmatter:

```yaml
---
title: Send Email
description: Send transactional emails via POST /v1/emails.
draft: false            # optional — excluded from the sitemap and marked noindex
updatedAt: 2026-07-01   # optional — overrides the git commit date as sitemap lastmod
---
```

Two things to know when writing MDX:

- **Internal links must include the locale**: `/en/docs/send-email`, not `/docs/send-email`.
- **Braces are JSX.** `{id}` in prose is evaluated as JavaScript and breaks the
  build — wrap it in backticks: `` `GET /v1/emails/{id}` ``.

A page without an Italian translation automatically falls back to English. The
fallback is excluded from the sitemap and its canonical points at the English
URL, so it never competes with the original in search results.

See [SETUP.md](./SETUP.md) for architecture and deployment.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and PR
workflow, and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community
standards.
