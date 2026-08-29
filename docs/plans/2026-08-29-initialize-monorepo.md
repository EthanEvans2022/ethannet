> _Authored by Claude (Claude Code) on 2026-08-29, at the request of Ethan Evans, as the plan for this repository's initial scaffolding. Committed as the historical record of what was built and why._

# Initialize fullstack Node.js monorepo (Express + Next.js + shared types + tooling)

## Context

The target directory (`c:\Users\ethan\git\ethannet`) is currently empty and not yet a git repo. The goal is to scaffold it from scratch into a fullstack monorepo with:
- an Express backend
- a Next.js frontend
- a shared `types` package consumed by both, so API contracts are defined once
- a `docs/` folder for repo-wide documentation, including plans
- a consistent toolchain for linting/formatting, unit testing, component development, and end-to-end testing

Decisions confirmed with the user:
- **Frontend**: Next.js (App Router, TypeScript)
- **Language**: TypeScript everywhere
- **Workspace tool**: pnpm workspaces
- **Docs**: a `docs/` folder inside this monorepo (not a separate repo)
- **Lint/format**: Biome (replaces ESLint + Prettier)
- **Testing**: Vitest for unit tests (backend + frontend), Storybook for frontend component development, Playwright for end-to-end tests

Environment check: Node v24.11.1, pnpm 11.22.0 are installed — compatible with everything below.

Kept intentionally minimal otherwise: no Docker, no CI config.

## Key design decisions

- **`apps/` vs `packages/`**: `apps/backend` and `apps/frontend` are runnable apps; `apps/e2e` is a runnable-but-not-deployed Playwright suite that drives both of them; `packages/types` is the shared library the apps depend on. This is the standard Turborepo/Vercel/T3-stack convention.
- **Shared types require no build step**: `packages/types/package.json` sets `"exports": { ".": "./src/index.ts" }`, so pnpm's workspace symlink (`node_modules/@ethannet/types → packages/types`) resolves straight to TypeScript source.
  - Next.js needs `transpilePackages: ["@ethannet/types"]` in `next.config.ts` to let its bundler process a `.ts` file living under (symlinked) `node_modules`.
  - `tsx watch` (backend dev) and Vitest (esbuild/vite-based) both transpile any `.ts` file they import regardless of location, so no extra config is needed there.
  - Both consumers `import type` the shared interfaces — zero runtime coupling.
