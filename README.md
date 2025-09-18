# Tetris MVP (Next.js)

Modern Tetris MVP scaffolded with Next.js App Router, TypeScript strict mode, Redux Toolkit state, RTK Query-ready store wiring, Material UI theming ?i suite de teste automate (Vitest + Playwright).

## Cerin?e
- Node.js 20+
- pnpm 8+
- Playwright browsers (`pnpm exec playwright install --with-deps`)

## Scripturi utile
| Comanda | Descriere |
| --- | --- |
| `pnpm dev` | Server de dezvoltare Next.js (http://localhost:3000) |
| `pnpm lint` | Ruleaza ESLint (config flat + plugin-urile Testing Library/Jest DOM) |
| `pnpm typecheck` | TypeScript `tsc --noEmit` |
| `pnpm test` | Vitest (unit/integration) cu setup JSDOM ?i jest-dom |
| `pnpm coverage` | Raport de acoperire Vitest (text + html + lcov) |
| `pnpm smoke` | Suite Playwright minimala (`tests/smoke`) pentru verificari rapide |
| `pnpm e2e` | Playwright UI (multi-browser) |
| `pnpm e2e:ci` | Playwright cu reporter list (folosit în CI) |

## Structura proiect
- `src/app` – layout, providers ?i rute App Router.
- `src/components/home` – UI client pentru dashboard Tetris.
- `src/features/game` – slice Redux cu starea jocului (dificultate, scor, nivel).
- `src/features/store` – configurare store + hooks tipate.
- `src/test` – utilitare render pentru Testing Library.
- `tests/e2e` & `tests/smoke` – teste Playwright.
- `vitest.config.ts` / `vitest.setup.ts` – configurare Vitest (JSDOM, alias `@`).

## Flux recomandat
1. Instaleaza dependen?ele: `pnpm install` (deja executat).
2. Porne?te Playwright browsers (o singura data): `pnpm exec playwright install --with-deps`.
3. Dezvoltare: `pnpm dev` + ruleaza în paralel `pnpm test:watch` dupa nevoie.
4. Înainte de commit: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e:ci`.

## Noti?e
- Tema MUI folose?te paleta synthwave pentru diferen?iere vizuala.
- Store-ul Redux este pregatit pentru extindere cu RTK Query (vezi `features/store`).
- SPEC-ul MVP se gase?te în directorul radacina (`../SPEC.md`) pentru referin?a produs.
