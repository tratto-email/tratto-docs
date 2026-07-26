# Audit production-readiness — Tratto workspace

Data: 2026-07-13 · Repo auditati: `tratto`, `tratto-api`, `tratto-app`, `tratto-react`
Metodo: 4 audit read-only paralleli (lint/typecheck/test, secrets, security, deploy, osservabilità).

## Verdetto

**Non pronto per il go-live.** 6 blocker. Verifiche di base OK ovunque (lint/typecheck/test verdi, nessun secret committato, 0 vulnerabilità high/critical).

---

## 🔴 Blocker (6)

### tratto-api

1. **Billing non funzionante in prod: secret Stripe mai iniettati.** `.github/workflows/deploy-production.yml:54` — `--set-secrets` include solo AWS, REDIS_URL, TRATTO_HMAC_SECRET. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*` restano `''` → `getStripe()` lancia (`api/src/lib/stripe.ts:9`), webhook risponde 500 (`api/src/routes/v1/billing.ts:255`). Fix: aggiungere i 4 secret a `--set-secrets` (attenzione al mismatch naming con `infra/secrets.tf`: `stripe-secret-key`/`stripe-webhook-secret`).
2. **Switch SHA-256 → HMAC invalida tutte le API key esistenti.** Commit `2686f77`: `authHook` cerca `apiKeyIndex/{hmacKey(raw)}` (`api/src/plugins/auth.ts:33`) ma i documenti esistenti hanno ID `sha256(raw)` → 401 per tutte le chiavi emesse al deploy. Nessuno script di migrazione. Fix: dual-lookup transitorio (HMAC, fallback SHA-256 + re-hash on-hit) oppure rotazione forzata comunicata.
3. **Feature beta-invite solo in locale.** Branch `fix/api-key-hmac-sha256`: 1 commit non pushato, 6 file modificati non staged (tra cui `firebase/firestore.rules`), 3 untracked (`api/src/routes/v1/beta-invite.ts`, `scripts/create-beta-invite.ts`, `scripts/grant-beta-access.ts`). Nessuna pipeline può deployarla; rischio perdita. Fix: commit + push + PR verso `develop`.

### tratto-app

4. **Beta gate bypassato in produzione.** Commit `3ef6083` (branch `fix/enable-login-beta-access-gate`) imposta `loginEnabled: true` in `environment.prod.ts:15`, ma `auth.guard.ts:19` fa `if (environment.loginEnabled) return true;` **prima** del check `betaAccess` — il claim non viene mai verificato. Login social (`signInWithPopup`) crea account nuovi liberamente → chiunque entra in dashboard senza invito. Fix: separare i flag (`betaGateEnabled` vs `loginEnabled`); in `authGuard` sempre `refreshClaims()` + check `betaAccess()` quando il gate è attivo. + test unit su authGuard (matrice loginEnabled × betaAccess).

### tratto (sito)

5. **Rate limiting fail-open su /api/waitlist.** `apphosting.yaml` non definisce `REDIS_URL`; `src/lib/redis.ts` ritorna `true` senza Redis (e su errore) → submit illimitati, ogni submit invia 1 conferma + 4 email nurturing a indirizzi **non verificati** = vettore email-bombing + danno reputation dominio. Fix: secret `REDIS_URL` in `apphosting.yaml` + check fail-closed in assenza di Redis.

### tratto-react

6. **npm 0.1.1 non riproducibile da git.** `src/server.ts` untracked, `package.json` (bump + export `./server`) non committato; pacchetto pubblicato a mano da working tree (no provenance). Una ripubblicazione da git produrrebbe un pacchetto senza `@tratto/react/server` → rompe `tratto/src/lib/mailer.ts:1` (invio email del sito). Fix: commit `src/server.ts` + `package.json`, tag `v0.1.1`.

---

## 🟠 Rischi principali (selezione — dettaglio completo nei report per repo)

### tratto-api
- Staging senza `REDIS_URL` → `/health` sempre 503, rate-limit e idempotency off (`deploy-staging.yml:54`).
- `TRATTO_HMAC_SECRET` non validato al boot (assente da schema zod e `REQUIRED_IN_PRODUCTION` in `config.ts`) → 500 alla prima richiesta invece di fail al boot.
- `firestore.rules` non deployate da nessuna pipeline (workflow fanno solo `--only functions`).
- Redis TLS con `rejectUnauthorized: false` (`api/src/lib/redis.ts:9`) → MITM possibile.
- Rate limiting parziale: solo ramo API-key, fail-open, limite globale in-memory per-istanza.
- Accept beta-invite non transazionale, senza email-match, token loggato in chiaro (`beta-invite.ts:91,117-132`).
- Nessun error tracking/alerting; winston emette `level` non `severity` → Cloud Logging tutto a DEFAULT.
- 2 vulnerabilità moderate (`uuid`, `@opentelemetry/core`) → `pnpm.overrides`.
- Rollback non documentato; Terraform non gestisce i secret realmente usati (drift).

### tratto-app
- `deploy-staging.yml` tenta di deployare artifact di build **produzione** su staging (oggi dead code che fallisce silenziosamente, domani bomba innescata).
- Copertura unit quasi nulla: 1 solo spec; zero test su auth.guard, auth.service, billing, interceptor.
- E2E non coprono invio email né campagne.
- Nessun error tracking in prod (solo console.error).
- Rollback non documentato, nessuno smoke test post-deploy prod.

### tratto
- No double opt-in (GDPR/deliverability) — aggrava blocker #5.
- `scheduleNurturingSequence` non awaited → scheduling perso su Cloud Run dopo la risposta.
- CTA email 4 → `https://tratto.email/{locale}/founding`: route inesistente (404 su email a +42gg — parte dal primo signup!).
- Canonical di /privacy e /terms punta alla homepage (mascherato da `"canonical": "off"` in lighthouserc).
- GTM consent default fuori dal root layout → possibile fire tag pre-consenso (GDPR).
- Nessuna test suite; 2 vulnerabilità moderate (`postcss`, `uuid`).

