# CLAUDE.md — tratto-docs

Documentation site for Tratto (`docs.tratto.email`). Bilingual EN/IT, built on
Next.js 15 App Router + Fumadocs + Tailwind v4.

This file holds only the rules a docs writer gets wrong. Everything else has
one home and is not repeated here:

- [SETUP.md](./SETUP.md) — stack, hosting (both App Hosting backends deploy
  from `main`), design-token layering, the Fumadocs source shim, OpenAPI sync,
  release procedure.
- `../CLAUDE.md` — cross-repo method: CI budget (rule 6), "grep every repo
  before calling a content decision applied" (lesson 11), "wait for the fourth
  minute" (lesson 3), full sha for `gh release create` (lesson 10).
- `../GO-LIVE.md` — launch status.

## The API contract is owned by `tratto-api`

`pnpm build` runs `scripts/sync-openapi.js`, which tries `$TRATTO_OPENAPI_URL`,
then `https://api-staging.tratto.email/docs/json`, then
`https://api.tratto.email/docs/json` (`scripts/sync-openapi.js:13-24`); a URL
that fails is skipped silently (`:64-76`), and only when all fail does it fall
back to an existing `public/openapi.json`, then to `public/openapi-template.json`
(`:83-104`). `public/openapi.json` is **gitignored** (`.gitignore:40`) — the
only committed spec is the template. When the contract changes in
`tratto-api`, update the MDX here; never invent the contract.

**Production does not serve the spec** (verified 2026-09-18):
`https://api.tratto.email/docs/json` answers **404**, because
`deploy-production-api.yml:70` sets `API_DOCS_ENABLED=false` and
`plugins/swagger.ts:43-48` registers `/docs/json` only together with the UI.
The build never fails for this — the URL is skipped — so today the API
reference is built from the **staging** spec
(`api-staging.tratto.email/docs/json`, 200, 68 paths). Until tratto-api#439 is
closed, check before every rollout that staging and production run the same
version (`GET /health` on both). Also: `spec.info.version` is `1.0.0`
hardcoded (`swagger.ts:16`), not the product version.

**This repo lags the contract, and that is the failure mode to watch for.**
Two contract changes released on 2026-09-04 were still undocumented on
2026-09-10, and an audit that day found pages describing behaviour the backend
does not have (a template `publish` gate no code enforces, plan quotas wrong
in every row, automatic IP warming for a function nobody writes data to).
When docs and code disagree, **the docs are wrong until proven otherwise**:
check `tratto-api/api/src/routes/v1/` before trusting a page, and cite file
and line in the commit that corrects it. A missing page costs a reader a
search; a wrong page costs the search, the attempt and their trust — fix
those first.

**Drift runs in both directions.** `content/en/ip-warming.mdx:11-17` has said
since 2026-09-10 (0a498f9) that there is no per-workspace warming; the
internal blueprint still described warming as running, and the blueprint was
the file corrected (2026-09-16, `../email-saas-blueprint.md` §9). Correct
whichever document is actually wrong, never align to the other on reflex.

**Check every DNS or API instruction against the endpoint's real response.**
Until 2026-09-14 `content/en/domains.mdx` taught DKIM as one
`default._domainkey` TXT; the API returns **three CNAMEs**
(`tratto-api/api/src/routes/v1/domains.ts:55-65`; tables fixed in 4f20668,
PR #92). A record type is exactly the detail memory gets confidently wrong —
re-read the route or call the endpoint before repeating one.

---

## Commands

```bash
pnpm dev          # localhost:3000 → /en
pnpm build        # sync-openapi + next build
pnpm lint         # eslint (flat config)
pnpm typecheck    # tsc --noEmit
pnpm lighthouse   # Lighthouse CI budgets (lighthouserc.json)
```

Run `pnpm lint && pnpm typecheck && pnpm build` before opening a PR — CI
(`.github/workflows/ci.yml`) runs exactly these three.

---

## Writing content

MDX lives in `content/<locale>/`. `content/en/foo.mdx` → `/en/docs/foo`.

```yaml
---
title: Send Email                 # required
description: One sentence.        # meta description and OG card
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
intentional and the SEO layer handles it — do not add stub translations.

An editorial decision taken elsewhere is not applied until it is applied here
too (`../CLAUDE.md`, lesson 11): the Resend claim in `introduction.mdx`
outlived the site's removal by two days (fixed in ddc96a8, PR #97).

---

## Code rules

1. **Locale narrowing.** Next types route `params` as `{ locale: string }`:
   `const locale = toLocale((await params).locale); if (!locale) notFound();`
2. **URLs come from `lib/site.ts`.** `docsPath(locale, slug)` and
   `absoluteUrl(path)` — canonical, hreflang and sitemap share one implementation.
3. **Real translation vs fallback.** `hasTranslation(slug, locale)` from
   `lib/source.ts` is the only correct question; `source.getPage()` returns the
   fallback and will lie to you.
4. **The `lib/source.ts` shim** (SETUP.md § A known version quirk) stays until
   Fumadocs 16 + Next 16.
5. **Design tokens.** `app/design-tokens.css` is a verbatim copy of
   `tratto/packages/design-tokens/tokens.css`; verify with `cmp` against
   `tratto`'s `develop`. Never edit it to fix the docs — not even a comment
   (a docs-only NOTE comment broke byte identity: present since 0b315dc,
   2026-07-25, found 2026-09-17). Docs-only adjustments go in `globals.css`
   (SETUP.md § Design tokens). Easy to get wrong:
   - base type scale is **14px** (`--text-base`), not 16px;
   - page background is `--color-paper`; `--color-white` is the *elevated*
     surface and becomes `#1A1A1A` in dark mode — never Tailwind `text-white`
     on a coloured background, use a literal `#fff`;
   - radius is 0 by default (`--radius-pill` / `--radius-circle` are the only
     exceptions); flat is the brand: no shadows except `--shadow-focus`.

---

## Git workflow

**Never commit directly to `main`.** This is a rule, not a guard: `main` has
no branch protection (`gh api repos/tratto-email/tratto-docs/branches/main/protection`
→ `404 Branch not protected`, 2026-09-18). There is no `develop`.

```
<type>/<slug>  →  PR → main  →  merge  →  production + staging rollout (both from main)
```

Merging publishes: both App Hosting backends roll out the same commit in
parallel, so staging is not a gate and the PR is the only review step
(SETUP.md § Branching and deployment for the backends and the staging
overrides). After the merge, confirm both `App Hosting - Rollout (…/tratto-docs)`
check runs on the merge commit succeeded
(`gh api repos/tratto-email/tratto-docs/commits/<sha>/check-runs`); they land
around the fourth minute (`../CLAUDE.md`, lesson 3) and one may be missing —
SETUP.md explains what to do then.

### Releases

One product version shared with `tratto-api`, `tratto-app`, `tratto`
(`gh release list --repo tratto-email/tratto-api` is the reference; SDKs are
versioned separately). No `develop` here, so the bump goes in the PR that
accompanies the release. Every release gets a `vX.Y.Z` tag on the `main`
commit that published it, created with the full sha — procedure in
SETUP.md § Releases.
