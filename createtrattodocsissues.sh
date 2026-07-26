#!/usr/bin/env bash
# Creates all tratto-docs GitHub issues.
# Requirements: gh CLI authenticated with access to tratto-email/tratto-docs
# Usage: bash create-tratto-docs-issues.sh

set -euo pipefail
REPO="tratto-email/tratto-docs"

create() {
  local title="$1"
  local body="$2"
  local label="$3"
  gh issue create --repo "$REPO" --title "$title" --body "$body" --label "$label"
  echo "  ✓ $title"
}

echo "Creating Epic 0 — Project Setup..."

create \
  "[Setup] Initialize Fumadocs + Next.js 15 App Router project" \
'## Goal
Bootstrap the `tratto-docs` repository with Fumadocs and Next.js 15 App Router.

## Tasks
- [ ] `pnpm create fumadocs-app` with Next.js App Router template
- [ ] Configure `tsconfig.json` with strict mode and `@/*` path alias
- [ ] Set up `pnpm` workspaces (include `packages/design-tokens`)
- [ ] Add `.nvmrc` / `engines` field pinned to Node.js 22
- [ ] Configure `next.config.ts` with Fumadocs + MDX plugin
- [ ] Add `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` scripts
- [ ] Verify `pnpm dev` boots on `localhost:3000`

## References
- Fumadocs: https://fumadocs.vercel.app
- Existing stack in `tratto-email/tratto`: Next.js 15, React 19, TypeScript 6, Tailwind v4' \
  "enhancement"

create \
  "[Setup] Configure shared design tokens from tratto marketing site" \
'## Goal
Ensure `docs.tratto.email` uses the exact same design tokens as `tratto.email` — no visual drift.

## Tasks
- [ ] Copy `packages/design-tokens/tokens.css` from `tratto-email/tratto` (or link as npm package)
- [ ] Import tokens in `app/globals.css`
- [ ] Configure `next/font/google` with `DM_Serif_Display`, `Inter`, `JetBrains_Mono`
- [ ] Map font CSS variables identically (`--font-display`, `--font-body`, `--font-mono`)
- [ ] Override Fumadocs default theme variables to use Tratto tokens
- [ ] Verify 0px border-radius default throughout

## Token reference
```css
--color-ink:    #0D0D0D
--color-score:  #C8382A   /* vermiglio — brand accent */
--color-paper:  #F7F4EF
--color-white:  #FFFFFF
--font-display: "DM Serif Display", Georgia, serif
--font-body:    "Inter", system-ui, sans-serif
--font-mono:    "JetBrains Mono", monospace
```' \
  "enhancement"

create \
  "[Setup] Configure next-intl for en/it bilingual routing" \
'## Goal
Mirror the i18n setup from `tratto-email/tratto`: always-explicit locale prefix (`/en/`, `/it/`), default locale `en`.

## Tasks
- [ ] Install `next-intl` (same version as tratto web: `4.13.x`)
- [ ] Create `i18n/routing.ts` with locales `["en", "it"]`, defaultLocale `"en"`
- [ ] Create `middleware.ts` for locale detection and redirect
- [ ] Scaffold `messages/en.json` and `messages/it.json` with nav/meta keys
- [ ] Wrap app in `NextIntlClientProvider`
- [ ] Add `hreflang` (`en`, `it`, `x-default=en`) to root layout `<head>`
- [ ] Locale redirect from `/` → `/en/`

## URL pattern
`/en/getting-started/quickstart`, `/it/getting-started/quickstart`' \
  "enhancement"

create \
  "[Setup] Configure Orama local full-text search" \
'## Goal
Instant, private, zero-dependency local search across all documentation pages.

## Tasks
- [ ] Enable Fumadocs built-in Orama search integration
- [ ] Configure index to include title, description, and body content from all MDX pages
- [ ] Build `⌘K` / `Ctrl+K` search modal trigger
- [ ] Style modal with Tratto design tokens (color-paper background, color-score highlight)
- [ ] Locale-scoped search (en results on `/en/`, it results on `/it/`)
- [ ] Test search across multiple pages

## Why Orama over Algolia
- No third-party account — GDPR-compliant
- Zero latency (runs fully in-browser)
- Works offline' \
  "enhancement"

create \
  "[Setup] Firebase App Hosting config for docs.tratto.email and docs.staging.tratto.email" \
'## Goal
Set up Firebase App Hosting deployments for both subdomains.