### tratto-react
- `pnpm lint/test/build` rotti out-of-the-box (placeholder letterale in `pnpm-workspace.yaml`, chiave inesistente in `.npmrc`).
- Doppio lockfile (npm stale + pnpm non committato), CI usa npm, locale usa pnpm.
- Pipeline publish mai esercitata (tag `0.1` senza prefisso `v`, publish.yml triggera su `v*`).
- `exports`: `types` in ultima posizione; API key live incoraggiata client-side negli esempi JSDoc.

---

## 🟡 Migliorie (post-launch, conteggi)

- tratto-api: 7 (seed sha256 stale, beta-invite senza test, versione health hardcoded, doc env obsoleta, swagger pubblico, CORS localhost in prod, .env.local sporco)
- tratto-app: 8 (pre-push hook skippa test, GTM condiviso staging/prod, `--pass-with-no-tests`, no cache/security header hosting, stringhe hardcoded, path filter deploy, FIREBASE_TOKEN deprecato, mismatch Node)
- tratto: 10 (dead code waitlist-count, .env.example incoerente, CSP unsafe-inline, JSON-LD /docs inesistente, CLAUDE.md drift "Next 15" vs 16.2.9, middleware→proxy deprecato, GSC vuoto, enumerazione iscritti, PII a Slack, sitemap x-default)
- tratto-react: 5 (dead code provider.tsx, eslint no-op, module warning, engines/packageManager mancanti, coverage senza soglie)

---

## Ordine di risoluzione suggerito

| # | Azione | Repo | Sforzo |
|---|---|---|---|
| 1 | Commit/push lavoro locale (beta-invite + rules; server.ts + package.json) | tratto-api, tratto-react | minuti |
| 2 | Fix beta gate in authGuard + test unit | tratto-app | ore |
| 3 | Stripe secrets in deploy-production.yml | tratto-api | minuti |
| 4 | Dual-lookup HMAC/SHA-256 per API key | tratto-api | ore |
| 5 | REDIS_URL + fail-closed su waitlist | tratto | ~1h |
| 6 | Fix accept beta-invite (transazione + email match + log) | tratto-api | ~1h |
| 7 | Rischi deploy: rules in pipeline, staging REDIS_URL, artifact staging, boot validation | tratto-api, tratto-app | ore |
| 8 | Pagina /founding o rimozione CTA + await nurturing + double opt-in | tratto | ore |
| 9 | Error tracking + severity logging + alert minimi | tutti | ~1g |
