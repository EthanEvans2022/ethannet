import { expect, test } from "@playwright/test";

test("homepage renders backend-provided message", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Hello from the Express backend!")).toBeVisible();
});
