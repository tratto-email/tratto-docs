# CLAUDE.md — tratto-docs

Documentation site for Tratto (`docs.tratto.email`). Bilingual EN/IT, built on
Next.js 15 App Router + Fumadocs + Tailwind v4.

Read [SETUP.md](./SETUP.md) for the full architecture; this file covers the
rules that are easy to get wrong.

---

## Commands

```bash
pnpm dev          # localhost:3000 → /en
pnpm build        # sync-openapi + next build
pnpm lint         # eslint (flat config)
pnpm typecheck    # tsc --noEmit
pnpm lighthouse   # Lighthouse CI budgets
```

Run `pnpm lint && pnpm typecheck && pnpm build` before opening a PR — CI runs
exactly these three.

---

## Writing content

MDX lives in `content/<locale>/`. `content/en/foo.mdx` → `/en/docs/foo`.

```yaml
---
title: Send Email                 # required
description: One sentence.        # used for meta description and the OG card
draft: true                       # optional — noindex + excluded from sitemap
updatedAt: 2026-07-01             # optional — overrides git date as sitemap lastmod
---
```

Two rules that will otherwise break the build or the links:

1. **Locale-prefixed internal links.** Write `/en/docs/send-email`.
   Never `/docs/send-email` or `/docs/en/send-email`.
2. **Braces are JSX expressions.** `{id}` in prose compiles to a JavaScript
   identifier and fails the build with `ReferenceError: id is not defined`.
   Wrap it in a code span: `` `GET /v1/emails/{id}` ``.

A page missing from `content/it/` falls back to the English version. That is
intentional, and the SEO layer handles it — do not add stub translations just
to fill the gap.

---

## Architecture rules

### 1. Locale narrowing

Next types route `params` as `{ locale: string }`. Always narrow before use:

```typescript
const locale = toLocale((await params).locale);
if (!locale) notFound();
```

### 2. URLs come from `lib/site.ts`

Use `docsPath(locale, slug)` and `absoluteUrl(path)`. Never hand-build a docs
URL — canonical, hreflang and the sitemap all depend on one implementation.

### 3. Real translation vs fallback

`hasTranslation(slug, locale)` from `lib/source.ts` is the only correct way to
ask whether a locale genuinely has a page. `source.getPage()` returns the
fallback and will lie to you.

### 4. The Fumadocs source shim

`lib/source.ts` normalises `source.files` between `fumadocs-mdx@11` (factory)
and `fumadocs-core@15` (array). Leave it until Fumadocs 16 + Next 16.

### 5. Design tokens

`app/design-tokens.css` is a **shared file, copied verbatim** from
`tratto-email/tratto`. Keep it byte-identical — never edit a value there to fix
something in the docs. Docs-only adjustments belong in `globals.css`, which:

- bridges the token file's `prefers-color-scheme` switch to the `.light` /
  `.dark` classes the theme toggle writes;
- remaps Fumadocs' `--color-fd-*` onto token **names** (not values), so dark
  mode flows through without a second mapping;
- repoints `--font-display` / `--font-body` / `--font-mono` at the `next/font`
  variables, because the shared file names families literally and Next
  self-hosts them under hashed names.

Things that are easy to get wrong:

- The base type scale is **14px** (`--text-base`), not the 16px browser default.
- The page background is `--color-paper` (#F7F4EF); `--color-white` is the
  *elevated* surface for cards and code blocks. In dark mode `--color-white`
  becomes `#1A1A1A` — so never use Tailwind's `text-white` on a coloured
  background, use a literal `#fff`.
- Radius is 0 by default. `--radius-pill` and `--radius-circle` are the only
  sanctioned exceptions.
- Flat is the brand: no shadows except `--shadow-focus`.

---

## Git workflow

**Never commit directly to `main` or `develop`.**

```
feat/<slug>  →  PR → develop  →  staging deploy
                                    ↓ (release PR)
                                  main  →  production deploy
```

| Push to | Deploys to |
|---|---|
| `develop` | docs.staging.tratto.email |
| `main` | docs.tratto.email |
