# Tratto Docs Setup Guide

This is the documentation site for Tratto Email. It's built with Next.js, Fumadocs, and auto-generates API reference pages from the OpenAPI specification.

## Prerequisites

- Node.js 18+ or pnpm 8+
- Access to the OpenAPI spec (either from `https://api.tratto.email/docs/json` or locally)

## Installation

```bash
# Install dependencies
pnpm install

# Sync OpenAPI spec (optional on dev, automatic on build)
pnpm run sync-openapi

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
.
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout with Fumadocs provider
│   ├── page.tsx         # Homepage
│   ├── docs/            # Documentation routes
│   │   ├── layout.tsx   # Docs layout with sidebar
│   │   ├── page.tsx     # Docs homepage
│   │   └── [[...slug]]/page.tsx  # Dynamic doc pages
│   ├── api-reference/   # Auto-generated API reference (from openapi.json)
│   └── source.ts        # Fumadocs content loader
├── content/             # MDX documentation files
│   └── index.mdx        # Getting Started page
├── public/              # Static files
│   ├── openapi.json     # OpenAPI spec (synced from API)
│   └── openapi-template.json  # Template when API unavailable
├── scripts/
│   └── sync-openapi.js  # Script to fetch and sync OpenAPI spec
└── fumadocs.config.ts   # Fumadocs configuration
```

## OpenAPI Spec Sync

The project automatically syncs the OpenAPI specification during the build process:

```bash
# Manual sync
pnpm run sync-openapi

# Automatic on build
pnpm build
```

### Spec Sources (in order of priority)

1. **Live API** — Fetches from `https://api.tratto.email/docs/json`
2. **Local file** — Uses existing `public/openapi.json` if available
3. **Template** — Falls back to `public/openapi-template.json` if API is unreachable

### Keeping Spec in Sync

For production deployments, integrate the sync script into your CI/CD pipeline:

```yaml
# Example: GitHub Actions
- name: Sync OpenAPI spec
  run: pnpm run sync-openapi
  
- name: Build docs
  run: pnpm build
```

## Adding Documentation

### Content Structure

Create MDX files in `content/` to add new documentation:

```bash
content/
├── index.mdx                  # Getting Started
├── guides/
│   ├── sending-emails.mdx
│   ├── webhooks.mdx
│   └── error-handling.mdx
├── sdk/
│   ├── nodejs.mdx
│   └── python.mdx
└── api-reference/
    └── (auto-generated from openapi.json)
```

### MDX Frontmatter

Each MDX file should include metadata:

```mdx
---
title: Page Title
description: Brief description for SEO
---

# Page Title

Content goes here...
```

## Building for Production

```bash
# Build optimized site
pnpm build

# Test production build locally
pnpm start
```

## Configuration

- **Tailwind CSS** — `tailwind.config.ts`
- **Next.js** — `next.config.ts`
- **Fumadocs** — `fumadocs.config.ts`
- **TypeScript** — `tsconfig.json`

## Deployment

The site is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Netlify
- Docker
- Any Node.js hosting provider

### Environment Variables

None required for development. For production:

- `NEXT_PUBLIC_SITE_URL` — Full site URL (optional)

## Next Steps

1. ✅ Set up Next.js + Fumadocs project
2. ✅ Configure OpenAPI spec sync
3. ⏳ Generate API reference pages from spec
4. ⏳ Add documentation guides
5. ⏳ Set up CI/CD pipeline
6. ⏳ Deploy to production

## Troubleshooting

### "openapi.json not found"
- Run `pnpm run sync-openapi` to fetch the spec
- Or manually place the spec in `public/openapi.json`

### "Cannot find module 'fumadocs-ui'"
- Run `pnpm install` to ensure all dependencies are installed

### API reference pages not generating
- Verify `public/openapi.json` exists
- Check that it's valid OpenAPI 3.1.0 format
- Run the build command to trigger generation