- **Backend production build uses `tsup` (esbuild), not `tsc`**: avoids TS6059 rootDir errors from the cross-package import. `tsc --noEmit` is still used per-package purely for typechecking.
- **`moduleResolution: "Bundler"`** in the shared base tsconfig lets all packages use plain extensionless relative imports.
- **Biome instead of ESLint/Prettier**: one root `biome.json`, one root devDependency, no per-package config — simplest way to get consistent lint+format across TS/TSX/JSON in one pass.
- **Vitest scoped per-package**: `apps/backend` tests a pure function extracted from the route handler (`node` environment); `apps/frontend` tests a presentational component with `@testing-library/react` (`jsdom` environment). `packages/types` has no logic to unit test (it's type-only), so it gets no test script.
- **Storybook lives only in `apps/frontend`** (via `@storybook/nextjs`), since components are a frontend-only concept here.
- **Playwright lives in its own workspace package, `apps/e2e`**, because it exercises the full stack (frontend + backend together) rather than belonging to either — its Playwright config starts both dev servers itself via `webServer` (array form).

## Directory tree

```
ethannet/
├── .gitignore
├── .npmrc
├── biome.json                    # root Biome lint+format config
├── package.json                  # root workspace scripts
├── pnpm-workspace.yaml           # apps/*, packages/*
├── tsconfig.base.json            # shared strict TS config, extended by every package
├── README.md
├── docs/
│   ├── architecture.md           # monorepo layout + shared-types strategy rationale
│   └── plans/
│       └── 2026-08-29-initialize-monorepo.md  # this plan, committed verbatim as historical record
├── apps/
│   ├── backend/
│   │   ├── package.json          # @ethannet/backend
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts          # Express bootstrap, PORT 4001
│   │       └── routes/
│   │           ├── hello.ts      # buildHelloResponse() + router
│   │           └── hello.test.ts # vitest unit test
│   ├── frontend/
│   │   ├── package.json          # @ethannet/frontend
│   │   ├── tsconfig.json
│   │   ├── next.config.ts        # transpilePackages: ["@ethannet/types"]
│   │   ├── vitest.config.ts
│   │   ├── vitest.setup.ts
│   │   ├── .storybook/
│   │   │   ├── main.ts
│   │   │   └── preview.ts
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx      # fetches backend, renders <HelloCard>
│   │       └── components/
│   │           ├── HelloCard.tsx
│   │           ├── HelloCard.test.tsx     # vitest + testing-library
│   │           └── HelloCard.stories.tsx  # storybook story
│   └── e2e/
│       ├── package.json          # @ethannet/e2e
│       ├── playwright.config.ts  # webServer: [backend, frontend]
│       └── tests/
│           └── home.spec.ts      # asserts homepage renders backend message
└── packages/
    └── types/
        ├── package.json          # @ethannet/types, exports -> src, no build
        ├── tsconfig.json
        └── src/index.ts          # exports HelloResponse
```

(`apps/frontend/next-env.d.ts` is auto-generated by Next on first `next dev`/`build` — not hand-authored.)

## Config file contents

**`pnpm-workspace.yaml`**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`.npmrc`**
```
auto-install-peers=true
strict-peer-dependencies=false
engine-strict=true
```

**`.gitignore`**: `node_modules`, `dist`, `.next`, `*.tsbuildinfo`, `.env*`, `.DS_Store`, `*-debug.log*`, `coverage`, `storybook-static`, `playwright-report`, `test-results`, `blob-report`

**`tsconfig.base.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**`biome.json`** (root)
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignoreUnknown": false },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "javascript": { "formatter": { "quoteStyle": "double" } }
}
```

**Root `package.json`**
```json
{
  "name": "ethannet",
  "private": true,
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "concurrently -n backend,frontend -c blue,magenta \"pnpm --filter @ethannet/backend dev\" \"pnpm --filter @ethannet/frontend dev\"",
    "build": "pnpm -r --if-present run build",
    "start": "concurrently -n backend,frontend -c blue,magenta \"pnpm --filter @ethannet/backend start\" \"pnpm --filter @ethannet/frontend start\"",
    "typecheck": "pnpm -r --if-present run typecheck",
    "test": "pnpm -r --if-present run test",
    "test:e2e": "pnpm --filter @ethannet/e2e test",
    "storybook": "pnpm --filter @ethannet/frontend storybook",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "concurrently": "^9.1.0",
    "typescript": "^5.7.2"
  }
}
```

**`packages/types/package.json`**: `name: "@ethannet/types"`, `type: "module"`, `main`/`types`/`exports."."` all `./src/index.ts`, `scripts.typecheck: "tsc --noEmit"`, devDep `typescript`.

**`packages/types/tsconfig.json`**: extends base, `noEmit: true`, `types: ["node"]`, `include: ["src"]`.

**`apps/backend/package.json`**: `name: "@ethannet/backend"`, `type: "module"`.
- scripts: `dev: "tsx watch src/index.ts"`, `build: "tsup src/index.ts --format esm --target node20 --out-dir dist --clean"`, `start: "node dist/index.js"`, `typecheck: "tsc --noEmit"`, `test: "vitest run"`, `test:watch: "vitest"`
- deps: `express`, `@ethannet/types: "workspace:*"`
- devDeps: `@types/express`, `@types/node`, `tsup`, `tsx`, `typescript`, `vitest`

**`apps/backend/tsconfig.json`**: extends base, `noEmit: true`, `types: ["node"]`, `include: ["src"]`.

**`apps/backend/vitest.config.ts`**
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node" },
});
```

**`apps/frontend/package.json`**: `name: "@ethannet/frontend"`.
- scripts: `dev: "next dev"`, `build: "next build"`, `start: "next start"`, `typecheck: "tsc --noEmit"`, `test: "vitest run"`, `test:watch: "vitest"`, `storybook: "storybook dev -p 6006"`, `build-storybook: "storybook build"`
- deps: `next`, `react`, `react-dom`, `@ethannet/types: "workspace:*"`
- devDeps: `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `storybook`, `@storybook/nextjs`, `@storybook/addon-essentials`

