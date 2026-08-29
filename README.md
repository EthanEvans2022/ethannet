# ethannet

A fullstack TypeScript monorepo managed with pnpm workspaces.

## Layout

- [apps/backend](apps/backend) — Express API server
- [apps/frontend](apps/frontend) — Next.js app
- [apps/e2e](apps/e2e) — Playwright end-to-end tests covering backend + frontend together
- [packages/types](packages/types) — TypeScript types shared between backend and frontend
- [docs](docs) — documentation, including plans

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together.

## Getting started

```
pnpm install
pnpm dev
```

This starts the backend on http://localhost:4001 and the frontend on http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run backend + frontend in dev mode |
| `pnpm build` | Build all packages |
| `pnpm start` | Run built backend + frontend |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests (Vitest) in all packages |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm storybook` | Run Storybook for the frontend's components |
| `pnpm lint` | Lint the whole repo with Biome |
| `pnpm format` | Format the whole repo with Biome |
