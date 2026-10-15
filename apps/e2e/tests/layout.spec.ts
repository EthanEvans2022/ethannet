import { type Page, expect, test } from "@playwright/test";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
];
const socialLabels = ["GitHub", "LinkedIn", "Email"];

// The panel stays in the DOM while closed (for its slide animation), so locate it by id.
const panel = (page: Page) => page.locator("#mobile-menu");
const toggle = (page: Page) => page.getByRole("button", { name: "Open menu" });

async function openMenu(page: Page) {
  await toggle(page).click();
  await expect(panel(page)).toBeVisible();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
}

async function expectClosed(page: Page) {
  await expect(panel(page)).toBeHidden();
  await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
}

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows the hamburger instead of inline links", async ({ page }) => {
    await expect(toggle(page)).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    await expectClosed(page);
  });

  test("hamburger opens a panel with every nav link", async ({ page }) => {
    await openMenu(page);
    for (const { label, href } of navLinks) {
      const link = panel(page).getByRole("link", { name: label });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });

  test("X button closes the panel", async ({ page }) => {
    await openMenu(page);
    await page.getByRole("button", { name: "Close menu" }).click();
    await expectClosed(page);
  });

  test("clicking the backdrop closes the panel", async ({ page }) => {
    await openMenu(page);
    // The panel is anchored right, so the far left of the viewport is backdrop.
    await page.mouse.click(20, 400);
    await expectClosed(page);
  });

  test("Escape closes the panel", async ({ page }) => {
    await openMenu(page);
    await page.keyboard.press("Escape");
    await expectClosed(page);
  });

  test("clicking a link closes the panel and navigates", async ({ page }) => {
    await openMenu(page);
    await panel(page).getByRole("link", { name: "Home" }).click();
    await expectClosed(page);
    await expect(page).toHaveURL("/");
  });
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("shows nav links inline and hides the hamburger", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const { label, href } of navLinks) {
      const link = nav.getByRole("link", { name: label });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
    await expect(toggle(page)).toBeHidden();
  });
});

for (const viewport of [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
]) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });

    test("logo links home", async ({ page }) => {
      await page.goto("/");
      const logo = page.getByRole("link", { name: "ethannet home" });
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute("href", "/");
    });

    test("footer shows nav and social links", async ({ page }) => {
      await page.goto("/");
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      const footerNav = footer.getByRole("navigation", { name: "Footer" });
      for (const { label, href } of navLinks) {
        await expect(
          footerNav.getByRole("link", { name: label }),
        ).toHaveAttribute("href", href);
      }
      for (const label of socialLabels) {
        await expect(footer.getByRole("link", { name: label })).toBeVisible();
      }
    });
  });
}