**`apps/frontend/tsconfig.json`**: extends base, re-declares Next's required fields (`target: ES2017`, `lib: [dom, dom.iterable, esnext]`, `allowJs: true`, `noEmit: true`, `module: esnext`, `moduleResolution: bundler`, `jsx: preserve`, `incremental: true`, `plugins: [{name:"next"}]`, `paths: {"@/*": ["./src/*"]}`), `include` covering `next-env.d.ts`, `**/*.ts(x)`, `.next/types/**/*.ts`.

**`apps/frontend/next.config.ts`**
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = { transpilePackages: ["@ethannet/types"] };
export default nextConfig;
```

**`apps/frontend/vitest.config.ts`**
```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
```

**`apps/frontend/vitest.setup.ts`**
```ts
import "@testing-library/jest-dom/vitest";
```

**`apps/frontend/.storybook/main.ts`**
```ts
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: { name: "@storybook/nextjs", options: {} },
};

export default config;
```

**`apps/frontend/.storybook/preview.ts`**
```ts
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
```

**`apps/e2e/package.json`**
```json
{
  "name": "@ethannet/e2e",
  "private": true,
  "scripts": { "test": "playwright test" },
  "devDependencies": { "@playwright/test": "^1.49.1" }
}
```

**`apps/e2e/playwright.config.ts`**
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: [
    {
      command: "pnpm --filter @ethannet/backend dev",
      url: "http://localhost:4001/api/hello",
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
    },
    {
      command: "pnpm --filter @ethannet/frontend dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      cwd: "../..",
    },
  ],
  use: { baseURL: "http://localhost:3000" },
});
```

## Shared-type example (proves the wiring end-to-end)

**`packages/types/src/index.ts`**
```ts
export interface HelloResponse {
  message: string;
  timestamp: string;
}
```

**`apps/backend/src/routes/hello.ts`**
```ts
import { Router } from "express";
import type { HelloResponse } from "@ethannet/types";

export function buildHelloResponse(): HelloResponse {
  return {
    message: "Hello from the Express backend!",
    timestamp: new Date().toISOString(),
  };
}

export const helloRouter = Router();

helloRouter.get("/", (_req, res) => {
  res.json(buildHelloResponse());
});
```

**`apps/backend/src/routes/hello.test.ts`**
```ts
import { describe, expect, it } from "vitest";
import { buildHelloResponse } from "./hello";

describe("buildHelloResponse", () => {
  it("returns a message and a valid ISO timestamp", () => {
    const result = buildHelloResponse();
    expect(result.message).toBe("Hello from the Express backend!");
    expect(() => new Date(result.timestamp).toISOString()).not.toThrow();
  });
});
```

**`apps/backend/src/index.ts`** — creates the Express app, adds a permissive dev-only CORS header, mounts `helloRouter` at `/api/hello`, listens on `process.env.PORT ?? 4001`.

**`apps/frontend/src/components/HelloCard.tsx`**
```tsx
import type { HelloResponse } from "@ethannet/types";

export function HelloCard({ message, timestamp }: HelloResponse) {
  return (
    <section style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>ethannet</h1>
      <p>{message}</p>
      <p><small>Received at: {timestamp}</small></p>
    </section>
  );
}
```

**`apps/frontend/src/components/HelloCard.test.tsx`**
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HelloCard } from "./HelloCard";

describe("HelloCard", () => {
  it("renders the message", () => {
    render(<HelloCard message="Hi there" timestamp="2026-01-01T00:00:00.000Z" />);
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });
});
```

**`apps/frontend/src/components/HelloCard.stories.tsx`**
```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { HelloCard } from "./HelloCard";

