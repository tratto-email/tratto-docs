# CLAUDE.md — tratto-docs

Documentation site for Tratto (`docs.tratto.email`). Bilingual EN/IT, built on
Next.js 15 App Router + Fumadocs + Tailwind v4.

Read [SETUP.md](./SETUP.md) for the full architecture; this file covers the
rules that are easy to get wrong.

Part of the Tratto multi-repo workspace — see `../CLAUDE.md` for the repo map
and `../GO-LIVE.md` for launch status. The API contract documented here is
owned by `tratto-api`; `pnpm build` runs `scripts/sync-openapi.js`, which
processes the locally checked-in `public/openapi.json` — when the contract
changes in `tratto-api`, that spec (and the MDX) must be updated here.

**This repo lags the contract, and that is the failure mode to watch for.**
Two contract changes released on 2026-09-04 were still undocumented on
2026-09-10, and an audit that day found pages describing behaviour the backend
does not have — a template `publish` gate that no code enforces, plan quotas
that are wrong in every row, and a page announcing automatic IP warming for a
function whose data nobody writes. When docs and code disagree, **the docs are
wrong until proven otherwise**: check `tratto-api/api/src/routes/v1/` before
trusting a page, and cite the file and line in the commit that corrects it.

A page that is merely missing costs a reader a search. A page that is wrong
costs them the search, the attempt, and their trust — fix those first.

**Drift runs in both directions.** `content/en/ip-warming.mdx:11-17` has said
since 2026-09-10 (0a498f9) that there is no per-workspace warming automation,
while the internal blueprint still described warming as a running system — the
blueprint was the file corrected, on 2026-09-16 (`../email-saas-blueprint.md`
§9, note at line 2810). Being right here settles nothing elsewhere, and being
wrong elsewhere does not make this repo wrong: correct whichever document is
actually wrong, rather than aligning to the other one on reflex.

**Check every DNS or API instruction against the endpoint's real response, not
against how it used to work.** Until 2026-09-14 `content/en/domains.mdx`
taught DKIM as a single `default._domainkey` TXT record (lines 89 and 118
before the fix); the API returns **three CNAMEs**, one per SES token
(`tratto-api/api/src/routes/v1/domains.ts:55-65`). The tables match it now
(`content/{en,it}/domains.mdx:85-87`, fixed in 4f20668 / PR #92). A record
type is exactly the detail memory gets confidently wrong — re-read the route
or call the endpoint before repeating one.

**CI budget**: GitHub Actions has a hard 3000 min/month org-wide (see
`../CLAUDE.md`). Replicate the full CI suite locally before opening a PR, and
verify that deploys actually ran — a green workflow is not a deployed site.

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

### Editorial decisions apply to every repo

A content decision taken in one repo is not done until it has been grepped
across the whole workspace. The first line of
`content/{en,it}/introduction.mdx` opened with "a competitive alternative to
Resend" from the page's creation (28d5673, 2026-06-30). The site dropped that
same claim on 2026-09-14 (`tratto`, a57e4f4, PR #276), but that round looked
only at `tratto`, so the docs kept serving it in both languages until
2026-09-16 (ddc96a8, PR #97) — same sentence, same decision, two days of
avoidable production drift. When an editorial line changes, grep `../` for it
before calling it applied.

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

**Never commit directly to `main`.** There is no `develop` branch.

```
<type>/<slug>  →  PR → main  →  merge  →  production + staging deploy (both from main)
```

Merging a PR publishes it. Both Firebase App Hosting backends roll out from
`main`, on the same commit, in parallel — staging is not a gate before
production, so the PR (local `pnpm lint && pnpm typecheck && pnpm build`, plus
the CI check) is the only review step:

| Branch | Backend | Config actually applied | Serves |
|---|---|---|---|
| `main` | `trattoemail` | `apphosting.yaml` | docs.tratto.email |
| `main` | `tratto-staging` | `apphosting.yaml` + `apphosting.staging.yaml` | tratto-docs--tratto-staging.europe-west4.hosted.app |

**The staging file is merged, not substituted.** The `tratto-staging` backend
has environment name `staging` (checked 2026-09-14), so App Hosting layers
`apphosting.staging.yaml` on top of `apphosting.yaml`: any variable the staging
file does not repeat keeps its **production** value. Staging overrides
`NEXT_PUBLIC_SITE_URL` (staging canonical, `robots.txt` `Disallow: /`,
`X-Robots-Tag: noindex`), `TRATTO_OPENAPI_URL`, and `NEXT_PUBLIC_GTM_ID`
(`none` — the layout loads GTM only for IDs starting with `GTM-`, because App
Hosting treats empty strings as reserved). Adding a variable to
`apphosting.yaml` means deciding its staging value in the same PR. The
`docs.staging.tratto.email` domain has no DNS record and is not mapped.

A green merge is not a deployed site: check that both
`App Hosting - Rollout (…/tratto-docs)` check runs on the `main` commit
succeeded (`gh api repos/{owner}/{repo}/commits/<sha>/check-runs`).

**Wait for the fourth minute.** The rollout checks finish roughly 4 min after
the merge commit (2026-09-16: commit 16:56:40Z, both rollouts completed
17:00:56Z; every deploy commit since 2026-09-13 lands between 3m42s and
4m36s). Reading the checks earlier reports a missing rollout that has simply
not appeared yet.

**And expect gaps in the check runs.** Only the merge commit carries rollouts
— the branch commits in its history have none, which is normal — but on merge
commits a backend's check run sometimes never shows up: 23e0ed1 (2026-09-14)
reports only `trattoemail`, 9f49fb2 only `tratto-staging`. It is not specific
to one backend, and it is **unresolved** whether the rollout failed to start
or only failed to publish its check — the installed `gcloud` has no App
Hosting surface to settle it. So "both green" is not always provable from the
check runs: when one is missing, confirm against the served site instead of
assuming either outcome.

### Releases

Tratto has **one product version number**, shared by API, dashboard, site and
docs; the SDKs (`tratto-node`, `tratto-python`) are versioned separately.
`tratto-api` is the reference: keep `version` in `package.json` equal to its
current release, and check it rather than assuming
(`gh release list --repo tratto-email/tratto-api`).

The other repos bump `version` on `develop`, before the release PR. **This
repo has no `develop`** (see the workflow above), so the bump goes in the PR
that accompanies the release — there is no integration branch here to put it
on, and applying the `develop` rule by analogy just stalls the release.

Tag the production commit on `main`:

```bash
gh release create vX.Y.Z --target "$(git rev-parse origin/main)" --title vX.Y.Z --generate-notes
```

`--target` needs the **full 40-character sha**: a short sha is rejected with
`HTTP 422 … Release.target_commitish is invalid` (hit on `tratto-email/tratto`,
2026-09-16).

Use the same `vX.Y.Z` as `tratto-api`, `tratto-app` and `tratto`.
