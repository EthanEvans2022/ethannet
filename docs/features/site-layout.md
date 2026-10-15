# Site layout: header and footer

Every page in the ui shares one header and one footer. The root layout (`apps/ui/src/app/layout.tsx`) renders them around the page content. This page covers what they do, how to change them, and how to test them. For how the ui fits into the rest of the repo, see [Architecture](../architecture.md). The plan this was built from is [2026-10-14-header-and-footer](../plans/2026-10-14-header-and-footer.md).

## Components

All in `apps/ui/src/components/layout/`, each with a `.module.css`, a `.test.tsx` and a `.stories.tsx` beside it.

| Component | Purpose |
| --- | --- |
| `Header` | Logo on the left, navigation on the right. |
| `Logo` | The "ethannet" text wordmark, linking to `/`. |
| `NavLinks` | A plain list of internal links. Used by the header, the mobile menu and the footer. |
| `MobileMenu` | The hamburger button and the slide-out panel. The only client component. |
| `Footer` | Repeats the nav links and lists social links. |

The layout is the only place that imports the link lists. Every component takes its links as props, so it can be tested and shown in Storybook with any set of links:

```tsx
<Header links={navLinks} />
<main>{children}</main>
<Footer navLinks={navLinks} socialLinks={socialLinks} />
```

The `<body>` is a full-height flex column and `<main>` grows to fill it, so the footer sits at the bottom even on short pages. Global styles and color variables are in `apps/ui/src/app/globals.css`.

## Changing things

- **Nav or social links**: edit `navLinks` and `socialLinks` in `apps/ui/src/config/navigation.ts`. The header, mobile menu and footer all pick up the change.
- **Logo**: replace the text in `Logo.tsx` with a `next/image`. Keep `aria-label="ethannet home"`, which the tests and screen readers use.
- **Breakpoint**: the switch from hamburger to inline links happens at `min-width: 768px` in `Header.module.css`. `Footer.module.css` uses the same breakpoint to go from stacked to a single row.
- **Colors and header height**: CSS variables at the top of `globals.css`.

## How it behaves

### Phones (below 768px)

- The header shows the logo and a hamburger button.
- Tapping the hamburger slides a panel in from the right with the nav links. A dark backdrop covers the rest of the page.
- The panel closes when you:
  - tap the X button
  - tap the backdrop
  - press Escape
  - tap any link
- Opening the menu moves focus to the X button. Closing it with the X, the backdrop or Escape moves focus back to the hamburger.

### Desktop (768px and up)

- The nav links sit inline on the right of the header, and the hamburger is hidden.
- The footer shows the nav links on the left and the social links on the right.

### Edge cases

- **Placeholder routes**: `/about`, `/projects` and `/contact` don't exist yet and 404. The social URLs are placeholders too.
- **Panel width**: about a third of the screen, but never narrower than 16rem (256px), because a third of a phone screen is too narrow for the links. Never wider than the screen.
- **Reduced motion**: with `prefers-reduced-motion: reduce`, the panel and backdrop appear without animating.
- **Closed panel**: the panel stays in the page while closed so it can slide back in. While closed it's `inert` and `aria-hidden`, so keyboard and screen-reader users can't reach its links.
- **Empty lists**: `NavLinks` renders nothing for an empty list, and the footer leaves out the social list when there are no social links.

## Testing

Unit tests (Vitest and Testing Library) cover each component's markup and the menu's open and close behavior:

```
pnpm --filter @ethannet/ui exec vitest run src/components/layout
```

jsdom can't apply media queries, so the responsive behavior is tested in Playwright at 375px and 1280px wide. It covers:

- which nav shows at each width
- opening the menu
- each way of closing it
- the logo link
- the footer links

```
pnpm --filter @ethannet/e2e exec playwright test tests/layout.spec.ts
```

Storybook (`pnpm storybook`) has every component under **Layout**, each with a Docs page. `MobileMenu/Open` opens the menu with a play function. `Header/Mobile` and `Header/Desktop` show both layouts. Use the viewport toolbar to try other widths.

### Manual check

With `pnpm dev` running, open http://localhost:3000:

1. At phone width, tap the hamburger. The panel slides in from the right.
2. Close it with each of: the X, the backdrop, Escape, and a link.
3. Widen the window past 768px. The hamburger disappears and the links appear inline.
4. Check that the footer sits at the bottom of the page and its links work.