const meta: Meta<typeof HelloCard> = { title: "HelloCard", component: HelloCard };
export default meta;

type Story = StoryObj<typeof HelloCard>;

export const Default: Story = {
  args: { message: "Hello from Storybook!", timestamp: new Date().toISOString() },
};
```

**`apps/frontend/src/app/layout.tsx`** — minimal root HTML layout.

**`apps/frontend/src/app/page.tsx`**
```tsx
import type { HelloResponse } from "@ethannet/types";
import { HelloCard } from "@/components/HelloCard";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

async function getHello(): Promise<HelloResponse> {
  const res = await fetch(`${BACKEND_URL}/api/hello`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Backend request failed: ${res.status}`);
  return res.json() as Promise<HelloResponse>;
}

export default async function HomePage() {
  const data = await getHello();
  return <HelloCard {...data} />;
}
```

**`apps/e2e/tests/home.spec.ts`**
```ts
import { expect, test } from "@playwright/test";

test("homepage renders backend-provided message", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello from the Express backend!")).toBeVisible();
});
```

## Ordered build steps

1. `git init` in the repo root.
2. Create directories: `docs`, `apps/backend/src/routes`, `apps/frontend/src/app`, `apps/frontend/src/components`, `apps/frontend/.storybook`, `apps/e2e/tests`, `packages/types/src`.
3. Write all root config files (`pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `biome.json`, `tsconfig.base.json`, root `package.json`, `README.md`, `docs/architecture.md`), and this plan document.
4. Write each package's `package.json` (with `name` fields pre-set so `pnpm --filter` works right away) and `tsconfig.json`/tool configs (`vitest.config.ts`, `.storybook/*`, `playwright.config.ts`).
5. Run `pnpm install` — resolves versions, writes `pnpm-lock.yaml`, symlinks `@ethannet/types` into both apps' `node_modules`.
6. Run `pnpm --filter @ethannet/e2e exec playwright install --with-deps chromium` (downloads the browser binary Playwright needs).
7. Write the source files listed above (types, backend routes/index/tests, frontend layout/page/components/tests/stories, e2e spec).
8. Run `pnpm --filter @ethannet/frontend dev` once (or `pnpm dev`) so Next generates `next-env.d.ts`, then stop it.
9. Run the full verification section below. Only once every check passes, commit and tag the result against this plan document.

## Verification

1. `pnpm install` completes cleanly; `pnpm list --filter @ethannet/backend --depth 0` and the frontend equivalent show `@ethannet/types` resolved as `link:../../packages/types`.
2. `pnpm dev` — backend logs `listening on http://localhost:4001`; Next logs "Ready" on port 3000.
   - `curl http://localhost:4001/api/hello` returns `{"message": "...", "timestamp": "..."}`.
   - Visiting `http://localhost:3000` renders that message and timestamp via `<HelloCard>`.
3. `pnpm build` — backend emits `apps/backend/dist/index.js` via tsup; frontend's `next build` succeeds with no type errors.
4. `pnpm start` against the built artifacts — same page renders correctly.
5. `pnpm typecheck` — all packages report 0 errors. Sanity check the shared-type wiring: temporarily rename `message` → `text` in `packages/types/src/index.ts`, re-run `pnpm typecheck`, confirm it fails in both the backend route and frontend page/component — then revert.
6. `pnpm test` — runs Vitest in both `apps/backend` (`hello.test.ts`) and `apps/frontend` (`HelloCard.test.tsx`); both pass.
7. `pnpm storybook` — starts Storybook on port 6006; the `HelloCard` → `Default` story renders without errors.
8. `pnpm test:e2e` — Playwright starts both dev servers via `webServer`, then `home.spec.ts` passes, confirming the browser-rendered homepage shows the backend's message end-to-end.
9. `pnpm lint` — Biome reports 0 issues across the repo; `pnpm format` is idempotent (running it twice produces no further diff).