## Tasks
- [ ] Create `apphosting.yaml` mirroring `tratto-email/tratto`
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://docs.tratto.email` (prod)
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://docs.staging.tratto.email` (staging)
- [ ] Add `NEXT_PUBLIC_GTM_ID` env var
- [ ] Create App Hosting backend for prod (GCP: `trattoemail`)
- [ ] Create App Hosting backend for staging (GCP: `tratto-staging`)
- [ ] Verify custom domain mapping for both subdomains

## apphosting.yaml template
```yaml
runConfig:
  runCommand: pnpm start
  env:
    - variable: NEXT_PUBLIC_SITE_URL
      value: https://docs.tratto.email
      availability: [BUILD, RUNTIME]
```' \
  "enhancement"

create \
  "[Setup] CI/CD: branch protection and deploy workflow" \
'## Goal
Automated deployments on push, matching the pattern used in `tratto-email/tratto`.

## Tasks
- [ ] Document deploy flow in CLAUDE.md (Firebase App Hosting auto-deploys on git push)
- [ ] Confirm Firebase App Hosting linked: `main` → prod, `develop` → staging
- [ ] Add GitHub Actions workflow: `pnpm lint && pnpm typecheck && pnpm build` on PR
- [ ] Protect `main` branch: require PR + passing checks
- [ ] Protect `develop` branch: require passing checks

## Branch strategy
```
feat/<slug>  →  PR → develop  →  docs.staging.tratto.email
                                         ↓ (release PR)
                                       main  →  docs.tratto.email
```' \
  "enhancement"

create \
  "[Setup] Security headers, robots.txt, and sitemap" \
'## Goal
Harden the docs site and ensure correct crawler behavior.

## Tasks
- [ ] Add security headers in `next.config.ts` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [ ] `app/robots.ts` — allow all crawlers on prod, noindex on staging
- [ ] `app/sitemap.ts` — dynamically generate from all MDX pages in both locales
- [ ] Add `X-Robots-Tag: noindex` response header on staging domain

## CSP baseline
```
default-src '"'"'self'"'"';
script-src '"'"'self'"'"' '"'"'unsafe-inline'"'"' https://www.googletagmanager.com;
style-src '"'"'self'"'"' '"'"'unsafe-inline'"'"';
font-src '"'"'self'"'"' https://fonts.gstatic.com;
```' \
  "enhancement"

echo ""
echo "Creating Epic 1 — Layout & Navigation..."

create \
  "[Layout] Docs layout shell: sidebar + topbar + content + TOC" \
'## Goal
Create the primary docs layout that wraps all documentation pages.

## Layout structure
```
┌─────────────────────────────────────────┐
│  Topbar (logo, search, lang, nav links) │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Content area                │
│ (200px)  │                    │  TOC   │
│          │                    │ (sticky│
│          │                    │ right) │
└──────────┴──────────────────────────────┘
```

## Tasks
- [ ] Create `app/[locale]/layout.tsx` wrapping Fumadocs layout
- [ ] Sidebar width: 200px (matches `--sidebar-width` token)
- [ ] Topbar height: 52px (matches `--topbar-height` token)
- [ ] Content max-width: 1060px (`--content-max-width` token)
- [ ] Sticky topbar on scroll
- [ ] Responsive: sidebar collapses to drawer on mobile' \
  "enhancement"

create \
  "[Layout] Sidebar navigation with collapsible sections" \
'## Goal
Build the left-hand sidebar that reflects the full docs structure.

## Tasks
- [ ] Auto-generate sidebar from MDX file tree via Fumadocs `getTree()`
- [ ] Collapsible section groups (Getting Started, Emails, Domains, etc.)
- [ ] Active page highlight with `--color-score` left border accent
- [ ] Smooth expand/collapse animation
- [ ] Persist open/closed state in localStorage
- [ ] Keyboard navigable (arrow keys, Enter)
- [ ] Scrollable independently of content area

## Design
- No border-radius on items (0px default)
- Active: `background: var(--color-score-10)`, `border-left: 2px solid var(--color-score)`
- Font: `--font-body`, 13px, weight 500' \
  "enhancement"

create \
  "[Layout] In-page Table of Contents (sticky right column)" \
'## Goal
Auto-generated TOC from MDX headings, sticking to the right side of the content area.

## Tasks
- [ ] Extract h2/h3 headings from MDX via Fumadocs `getToc()`
- [ ] Sticky positioning on desktop (top: 52px + 24px)
- [ ] Auto-highlight current section on scroll (Intersection Observer)
- [ ] Smooth scroll to heading on click
- [ ] Hide on mobile (< 1024px)
- [ ] "On this page" label in eyebrow style (`--tracking-eyebrow`, 10px, uppercase)

