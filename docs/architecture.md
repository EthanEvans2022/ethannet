# Architecture

## Monorepo layout

- `apps/api` — Express API server (TypeScript).
- `apps/ui` — Next.js app (App Router, TypeScript).
- `apps/core` — Node.js app (TypeScript).
- `apps/e2e` — Playwright end-to-end tests that exercise api + ui together. It's a workspace package rather than living inside either app, since it depends on both.
- `packages/types` — TypeScript types shared between api and ui (API request/response contracts).
- `docs` — documentation for the whole repo, including [plans](plans).

`apps/` holds things that run or deploy; `packages/` holds things apps import. This mirrors the convention used by Turborepo, Vercel's examples, and the T3 stack.

## Shared types, no build step

`packages/types/package.json` points its `main`/`types`/`exports` directly at `./src/index.ts` — real TypeScript source, not compiled output. pnpm symlinks `node_modules/@ethannet/types` to `packages/types`, so both api and ui resolve `@ethannet/types` straight to source.

- **Next.js** normally refuses to process `.ts` files under `node_modules`, even symlinked workspace ones. `transpilePackages: ["@ethannet/types"]` in `apps/ui/next.config.ts` is the documented escape hatch for monorepo-internal packages.
- **Express** dev loop uses `tsx watch`, which transpiles any `.ts` file it imports regardless of where it lives, so no extra config is needed.

Both consumers `import type` the shared interfaces, so there's zero runtime coupling — editing `packages/types/src/index.ts` is picked up immediately by both apps with no build step in between.

## API build

The api's production build uses `tsup` (an esbuild wrapper) instead of `tsc`, because `tsc --outDir` fails once it has to emit a file for `packages/types/src/index.ts`, which lives outside the api's `rootDir`. `tsup` bundles `apps/api/src/index.ts` into a single `dist/index.js`; since all cross-package imports are `import type`, esbuild strips them entirely, so the compiled api has no runtime dependency on the types package. `tsc --noEmit` is still used per-package purely for typechecking.

## Tooling

- **Biome** — a single root `biome.json` handles linting and formatting for the whole repo (replaces ESLint + Prettier).
- **Vitest** — unit tests, scoped per-package: the api tests a pure function extracted from its route handler (`node` environment); the ui tests a presentational component with `@testing-library/react` (`jsdom` environment).
- **Storybook** — lives in `apps/ui` (via `@storybook/nextjs`) for developing UI components in isolation.
- **Playwright** — lives in `apps/e2e`, which starts both the api and ui dev servers itself (via Playwright's `webServer` array config) before running browser tests against the full stack.
