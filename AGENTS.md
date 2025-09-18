# AGENTS.md

## 1) Purpose & Scope
- You are an AI coding agent working in this repository.
- Build and maintain a **Next.js** web app with **React**, **TypeScript**(strict), **Redux Toolkit**, **RTK Query**, **MUI**, **Prisma**, **PostgreSQL**. 
- You may: implement features, fix bugs, write/refactor tests, improve performance, update docs.
- You must not: rotate secrets, change CI/CD infra, modify cloud resources, or introduce new licenses without approval.

## 2) Stack & Project Map
- Runtime: Node.js ≥ 20.x
- Framework: Next.js (App Router if present: `src/app/**`), React 18+, TypeScript strict.
- State: Redux Toolkit; data: RTK Query.
- UI: **Material UI**
- Linting/formatting: ESLint (+ Prettier), Type-checking with `tsc --noEmit`.
- Tests: **Vitest** (unit/integration) + **React Testing Library**; **Playwright** (e2e).
- Hosting: **Vercel**
- Key paths:
  - `src/app` or `app` – routes/entry
  - `src/features/**` – Redux slices, RTK Query api slices
  - `src/components/**` – UI components
  - `src/lib/**` – utilities
  - `src/styles/**` – global styles
  - `tests/**` – test helpers/fixtures

## 3) Setup & Bootstrap
- Install deps: `npm ci`
- Dev server: `npm run dev` → open http://localhost:3000
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Seed/mocks (if applicable): `npm run seed` or see `src/lib/mocks`
- Env: copy `.env.example` → `.env.local` (use mock keys)

## 4) Build / Test / Lint / Typecheck (Canonical)
- Build: `npm run build`
- Unit/Integration: `npm run test` (Vitest) | watch: `npm run test:watch` | coverage: `npm run coverage`
- E2E (Playwright): `npm run e2e` (headed) / `npm run e2e:ci` (headless)
- Lint: `npm run lint` (autofix: `npm run lint:fix`)
- Typecheck: `npm run typecheck`
- Pre-commit (if configured): `npm run precommit`

## 5) Definition of Done (Agent MUST satisfy)
- ✅ `npm run lint` has **0 errors** (warnings allowed if existing policy permits).
- ✅ `npm run typecheck` passes (no `any` in public APIs).
- ✅ `npm run test` passes; **coverage ≥ 85%** on touched files.
- ✅ If routes/components changed: run `npm run e2e:ci` for critical flows.
- ✅ No increase in main route bundle beyond budget (see §10).
- ✅ Update relevant docs (README/CHANGELOG) and add or update tests.
- ✅ Summarize changes at end: files changed, rationale, follow-ups.

## 6) Coding Standards & Conventions
- Follow ESLint/Prettier configs in repo. Prefer functional React components + hooks.
- **Redux Toolkit:** create slices in `src/features/<domain>/<name>Slice.ts`.
- **RTK Query:** define `createApi` slices in `src/features/api/<domain>Api.ts`.
- Avoid `any`; use discriminated unions for variant states.
- Co-locate component tests: `ComponentName.test.tsx` near component or under `__tests__`.
- Public functions/types need brief TSDoc.

## 7) Architecture Primer
- **UI (React/Next.js)** → **State (RTK slices)** → **Data (RTK Query services)** → **External APIs**.
- Server components (if App Router) keep server-only logic; client components use `use client`.
- Cross-cutting utils in `src/lib`. Do not import UI into lib or state layers.

## 8) Permissions (What the Agent May/May Not Do)
- ✅ May add/modify components, slices, RTK Query endpoints, tests, and config.
- ✅ May refactor for readability/perf; may split files when beneficial.
- ❌ Do not add new runtime deps without stating *why* and checking size/security.

## 9) Env, Secrets, Data Access
- Use `.env.local` from `.env.example`. Never commit secrets.
- When needed, stub external APIs via RTK Query `baseQuery` mocks or Playwright fixtures.
- Do not log PII in server logs; redact tokens/ids.

## 10) Performance Budgets & Web Vitals
- Budgets (gzip, per route, initial load): 
  - `/` route client JS **≤ 180KB**, each lazy chunk **≤ 80KB**.
- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- Prefer server components and `next/dynamic` for heavy client code.
- Use RTK Query caching/prefetching; avoid duplicate fetches in client components.

## 11) Security & Privacy
- Validate all inputs server-side; sanitize HTML; escape user content.
- AuthZ: protect server actions; never trust client claims.
- Dependencies: avoid abandoned packages; pin versions if adding new deps.

## 12) API Contracts & Schemas
- If OpenAPI/JSON Schema exists, it lives in `./schema` (generate types via script if present).
- Do not break existing API contracts; bump versions if necessary.
- For RTK Query: define types for request/response; handle error shapes centrally.

## 13) Testing Strategy
- **Unit (Vitest):** components (with React Testing Library), reducers/selectors, utilities.
- **Integration:** RTK Query endpoints with mocked fetch; store-level flows.
- **E2E (Playwright):** critical journeys (auth, primary create/read/update/delete etc).
- Coverage goal: 85% on changed files; add snapshot tests only for stable UI.

## 14) Observability & Debugging
- Dev logs: set `DEBUG=app:*` or use Next.js verbose mode if configured.
- Common issues:
  - Port busy → stop other dev servers or run `npm run kill:ports` (if available).
  - Type mismatch → prefer narrowing & exhaustive checks in reducers/selectors.
- When a task fails, rerun: `npm run lint && npm run typecheck && npm run test`.

## 15) Prompt Patterns That Work Here
- “Implement <feature>; update RTK slice & RTK Query endpoints; add Vitest+RTL tests; run `lint`, `typecheck`, `test`; summarize files changed and follow-ups.”
- “Refactor <component> to server component; keep client-only parts behind `use client`; ensure no hydration warnings; verify bundle budgets.”
- “Add Playwright e2e for <flow>; run `npm run e2e:ci`; fix flakiness if any.”

## 16) Risky Areas / Non-Goals
- Do not modify payment/auth core flows without explicit instruction.
- Avoid adding global state where local state or query caching suffices.

## 17) ## Cloud runs – guardrails & DoD (Codex cloud)

> The agent MUST run these in Codex cloud before declaring success.

**DoD pipeline (block on failure):**
1) `pnpm typecheck`
2) `pnpm lint --max-warnings=0`
3) `pnpm test`
4) `pnpm test:e2e:ci`  # mandatory for UI-impacting changes
5) Update `CHANGELOG.md` with a 1–2 line summary (why + scope).

## 18) **Context to open (so the IDE extension prioritizes them):**
- `AGENTS.md`, `package.json`, `playwright.config.ts`, `vitest.config.ts`
- Any file(s) mentioned in the task (feature/refactor/bug)

## 19) **Cloud environment expectations:**
- Node 20+, pnpm enabled via `corepack`
- Playwright browsers installed in the container
- No external network calls during tasks (cloud sandbox is isolated)
- Secrets never hard-code; use `.env.local` locally, Vercel env vars in CI

## 20) **Behavioral rules:**
- If any step fails, fix, re-run, and only then summarize.
- Prefer minimal diffs; add/adjust tests for every bugfix & feature.
- Never rename env variables or change deployment settings without note.

## 21) Links for Deeper Context
- README.md – project overview and quickstart

## 22) Agents Changelog
- 2025-09-17: Initial version for Next.js + RTK + Vitest/Playwright.

