# Contributing to tratto-docs

Thank you for helping improve the Tratto documentation site! This guide
covers everything you need to get started.

---

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be
respectful and constructive in issues, pull requests, and all other project
communication.

---

## Ways to contribute

- **Bug reports** — open an issue with the page URL, what's wrong, and what
  you expected instead.
- **Content fixes** — typos, broken links, outdated examples, unclear
  explanations. Small MDX fixes are welcome without an issue first.
- **New pages / larger restructuring** — open an issue describing the gap
  before writing content, so we can agree on scope and placement.
- **Feature requests** (site functionality, not content) — open an issue
  describing the use case.

---

## Development setup

**Requirements:** Node.js ≥ 18, [pnpm](https://pnpm.io).

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/tratto-docs.git
cd tratto-docs

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev            # http://localhost:3000 → redirects to /en
```

See [README.md](./README.md) for the full command reference and MDX
authoring conventions (frontmatter, locale-prefixed links, JSX-brace
escaping, translation fallback behavior).

---

## Running checks

```bash
pnpm lint          # ESLint
pnpm typecheck     # tsc --noEmit
pnpm build         # full production build (syncs the OpenAPI spec first)
```

All three must pass before a PR is merged — this is exactly what CI runs.

---

## Pull request workflow

1. **Open an issue first** for anything beyond a trivial fix (typos, broken
   links).
2. Fork and create a feature branch:
   ```bash
   git checkout -b feat/your-feature
   ```
3. Make your changes. Keep commits focused and descriptive.
4. Run `pnpm lint && pnpm typecheck && pnpm build` locally — fix any
   failures.
5. Push your branch and open a PR against `main`.

### PR checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] New/changed pages follow the MDX conventions in `README.md`
- [ ] Internal links are locale-prefixed (`/en/docs/...`, not `/docs/...`)

---

## Content conventions

See the "Writing docs" section in [README.md](./README.md) for frontmatter
fields, the locale-prefixed-links rule, and the JSX-brace escaping gotcha.
A page missing an Italian translation is expected to fall back to English —
don't add a stub translation just to fill the gap.
