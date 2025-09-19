## 2025-09-19

- Fixed Vercel build error: Wrapped useSearchParams() in Suspense boundaries for Next.js 15 App Router compatibility. Added Suspense wrapper in providers.tsx (ThemeSynchronizer) and TestControls.tsx to resolve pre-rendering issues.
- Fixed broken tests: Updated test assertions to match actual application title "Tetris Odyssey" instead of "Tetris Neon Odyssey" in both unit tests (GameDashboard.test.tsx) and e2e tests (home.spec.ts). All unit tests, smoke tests, and critical e2e tests now pass.

## 2025-09-18

- Phase 4 (QA & Release Prep): Added Playwright smoke suite (Boot, QuickStart, Controls Sanity, Pause/Resume, LocalStorage Health). Verified lint, typecheck, unit, e2e, and smoke all pass.
