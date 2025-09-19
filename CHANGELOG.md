## 2025-09-19

- Mobile UX improvements for Samsung Galaxy A55 and similar devices (6.6", 1080x2340px, 19.5:9 ratio):
  - Enhanced GameCanvas responsive sizing with larger cell sizes for mobile (26-32px vs 22-28px desktop)
  - Improved ControlsOverlay with larger touch targets (48x48px minimum), better grouping and spacing
  - Optimized typography scaling for mobile screens with responsive font sizes
  - Better padding and margins for touch interaction and screen real estate utilization
  - Improved button layout with proper minimum heights (44-48px) for accessibility
- Fixed Vercel build error: Wrapped useSearchParams() in Suspense boundaries for Next.js 15 App Router compatibility. Added Suspense wrapper in providers.tsx (ThemeSynchronizer) and TestControls.tsx to resolve pre-rendering issues.
- Fixed broken tests: Updated test assertions to match actual application title "Tetris Odyssey" instead of "Tetris Neon Odyssey" in both unit tests (GameDashboard.test.tsx) and e2e tests (home.spec.ts). All unit tests, smoke tests, and critical e2e tests now pass.

## 2025-09-18

- Phase 4 (QA & Release Prep): Added Playwright smoke suite (Boot, QuickStart, Controls Sanity, Pause/Resume, LocalStorage Health). Verified lint, typecheck, unit, e2e, and smoke all pass.