## Design
- Width: ~200px
- Items: 12px font, `--color-ink-40` default, `--color-score` active
- No bullets, no border-radius' \
  "enhancement"

create \
  "[Layout] Breadcrumbs component" \
'## Goal
Show the current page location within the docs hierarchy.

## Tasks
- [ ] Auto-generate from page path (e.g. Docs / Flows / Triggers)
- [ ] Use `next-intl` for locale-aware paths
- [ ] Render as `<nav aria-label="breadcrumb">` with schema.org BreadcrumbList JSON-LD
- [ ] Truncate long breadcrumbs on mobile with ellipsis
- [ ] Last item is non-linked (current page)

## Design
- 12px font, `--color-ink-40`
- Separator: `/` in `--color-ink-20`
- No background, no border' \
  "enhancement"

create \
  "[Layout] Shared top navbar (coherent with tratto.email)" \
'## Goal
The docs topbar should feel like a natural extension of the Tratto marketing site.

## Tasks
- [ ] Tratto wordmark/logo (left) linking to `tratto.email`
- [ ] "Docs" active indicator in nav
- [ ] Links: Home, Pricing, Blog, Status (same order as marketing nav)
- [ ] Language switcher (EN / IT)
- [ ] Search trigger button (⌘K) — right side
- [ ] "Get started" CTA button (vermiglio, `--color-score`)
- [ ] Fixed/sticky on scroll, 52px height

## Reuse
Share `TrattoWordmark` component pattern from `tratto-email/tratto`' \
  "enhancement"

create \
  "[Layout] Mobile drawer navigation" \
'## Goal
Replace sidebar with a slide-in drawer on mobile (< 768px).

## Tasks
- [ ] Hamburger button in topbar on mobile
- [ ] Full-height drawer from left, overlays content
- [ ] Backdrop overlay (semi-transparent, closes drawer on click)
- [ ] Focus trap inside drawer while open
- [ ] Close on Escape key
- [ ] Same tree structure as desktop sidebar
- [ ] Smooth slide-in/out animation (180ms ease)' \
  "enhancement"

create \
  "[Layout] Search modal with ⌘K / Ctrl+K trigger" \
'## Goal
Keyboard-accessible search modal powered by Orama (see Setup issue).

## Tasks
- [ ] Global keydown listener for `⌘K` (Mac) and `Ctrl+K` (Win/Linux)
- [ ] Search button in topbar opens same modal on click
- [ ] Modal overlay with focus trap
- [ ] Input with instant results as you type (debounce 120ms)
- [ ] Results grouped by section, show page title + excerpt
- [ ] Keyboard navigation: arrow keys to move, Enter to go, Escape to close
- [ ] "No results" empty state

## Design
- Modal: `--color-white` background, 0px radius, `--shadow-focus` on input
- Highlight matched text with `--color-score`
- Max height 480px, scrollable results list' \
  "enhancement"

create \
  "[Layout] Language switcher (EN/IT) in topbar" \
'## Goal
Toggle between English and Italian docs, keeping the user on the equivalent page.

## Tasks
- [ ] Detect current locale from URL (`/en/...` or `/it/...`)
- [ ] Switch between locales while preserving the current path
- [ ] Update `lang` attribute on `<html>`
- [ ] Use `next-intl` `useRouter` + `usePathname` for locale switching
- [ ] Accessible: `aria-label="Switch language"`

## Design
- Minimal toggle: `EN | IT` text, active locale in `--color-score`
- Same pattern as `LanguageSwitcher` in `tratto-email/tratto`' \
  "enhancement"

create \
  "[Layout] \"Edit this page\" link in doc page footer" \
'## Goal
Every doc page should have a direct link to edit the MDX source on GitHub.

## Tasks
- [ ] Compute GitHub edit URL from the current MDX file path
- [ ] Render "Edit this page on GitHub" link in page footer (below content, above prev/next nav)
- [ ] Open in new tab
- [ ] Show only on content pages (not on index/landing pages)

## Design
- 12px, `--color-ink-40`, GitHub icon (SVG inline)
- Hover: `--color-score`' \
  "enhancement"

echo ""
echo "Creating Epic 2 — Getting Started Content..."

create \
  "[Content] Introduction page" \
'## Goal
First page a new user lands on. Explains what Tratto is and orients them in the docs.

