> _Authored by Claude (Claude Code) on 2026-10-14, at the request of Ethan Evans, as the plan for the site header and footer. Committed as the historical record of what was built and why. The result is documented in [Site layout](../features/site-layout.md)._

# Plan: Site header and footer in the root layout

## Context

This is the first step toward a basic homepage (header, Jumbotron, personal blurb section, footer). The Jumbotron and the blurb section are deferred. This plan covers only the reusable **Header** and **Footer**, wired into `apps/ui/src/app/layout.tsx` so every page gets them.

Current state:
- The Next.js app is now `apps/ui` (`@ethannet/ui`, Next 16).
- `layout.tsx` renders only `<body>{children}</body>`.
- There is no CSS anywhere; HelloCard uses inline styles.
- `/` is the only route.
- An untracked leftover `apps/frontend/src/components/layout/Header.tsx` (empty) remains from before the rename.
- Git is on `dev`.

Decisions made:
- Styling: **CSS Modules**.
- Nav links: a **placeholder list** in one config file.
- Footer: **nav links plus social links**, with **no copyright line**.
- Logo: a **text wordmark** for now.

Follow CLAUDE.md:
- **Git Flow:** work on a feature branch off `dev`.
- **Changeset:** a minor bump.
- **Dependencies:** check that any new dependency has a permissive license.
- **TDD:** write each test first.
- **SOLID:** links are injected as props. Only `layout.tsx`, the composition root, imports the config.
- **Documentation:** Storybook autodocs, JSDoc, linked Markdown docs, and the plan saved in `docs/plans/`.

## 0. Branch setup
- `git switch dev && git switch -c feature/site-header-footer`.
- Delete the stale empty `apps/frontend/` directory. It's untracked, holds only an empty `Header.tsx`, and is superseded by `apps/ui`.

## Component design

All files live under `apps/ui/src/`.

| File | Kind | Responsibility |
|---|---|---|
| `config/navigation.ts` | data | `NavLink` type `{ label, href }`, `SocialLink` type `{ label, href }`, and the arrays `navLinks` (Home `/`, About `/about`, Projects `/projects`, Contact `/contact`) and `socialLinks` (GitHub, LinkedIn, Email; placeholder URLs, swap in real ones). |
| `components/layout/Logo.tsx` | server | `next/link` to `/` showing the "ethannet" wordmark, with `aria-label="ethannet home"`. It's isolated so it's easy to swap for an image later. |
| `components/layout/NavLinks.tsx` | server-safe | Renders `<ul>` of `next/link`s from `links: NavLink[]`. Optional `onNavigate?: () => void` (the mobile menu uses it to close itself) and `direction?: "row" \| "column"`. Reused by the desktop header, the mobile panel and the footer. |
| `components/layout/MobileMenu.tsx` | `"use client"` | The only stateful piece (see below). Takes `links`. |
| `components/layout/Header.tsx` | server | `<header>`: Logo on the left; on the right, desktop `<nav aria-label="Main">` with `NavLinks` (row) plus `MobileMenu`. Takes `links`. |
| `components/layout/Footer.tsx` | server | `<footer>`: `<nav aria-label="Footer">` with `NavLinks`, plus a social list (external `<a target="_blank" rel="noopener noreferrer">`). No copyright. Takes `navLinks` and `socialLinks`. |

Each component gets `X.module.css`, `X.test.tsx` and `X.stories.tsx` next to it.

### MobileMenu behavior
- Hamburger `<button aria-label="Open menu" aria-expanded aria-controls="mobile-menu">`.
- When open, it shows:
  - a side panel `<nav id="mobile-menu" aria-label="Mobile">` sliding in from the right
  - a semi-transparent backdrop
  - a close (X) button inside the panel
- It closes on any of:
  - the X button
  - a backdrop click
  - the **Escape** key
  - clicking any link (via `NavLinks onNavigate`)
- Panel width: you asked for about a third of the screen, but a third of a phone screen (~125px) is too narrow for links. Use `width: max(33vw, 16rem)`, capped at `100vw`.
- Slide-in uses a CSS `transform` transition. The panel is always rendered; closed means `translateX(100%)` and `visibility: hidden`. Respect `prefers-reduced-motion`.

### Responsive switch (CSS only)
Mobile-first: the default styles are the mobile layout. At `min-width: 768px`:
- show the desktop nav
- hide the hamburger

### Root layout (`app/layout.tsx`)
- Import a new `app/globals.css`:
  - box-sizing reset
  - body margin 0
  - a system font stack
  - CSS custom properties for colors and header height
- Render `<body>` as a flex column with `min-height: 100dvh`:
  - `<Header links={navLinks} />`
  - `<main>{children}</main>` with `flex: 1`
  - `<Footer navLinks={navLinks} socialLinks={socialLinks} />`
- Leave HelloCard and `page.tsx` untouched.

### Tooling additions
- Add `@testing-library/user-event` as a ui devDependency for click and keyboard tests. Its license is **MIT**; confirm that in its `package.json` when adding it.
- Add `resolve.alias` `@` → `./src` to `apps/ui/vitest.config.ts`. Vitest doesn't read tsconfig paths.
- Vitest and `@storybook/nextjs` handle CSS Modules out of the box.

## TDD order

Do each step test-first: red, then green, then refactor. Then write its story.

1. `NavLinks`:
   - renders one link per item with the right `href` and text
   - calls `onNavigate` on click
