# ethannet

A fullstack TypeScript monorepo managed with pnpm workspaces.

## Layout

- [apps/api](apps/api) — Express API server
- [apps/ui](apps/ui) — Next.js app
- [apps/core](apps/core) — Node.js app
- [apps/media-server](apps/media-server) — Express server that serves media files to clients
- [apps/e2e](apps/e2e) — Playwright end-to-end tests covering api + ui together
- [packages/types](packages/types) — TypeScript types shared between api and ui
- [docs](docs) — documentation, including plans

See [docs/architecture.md](docs/architecture.md) for how the pieces fit together, and [docs/releasing.md](docs/releasing.md) for the branch, versioning and release workflow.

## Getting started

```
pnpm install
pnpm dev
```

This starts the api on http://localhost:4001 and the ui on http://localhost:3000.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Run api + ui in dev mode |
| `pnpm build` | Build all packages |
| `pnpm start` | Run built api + ui |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm test` | Run unit tests (Vitest) in all packages |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm storybook` | Run Storybook for the ui's components |
| `pnpm lint` | Lint the whole repo with Biome |
| `pnpm format` | Format the whole repo with Biome |
| `pnpm changeset` | Add a changeset describing the current branch's change |
| `pnpm version-packages` | Release only: apply pending changesets to versions and changelogs |