## Content outline
1. What is Tratto (1 paragraph — transactional + marketing email API)
2. Key concepts overview (tenant, API key, domain, email, webhook)
3. Ecosystem diagram: API → Firestore → Cloud Functions → BigQuery
4. Quick links: Quickstart, API Reference, SDKs
5. "Not a developer?" section pointing to dashboard docs

## Notes
- Write in both `en` and `it`
- Keep under 400 words — orient, do not explain everything
- No code blocks on this page' \
  "documentation"

create \
  "[Content] Quickstart guide (5-minute first send)" \
'## Goal
Get a developer from zero to their first sent email in under 5 minutes.

## Steps to document
1. Create account / workspace
2. Generate an API key (`POST /v1/api-keys` or dashboard)
3. Add and verify a domain (`POST /v1/domains` + DNS records)
4. Send the first email (`POST /v1/emails`)
5. Check the email status (`GET /v1/emails/{id}`)

## Code examples required
Each step needs cURL + Node.js + Python snippets.

```bash
# Example step 4
curl -X POST https://api.tratto.email/v1/emails \
  -H "Authorization: Bearer tratto_live_..." \
  -H "Content-Type: application/json" \
  -d '"'"'{"from":"hello@yourdomain.com","to":"user@example.com","subject":"Hello","text":"It works!"}'"'"'
```

## Notes
- Write in both `en` and `it`
- Use callout boxes for warnings (e.g. "never expose your API key client-side")' \
  "documentation"

create \
  "[Content] Core concepts page" \
'## Goal
Explain the mental model of Tratto for developers who want to understand before coding.

## Sections
1. **Tenants** — workspace isolation, multi-member, billing unit
2. **API Keys** — `tratto_live_` prefix, hash-only storage, key rotation
3. **Domains** — SPF/DKIM/DMARC, verification, sender identity
4. **Emails** — immutable send record, status lifecycle (`queued → sent → delivered`)
5. **Events** — tracking events (opened, clicked, bounced, complained, unsubscribed)
6. **Webhooks** — HTTP push notifications, HMAC-SHA256 signatures
7. **Flows** — automation engine (triggers + steps)
8. **Templates** — versioned email templates

## Notes
- Write in both `en` and `it`
- Include a state machine diagram for email lifecycle
- Link each concept to its detailed section' \
  "documentation"

echo ""
echo "Creating Epic 3 — Core Resource Docs..."

create \
  "[Content] Authentication & API Keys" \
'## Goal
Document how to authenticate with the Tratto API and manage API keys.

## Sections
1. Bearer token format (`Authorization: Bearer tratto_live_<32chars>`)
2. Creating an API key via API (`POST /v1/api-keys`)
3. Listing and revoking keys (`GET /v1/api-keys`, `DELETE /v1/api-keys/{id}`)
4. Key security: never log, never expose client-side, rotation strategy
5. Idempotency header (`Idempotency-Key: <uuid>`) — what it does and when to use it
6. Error: `401 Unauthorized` and `403 Forbidden` explained

## Code examples
cURL, Node.js, Python for create + list + revoke.

## Notes
- Callout: "API keys grant full workspace access — treat like passwords"
- Write in `en` and `it`' \
  "documentation"

create \
  "[Content] Send Email" \
'## Goal
Core docs for `POST /v1/emails` — the most important endpoint.

## Sections
1. Minimal send (from, to, subject, text/html)
2. Full request body reference (all fields with types and descriptions)
3. Using a template (`templateId` + `variables`)
4. Attachments (base64 encoding)
5. Scheduling (`scheduledAt` ISO 8601)
6. Tags for filtering
7. Response: email object with `id` and `status`
8. Common errors: `domain_not_verified`, `rate_limit_exceeded`

## Code examples (all 3 languages)
Minimal send + template send + scheduled send.

## Notes
- Write in `en` and `it`
- Link to Domains page for domain verification prereq' \
  "documentation"

create \
  "[Content] Email Status & Lifecycle" \
'## Goal
Explain the full email status state machine and how to track delivery.

## Sections
1. Status values: `queued`, `scheduled`, `sent`, `delivered`, `failed`
2. State machine diagram (ASCII or Mermaid)
3. Getting email status (`GET /v1/emails/{id}`)
4. Email events (`GET /v1/emails/{id}/events`)
5. Event types: `sent`, `delivered`, `opened`, `clicked`, `bounced`, `complained`, `unsubscribed`
6. Difference between status (email state) and events (tracking actions)
7. When to use polling vs webhooks