2. `Logo`: a link to `/` with an accessible name.
3. `Footer`:
   - footer nav links render
   - social links render with `target="_blank"` and `rel`
   - no copyright text
4. `MobileMenu`:
   - closed initially (`aria-expanded="false"`)
   - clicking the hamburger opens it (`aria-expanded="true"`, links visible)
   - each of the X button, Escape, backdrop and link click closes it
5. `Header`:
   - renders the Logo link to `/`
   - the main nav contains every link
   - the hamburger button is present
6. Wire into `layout.tsx` and add `globals.css`.
7. Write the e2e spec `apps/e2e/tests/layout.spec.ts`. The responsive behavior can only be tested here, because jsdom has no media queries.
   - **Mobile viewport (375×812):**
     - hamburger visible, desktop nav hidden
     - clicking the hamburger opens the panel with all links visible
     - each close path, tested separately from an open panel. For each, assert the panel is hidden and `aria-expanded="false"`:
       - the **X** button
       - the **backdrop** (click at a point outside the panel, e.g. the far left of the viewport)
       - **Escape**
       - clicking "Home", which also stays on `/`
   - **Desktop viewport (1280×800):** nav links visible inline, hamburger hidden.
   - **Both viewports:**
     - the logo links to `/`
     - the footer shows nav and social links
   - Don't click the placeholder routes, which 404. Assert their `href` instead.
8. Documentation (below), in the same branch.
9. Changeset: `pnpm changeset --minor @ethannet/ui -m "Add site header with responsive mobile menu, and footer"`.

## Documentation

### Storybook
- Every story file uses `tags: ["autodocs"]`.
- Props interfaces get JSDoc, which feeds the autodocs props table.
- Each story file has `parameters.docs.description.component`.
- Stories:
  - `NavLinks`: `Row`, `Column`, `Empty`
  - `Logo`: `Default`
  - `MobileMenu`:
    - `Closed`
    - `Open`, with a `play` function from `storybook/test` that clicks the hamburger
    - both use a mobile viewport
  - `Header`: `Mobile` and `Desktop` viewports
  - `Footer`: `Default`, `NoSocialLinks`

### Code
JSDoc on:
- exported components
- `NavLink` and `SocialLink`
- `navLinks` and `socialLinks`. Note that the `/about`, `/projects` and `/contact` routes are placeholders.

### Markdown (Obsidian-friendly, relative links)
- **New `docs/features/site-layout.md`:**
  - what the feature is and how the layout composes it
  - how to edit the links, swap the logo, and find the breakpoint
  - user flows (mobile open, navigate, close; desktop inline nav; footer)
  - edge cases: placeholder 404s, reduced motion, panel width
  - how to test it: exact `vitest` and `playwright test tests/layout.spec.ts` commands, the stories to check, and a manual checklist
  - links to [architecture](../architecture.md) and the plan
- **New `docs/plans/2026-10-14-header-and-footer.md`:** this plan, linking to the feature doc.
- **Update `docs/architecture.md`:**
  - add `docs/features` to the layout list
  - mention CSS Modules and `user-event` under Tooling
  - link the feature doc
- **Update `CLAUDE.md`:**
  - **ui bullet:**
    - layout components live in `src/components/layout/`
    - nav config lives in `src/config/navigation.ts`, injected by `app/layout.tsx`
    - styling is CSS Modules (`X.module.css`)
    - global styles are in `app/globals.css`
    - feature docs live in `docs/features/`
  - **Plans convention:** the Overview only says plans live in `docs/plans/`. Add a bullet to the Documentation section: every approved implementation plan is saved to `docs/plans/` as `YYYY-MM-DD-short-slug.md`, before or alongside the implementation, and it links to the feature docs it produces (they link back).

## Verification
- `pnpm --filter @ethannet/ui test`: all unit tests pass, including the existing HelloCard test.
- `pnpm typecheck` and `pnpm lint`: clean.
- `pnpm test:e2e`: `layout.spec.ts` and the existing `home.spec.ts` pass.
- `pnpm storybook`:
  - each component has a Docs page with a props table
  - the `MobileMenu/Open` play function passes
  - the viewport toolbar shows correct mobile and desktop looks
- `pnpm changeset status`: shows a pending minor bump.
- `docs/features/site-layout.md`: links resolve, and commands and paths match the code.
- `pnpm dev`: in a browser at phone and desktop widths, the panel slides in from the right and closes correctly.
- Commit on `feature/site-header-footer`. Merge into `dev` only once everything above passes and you've approved it.

## As built

Differences from the plan above:

- **Branch setup was left to the owner.** Creating `feature/site-header-footer` and deleting the stale `apps/frontend/` directory were both blocked by Claude Code's permission checks, so the work was done uncommitted on `dev`. By then `apps/frontend/` held only empty directories and was left alone.
- **`apps/ui/vitest.setup.ts` gained two things:**
  - `afterEach(cleanup)`. Testing Library only cleans up between tests automatically when Vitest globals are on, and they aren't here. The old suite had one test, so this never showed up before.
  - A `window` click listener that cancels link navigation, which jsdom can't do and logs an error about. It runs after React's handlers, so components still see the click.
- **Story fixtures** live in `components/layout/fixtures.ts`, so stories don't depend on the real nav config.
- **Storybook loads `globals.css`** in `.storybook/preview.ts`, so the CSS color variables resolve there.
- **Playwright's Chromium** had to be installed locally (`pnpm --filter @ethannet/e2e exec playwright install chromium`) before any e2e test could run.
