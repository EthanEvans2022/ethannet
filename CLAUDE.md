# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm-workspace TypeScript monorepo: Express API (`apps/api`, port 4001), Next.js App Router UI (`apps/ui`, port 3000), Express media server (`apps/media-server`, port 4002), Node.js app (`apps/core`), Playwright suite (`apps/e2e`), and shared API contract types (`packages/types`). `apps/` holds things that run; `packages/` holds things apps import. See [docs/architecture.md](docs/architecture.md) for the rationale behind the setup and [docs/releasing.md](docs/releasing.md) for the branch and release workflow; implementation plans live in [docs/plans/](docs/plans/).

## Commands

Run from the repo root (Node >=20, `engine-strict` is on):

- `pnpm dev` — api + ui in watch mode (media-server and core run separately with `pnpm --filter <name> dev`)
- `pnpm build` / `pnpm start` — production build of every package / run of api + ui
- `pnpm typecheck` — `tsc --noEmit` in every package
- `pnpm test` — Vitest unit tests in every package
- `pnpm test:e2e` — Playwright; starts the api and ui dev servers itself (reuses already-running ones outside CI)
- `pnpm storybook` — ui Storybook on port 6006
- `pnpm lint` / `pnpm lint:fix` / `pnpm format` — Biome for the whole repo (no ESLint/Prettier)
- `pnpm changeset` — add a changeset for the current branch; `pnpm changeset status` shows the pending bump
- `pnpm version-packages` — release only: apply pending changesets to every package version and changelog

Package names are `@ethannet/api`, `@ethannet/ui`, `@ethannet/media-server`, `@ethannet/core`, `@ethannet/e2e`, `@ethannet/types`. To target one package or one test:

```
pnpm --filter @ethannet/api test
pnpm --filter @ethannet/ui exec vitest run src/components/HelloCard.test.tsx
pnpm --filter @ethannet/ui exec vitest run -t "test name"
pnpm --filter @ethannet/e2e exec playwright test tests/home.spec.ts
```

## Architecture