## Notes
- Write in `en` and `it`
- Mermaid diagram of state transitions' \
  "documentation"

create \
  "[Content] Domains: Add, DNS Setup & Verification" \
'## Goal
Walk a developer through adding a sending domain with correct DNS records.

## Sections
1. Adding a domain (`POST /v1/domains`)
2. Required DNS records:
   - SPF: `v=spf1 include:spf.tratto.email ~all`
   - DKIM: TXT record with generated public key (returned by API)
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
3. Triggering verification (`POST /v1/domains/{id}/verify`)
4. Checking verification status (`GET /v1/domains/{id}`)
5. Common DNS propagation issues and timeouts
6. Removing a domain

## Notes
- Show DNS records in a copy-pasteable table
- Callout: "DNS changes can take up to 48h to propagate"
- Write in `en` and `it`' \
  "documentation"

create \
  "[Content] Templates: Create, Version & Test" \
'## Goal
Document the full template lifecycle including versioning and test sends.

## Sections
1. Creating a template (`POST /v1/templates`)
2. Template variables syntax (`{{variable_name}}`)
3. Draft vs published status
4. Listing and getting templates
5. Updating a template (creates a new version)
6. Version history (`GET /v1/templates/{id}/versions`)
7. Restoring a previous version
8. Test send (`POST /v1/templates/{id}/test-send`)
9. Deleting a template

## Notes
- Write in `en` and `it`
- Show variable interpolation example' \
  "documentation"

create \
  "[Content] Contacts: Create, Import & Status" \
'## Goal
Document contact management including bulk CSV import.

## Sections
1. Contact object (fields: email, firstName, lastName, status, tags, metadata)
2. Creating a contact (`POST /v1/contacts`)
3. Listing with filters (`GET /v1/contacts?status=subscribed`)
4. Updating a contact (`PATCH /v1/contacts/{id}`) — status, tags, metadata
5. Contact status values: `subscribed`, `unsubscribed`, `bounced`, `complained`
6. Bulk CSV import (`POST /v1/contacts/import`)
7. Checking import job status (`GET /v1/contacts/import/{jobId}`)
8. Auto-unsubscribe on bounce/complaint

## Notes
- Write in `en` and `it`
- Provide CSV format example with headers' \
  "documentation"

create \
  "[Content] Audiences: Segmentation" \
'## Goal
Document how to create rule-based audiences for campaigns and flows.

## Sections
1. Audience object (name, rules, contact count)
2. Creating an audience with rules (`POST /v1/audiences`)
3. Rule types: status, tags, metadata fields, date ranges
4. Adding contacts manually (`POST /v1/audiences/{id}/contacts`)
5. Dynamic vs static audiences
6. Using audiences in campaigns and flows

## Notes
- Write in `en` and `it`
- Rules JSON example with multiple conditions' \
  "documentation"

create \
  "[Content] Campaigns: Draft, Schedule & Send" \
'## Goal
Document the full campaign lifecycle from draft to delivery stats.

## Sections
1. Campaign object (name, subject, templateId, audienceId, status)
2. Creating a campaign draft (`POST /v1/campaigns`)
3. Test send before launch (`POST /v1/campaigns/{id}/test-send`)
4. Sending immediately vs scheduling (`POST /v1/campaigns/{id}/send`)
5. Pausing a campaign (`POST /v1/campaigns/{id}/pause`)
6. Delivery statistics (`GET /v1/campaigns/{id}/stats`)
7. Campaign status flow: `draft → scheduled → sending → sent`

## Notes
- Write in `en` and `it`
- Stats response: totalSent, delivered, opened, clicked, bounced, rates' \
  "documentation"

create \
  "[Content] Flows & Automation: Triggers and Steps" \
'## Goal
Document the automation engine — creating flows, configuring triggers, and building step sequences.

## Sections
1. Flow overview (trigger → step sequence → enrolled contacts)
2. Creating a flow (`POST /v1/flows`)
3. **Triggers** reference:
   - `contact_joins_audience`
   - `contact_tag_added` / `contact_tag_removed`
   - `email_event` (opened, clicked, bounced, etc.)
   - `manual`
4. **Steps** reference:
   - `send_email` (templateId, delay)
   - `wait` (duration)
   - `branch` (condition → true/false path)
   - `update_contact` (set status, tags, metadata)
   - `webhook_call` (POST to external URL)
5. Activating / deactivating a flow
6. Enrollments: how contacts enter and exit flows

## Notes
- Write in `en` and `it`
- Include a visual example flow diagram (Mermaid)' \
  "documentation"

