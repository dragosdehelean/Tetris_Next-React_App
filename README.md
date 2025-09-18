# Tetris MVP (Next.js)

Modern Tetris MVP scaffolded with Next.js App Router, TypeScript strict mode, Redux Toolkit state, RTK Query-ready store wiring, Material UI theming și suite de teste automate (Vitest + Playwright).

## Cerințe
- Node.js 20+
- pnpm 8+
- Playwright browsers (`pnpm exec playwright install --with-deps`)

## Scripturi utile
| Comandă | Descriere |
| --- | --- |
| `pnpm dev` | Server de dezvoltare Next.js (http://localhost:3000) |
| `pnpm lint` | Rulează ESLint (config flat + plugin-urile Testing Library/Jest DOM) |
| `pnpm typecheck` | TypeScript `tsc --noEmit` |
| `pnpm test` | Vitest (unit/integration) cu setup JSDOM și jest-dom |
| `pnpm coverage` | Raport de acoperire Vitest (text + html + lcov) |
| `pnpm smoke` | Suite Playwright minimală (`tests/smoke`) pentru verificări rapide |
| `pnpm e2e` | Playwright UI (multi-browser) |
| `pnpm e2e:ci` | Playwright cu reporter list (folosit în CI) |

## Structură proiect
- `src/app` – layout, providers și rute App Router.
- `src/components/home` – UI client pentru dashboard Tetris.
- `src/features/game` – slice Redux cu starea jocului (dificultate, scor, nivel).
- `src/features/store` – configurare store + hooks tipate.
- `src/test` – utilitare render pentru Testing Library.
- `tests/e2e` & `tests/smoke` – teste Playwright.
- `vitest.config.ts` / `vitest.setup.ts` – configurare Vitest (JSDOM, alias `@`).

## Flux recomandat
1. Instalează dependențele: `pnpm install` (deja executat).
2. Pornește Playwright browsers (o singură dată): `pnpm exec playwright install --with-deps`.
3. Dezvoltare: `pnpm dev` + rulează în paralel `pnpm test:watch` după nevoie.
4. Înainte de commit: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e:ci`.

## Notițe
- Tema MUI folosește paletă synthwave pentru diferențiere vizuală.
- Store-ul Redux este pregătit pentru extindere cu RTK Query (vezi `features/store`).
- SPEC-ul MVP se găsește în directorul rădăcină (`../SPEC.md`) pentru referință produs.