- **API contracts live in `packages/types`** and are consumed directly from source — its `exports` points at `./src/index.ts`, with no build step. Apps must use `import type` for these so nothing from the package exists at runtime.
  - The ui can only import it because of `transpilePackages: ["@ethannet/types"]` in `apps/ui/next.config.ts`; any new internal workspace package imported by the ui needs adding there too.
  - The Node apps (api, media-server, core) run via `tsx watch` in dev and are bundled by `tsup` for production (`tsc --outDir` fails on files outside each app's `rootDir`). `tsc` is used only for typechecking.
- **api**: routers in `apps/api/src/routes/`, mounted under `/api/*` in `src/index.ts`. Response-building logic is extracted into pure functions (e.g. `buildHelloResponse`) so Vitest can test it without HTTP. CORS is wide open for local dev only.
- **media-server**: serves files from `MEDIA_DIR` (default `apps/media-server/media`). The router is built by a factory (`buildMediaRouter(mediaDir)`) so the directory is injected rather than hard-coded.
- **ui**: async server components fetch the api at `NEXT_PUBLIC_API_URL` (default `http://localhost:4001`). Presentational components in `src/components/` take data as props and each has a `.test.tsx` (jsdom + Testing Library) and `.stories.tsx`. `@/*` aliases `apps/ui/src/*`.
- **Code style**: Biome with 2-space indent, double quotes, organized imports. TS is `strict` with `noUncheckedIndexedAccess`; per-package tsconfigs extend `tsconfig.base.json`.

## Development Principles

### Branching (Git Flow)

All changes are made on a feature branch. Never commit directly to `main` or `dev`.

- **`main`**: released code only. It changes only when a release is merged in from `dev`.
- **`dev`**: the integration branch. Feature branches branch off it and merge back into it.
- **Feature branches**: create them from `dev` with names like `feature/<short-description>`, and merge them back into `dev` when the work is done and its tests pass.
- **Releases**: when the user decides to cut a release, `dev` is merged into `main`. Only do this when the user asks.

### Versioning

The whole repo shares one [semver](https://semver.org) version (`MAJOR.MINOR.PATCH`): every workspace package's `package.json` always has the same version, and each release to `main` is tagged `vX.Y.Z`. Versions are managed with [Changesets](https://github.com/changesets/changesets) in "fixed" mode (`.changeset/config.json` fixes every `@ethannet/*` package together), so bumping one package bumps them all. The root `package.json` isn't a workspace package and has no version. See [docs/releasing.md](docs/releasing.md) for the step-by-step workflow.

- **Every feature branch adds a changeset** (`pnpm changeset`, or non-interactively `pnpm changeset --minor @ethannet/api -m "Summary"`) that picks the bump type and gives a one-line summary for the changelog. Because versions are fixed, naming any one package is enough. A branch with no user-facing change (docs, tests, tooling) uses `pnpm changeset --empty`.
- **Bump types**:
  - **major**: a breaking change to an API contract in `packages/types` or an endpoint, or a large user-facing overhaul.
  - **minor**: a new feature or endpoint that doesn't break anything.
  - **patch**: a bug fix or a small internal change.
- **Pre-1.0**: the repo stays on `0.y.z` until the user decides it's ready for `1.0.0`. Until then, breaking changes bump the minor version.
- **Releasing**: only when the user asks. On a release branch off `dev`, `pnpm version-packages` combines the pending changesets into the version bump and each package's `CHANGELOG.md`. That branch merges into `dev`, then `dev` is merged into `main`, and the merge commit is tagged `vX.Y.Z`.

### External dependencies

Every third-party package must be free, permissively licensed open source. Check a package's license (the `license` field in its `package.json` or its repository) before adding it.

- **Allowed**: MIT, Apache-2.0, ISC, BSD-2-Clause, BSD-3-Clause, and 0BSD.
- **Not allowed without the user's explicit approval**: copyleft licenses (GPL, LGPL, AGPL, MPL, EUPL), "source-available" or non-commercial licenses (BSL, SSPL, Commons Clause, CC-BY-NC), packages with no license, and anything that requires a paid license.
- If a package's license isn't on the allowed list, or you're unsure about it, ask before adding it.
- pnpm settings such as `overrides` (used to pin patched versions after `pnpm audit`) go in `pnpm-workspace.yaml`. pnpm 11 ignores the `"pnpm"` field in `package.json`.

### SOLID design

All new code follows SOLID. Dependency inversion matters most here.

- **Single Responsibility**: each module, component, or function has one reason to change. Keep data fetching, business logic, and presentation separate: route handlers delegate to pure builder functions, and server components fetch data and pass it to presentational components.
- **Open/Closed**: extend behavior by adding code (new components, new routers, composition through props and children), not by editing working code to add special cases.
- **Liskov Substitution**: any implementation of an interface or props contract must work wherever that contract is expected, with no surprise behavior, extra preconditions, or narrowed outputs.
- **Interface Segregation**: keep interfaces and props small and specific. Components take only the props they use; don't pass whole objects "just in case" or define catch-all interfaces.
- **Dependency Inversion**: high-level code depends on abstractions, not concrete implementations. Inject dependencies (data sources, API clients, services, config) through parameters, props, or factory functions instead of importing or constructing them inline, so they can be swapped and mocked in tests. Shared contracts belong in `packages/types`.

### Test-driven development

TDD is the default workflow from here on. Write the failing test first, make it pass with the simplest implementation, then refactor.

- Every component gets a `.test.tsx` (Vitest + Testing Library) before or alongside its implementation, never after the fact.
- Every page gets test coverage: unit tests for its logic and components, and a Playwright spec in `apps/e2e/tests/` for its rendered behavior.
- Every backend route and service gets Vitest tests, both for its pure logic and for its HTTP behavior.
- No feature is done until its tests exist and `pnpm test` (plus `pnpm test:e2e` for pages) passes.

### Documentation

Every new feature and every change ships with documentation. There is no fixed documentation style yet, so choose the clearest form for each case, but don't skip it. A feature isn't done until its docs exist and match the code.

- **Components**: Storybook is the main documentation for UI. Each component's `.stories.tsx` should cover its meaningful states and variants and use autodocs with prop descriptions, so someone can see how to use the component without reading its source.
- **Workflows**: document dev, build, test, and release workflows, and any setup steps, in `docs/` (or here, if they belong in this overview). Update them when a workflow changes.
- **Testing and usability**: record how to test a feature and how it's meant to be used: the user flows it supports, how to run or reproduce it, and the edge cases covered.
- **Code**: add doc comments to exported functions, types, and API contracts in `packages/types`, especially where intent or constraints aren't obvious from the signature.
- Update existing docs in the same change that makes them out of date.
- **Obsidian vault**: the repo is meant to be opened as an Obsidian vault for reading the docs. Write all written documentation as Markdown (`.md`) files, and link related docs to each other wherever it helps a reader navigate (e.g. a feature doc linking to the workflow it uses). Use relative Markdown links (`[Architecture](docs/architecture.md)`) so the links work both in Obsidian and on GitHub.