create \
  "[Content] Webhooks: Setup, Events & Signature Verification" \
'## Goal
Document webhook registration, all event types, and how to verify HMAC signatures.

## Sections
1. Registering a webhook (`POST /v1/webhooks`)
2. Event types and payload structure:
   - `sent`, `delivered`, `opened`, `clicked`, `bounced`, `complained`, `unsubscribed`
3. Payload example:
   ```json
   {
     "id": "evt_...",
     "type": "delivered",
     "emailId": "email_...",
     "recipient": "user@example.com",
     "occurredAt": "2025-01-01T12:00:00Z"
   }
   ```
4. HMAC-SHA256 signature verification (`x-tratto-signature` header)
5. Signature verification code in Node.js and Python
6. Rotating the signing secret (`POST /v1/webhooks/{id}/rotate-secret`)
7. Delivery history and retries (`GET /v1/webhooks/{id}/deliveries`)
8. Test event (`POST /v1/webhooks/{id}/test`)

## Notes
- Write in `en` and `it`
- Security callout: always verify signatures before processing' \
  "documentation"

create \
  "[Content] Analytics: Summary & Timeseries" \
'## Goal
Document the analytics endpoints and explain what each metric means.

## Sections
1. Summary metrics (`GET /v1/analytics/summary?period=30d`)
   - totalSent, delivered, opened, clicked, bounced, complained
   - Delivery rate, open rate, click rate, bounce rate
2. Timeseries data (`GET /v1/analytics/timeseries`)
   - Daily breakdown for period (7d, 30d, 90d)
3. Metric definitions (what counts as "opened", "clicked", etc.)
4. Limitations: 90-day max window, email-level data not in analytics endpoints

## Notes
- Write in `en` and `it`
- Response example with real-looking numbers' \
  "documentation"

echo ""
echo "Creating Epic 4 — API Reference..."

create \
  "[API Reference] Integrate OpenAPI 3.1 spec from tratto-api" \
'## Goal
Pull the existing OpenAPI specification from `tratto-email/tratto-api` into the docs build.

## Background
The API spec is auto-generated by Fastify + `@fastify/type-provider-zod` + Swagger, available at `https://api.tratto.email/docs/json`.

## Tasks
- [ ] Export `openapi.json` from tratto-api and commit to this repo (or fetch at build time)
- [ ] Set up a script/CI step to keep the spec in sync when tratto-api changes
- [ ] Configure Fumadocs OpenAPI plugin to consume the spec
- [ ] Map spec paths to sidebar sections
- [ ] Verify all endpoints appear: emails, domains, templates, contacts, audiences, campaigns, flows, webhooks, analytics, billing, api-keys, workspace' \
  "enhancement"

create \
  "[API Reference] Generate interactive API reference pages" \
'## Goal
Auto-generate one page per endpoint group from the OpenAPI spec with full parameter docs.

## Tasks
- [ ] Use Fumadocs `fumadocs-openapi` package to generate MDX from spec
- [ ] One section per tag: Emails, Domains, Templates, Contacts, Audiences, Campaigns, Flows, Webhooks, Analytics, Billing, API Keys, Workspace
- [ ] Each endpoint shows: method, path, description, request body schema, response schema, error codes
- [ ] Authentication requirement shown on each endpoint
- [ ] Pagination parameters documented where applicable
- [ ] Code sample (cURL) auto-generated per endpoint' \
  "enhancement"

create \
  "[API Reference] \"Try it\" live API explorer" \
'## Goal
Allow developers to make real API calls from the docs browser.

## Tasks
- [ ] Add "Try it" panel to each API reference endpoint
- [ ] Input field for API key (stored in sessionStorage, never persisted)
- [ ] Fill in path parameters, query params, and request body via form inputs
- [ ] Execute real `fetch()` call to `https://api.tratto.email` (or staging)
- [ ] Show raw request + response with syntax highlighting
- [ ] Clear key / logout button
- [ ] Warn users: "This will make real API calls against your account"

## Notes
- API key input: type=password, never logged or transmitted to our servers
- Pre-fill examples from spec `example` fields' \
  "enhancement"

echo ""
echo "Creating Epic 5 — SDK Pages..."

create \
  "[SDK] Node.js / TypeScript SDK page" \
'## Goal
Document the official Node.js SDK (`@tratto/email` — from `tratto-email/tratto-node`).

## Sections
1. Installation (`npm install @tratto/email`)
2. Initialization with API key
3. Send email example
4. All available methods mirroring API endpoints
5. TypeScript types reference
6. Error handling
7. Link to npm package and GitHub repo

## Notes
- Write in `en` and `it`
- Code examples in TypeScript (prefer) and CommonJS
- Version badge (npm)' \
  "documentation"

create \
  "[SDK] Python SDK page" \
'## Goal
Document the official Python SDK (`tratto-email` — from `tratto-email/tratto-python`).

## Sections
1. Installation (`pip install tratto-email`)
2. Initialization
3. Send email example
4. Available methods
5. Async support (asyncio)
6. Error handling
7. Link to PyPI and GitHub repo

## Notes
- Write in `en` and `it`
- Code examples in Python 3.10+
- PyPI version badge' \
  "documentation"

create \
  "[SDK] HTTP / cURL reference" \
'## Goal
Language-agnostic HTTP reference for developers not using an official SDK.

## Sections
1. Base URL and versioning (`https://api.tratto.email/v1/`)
2. Authentication header format
3. Request/response format (JSON, Content-Type)
4. Pagination: cursor-based (`?after=<cursor>&limit=50`, max 100)
5. Idempotency header (`Idempotency-Key`)
6. cURL examples for the 5 most common operations
7. Postman collection download link (if available)

## Notes
- Write in `en` and `it`
- cURL examples with `--compressed` flag and proper quoting' \
  "documentation"

echo ""
echo "Creating Epic 6 — Guides & Reference..."

create \
  "[Guide] Rate limits & quotas" \
'## Goal
Document API rate limits so developers can plan their integrations.

## Sections
1. Global rate limit: 500 requests/minute per tenant
2. HTTP headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
3. `429 Too Many Requests` error response format
4. Retry strategy: exponential backoff with jitter
5. Per-plan email volume limits (free, starter, growth)
6. Burst behavior

## Code example
Retry logic in Node.js and Python.

## Notes
- Write in `en` and `it`' \
  "documentation"

create \
  "[Guide] Error codes reference" \
'## Goal
Complete reference of all API error codes with explanations and suggestions.

## Error format
```json
{
  "error": {
    "code": "DOMAIN_NOT_VERIFIED",
    "message": "The sending domain is not verified.",
    "docs": "https://docs.tratto.email/en/domains/verify",
    "suggestion": "Run POST /v1/domains/{id}/verify and check DNS records."
  }
}
```

## Error codes to document
- `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`
- `VALIDATION_ERROR`, `RATE_LIMIT_EXCEEDED`
- `DOMAIN_NOT_VERIFIED`, `DOMAIN_ALREADY_EXISTS`
- `TEMPLATE_NOT_PUBLISHED`, `CAMPAIGN_ALREADY_SENT`
- `CONTACT_ALREADY_EXISTS`, `IMPORT_IN_PROGRESS`
- `PLAN_LIMIT_EXCEEDED`, `BILLING_REQUIRED`
- `IDEMPOTENCY_CONFLICT`

## Notes
- Write in `en` and `it`
- Searchable table format' \
  "documentation"

create \
  "[Guide] Idempotency guide" \
'## Goal
Explain when and how to use the `Idempotency-Key` header to safely retry requests.

## Sections
1. What idempotency means and why it matters for email sending
2. Endpoints that support `Idempotency-Key`
3. Key format recommendation (UUID v4)
4. TTL: 24 hours in Redis cache
5. What happens on duplicate: same response returned, no second send
6. `409 IDEMPOTENCY_CONFLICT` — when the same key is used with different params

## Code example
Retry loop with idempotency key in Node.js.

## Notes
- Write in `en` and `it`' \
  "documentation"

create \
  "[Guide] Deliverability best practices" \
'## Goal
Help developers maximize inbox placement rates with actionable guidance.

## Sections
1. Domain authentication checklist (SPF + DKIM + DMARC)
2. From address consistency
3. Unsubscribe handling (honor `complained` and `unsubscribed` events)
4. List hygiene (remove `bounced` contacts)
5. Sending frequency recommendations
6. Content best practices (avoid spam trigger words, text/HTML ratio)
7. Warming a new sending domain
8. Monitoring bounce and complaint rates

## Notes
- Write in `en` and `it`
- Include a "deliverability checklist" as a summary box' \
  "documentation"

create \
  "[Guide] IP Warming guide" \
'## Goal
Explain Tratto'"'"'s IP warming process for high-volume senders.

## Sections
1. What IP warming is and why it matters
2. Tratto'"'"'s managed IP pool warming (handled automatically via `warmingMonitor` function)
3. Warm-up schedule: typical volume ramp over 30 days
4. Signs of throttling and what Tratto does automatically
5. What the developer needs to do (consistent sending, clean lists)
6. IP pool assignment (shared vs dedicated — plan-based)

## Notes
- Write in `en` and `it`
- Tratto IP warming is mostly automatic — frame as "what happens behind the scenes"' \
  "documentation"

create \
  "[Guide] Webhook signature verification" \
'## Goal
Step-by-step guide for securely verifying `x-tratto-signature` on incoming webhook payloads.

## Sections
1. Why signature verification matters
2. The `x-tratto-signature` header format
3. HMAC-SHA256 verification algorithm
4. Implementation in Node.js:
   ```js
   const sig = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
   if (sig !== req.headers["x-tratto-signature"]) throw new Error("Invalid signature");
   ```
5. Implementation in Python
6. Implementation in PHP (bonus)
7. Rotating the secret (`POST /v1/webhooks/{id}/rotate-secret`)
8. Replay attack protection (check `occurredAt` timestamp)

## Notes
- Write in `en` and `it`
- Critical security note: always use raw body (not parsed JSON) for HMAC' \
  "documentation"

echo ""
echo "Creating Epic 7 — SEO & Performance..."

create \
  "[SEO] generateMetadata() and OG images per doc page" \
'## Goal
Every documentation page should have correct metadata and a dynamic OG image.

## Tasks
- [ ] `generateMetadata()` on every page: title, description, og:title, og:description, og:image, canonical
- [ ] Title format: `{Page Title} — Tratto Docs`
- [ ] Dynamic OG image via `app/opengraph-image.tsx` (same pattern as `tratto-email/tratto`)
- [ ] OG image shows: Tratto logo, page title, section name
- [ ] Description pulled from MDX frontmatter `description` field
- [ ] Fallback description for pages without frontmatter

## MDX frontmatter standard
```yaml
---
title: Send Email
description: Send transactional emails via the Tratto API using POST /v1/emails.
---
```' \
  "enhancement"

create \
  "[SEO] hreflang and canonical URLs on all pages" \
'## Goal
Correct international SEO signals on all documentation pages.

## Tasks
- [ ] Add `hreflang` links on every page: `en`, `it`, `x-default=en`
- [ ] Canonical URL pointing to the current locale page
- [ ] Ensure no duplicate content between `/en/...` and `/it/...` (different content, not duplicates)
- [ ] Verify with Google Search Console after deploy

## HTML output example
```html
<link rel="canonical" href="https://docs.tratto.email/en/emails/send-email" />
<link rel="alternate" hreflang="en" href="https://docs.tratto.email/en/emails/send-email" />
<link rel="alternate" hreflang="it" href="https://docs.tratto.email/it/emails/send-email" />
<link rel="alternate" hreflang="x-default" href="https://docs.tratto.email/en/emails/send-email" />
```' \
  "enhancement"

create \
  "[SEO] Sitemap generation from MDX pages" \
'## Goal
Auto-generate a complete sitemap covering all doc pages in both locales.

## Tasks
- [ ] `app/sitemap.ts` that reads all MDX files from `content/` directory
- [ ] Include both `/en/` and `/it/` versions of each page
- [ ] `lastmod` from MDX frontmatter `updatedAt` or git commit date
- [ ] Submit sitemap to Google Search Console after first deploy
- [ ] Exclude any draft pages (`draft: true` in frontmatter)

## Output
`https://docs.tratto.email/sitemap.xml`' \
  "enhancement"

create \
  "[Performance] Lighthouse audit pass (LCP < 1.5s, CLS < 0.05)" \
'## Goal
Meet the same Core Web Vitals targets as the Tratto marketing site.

## Targets
- LCP < 1.5s
- CLS < 0.05
- FID / INP < 50ms
- Lighthouse Performance score ≥ 90

## Tasks
- [ ] Run Lighthouse CI on the built docs site
- [ ] Audit font loading (next/font with `display: swap`)
- [ ] Ensure no layout shift from sidebar or TOC loading
- [ ] Verify `next/image` used for all images with correct `sizes` and `priority`
- [ ] Check no render-blocking scripts
- [ ] Verify code blocks do not cause large CLS on page load
- [ ] Add `pnpm lighthouse` script (Lighthouse CI) to package.json

## Notes
- Run against staging URL before each major release' \
  "enhancement"

echo ""
echo "All 46 issues created successfully!"
