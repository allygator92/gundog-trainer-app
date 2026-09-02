import { expect, test } from "@playwright/test";

test("theme toggle switches the public site look", async ({ page }) => {
  await page.goto("/");
  const shell = page.locator("[data-marketing-theme]");
  await expect(shell).toHaveAttribute("data-theme", "heath");

  await page.getByRole("button", { name: "Field" }).click();
  await expect(shell).toHaveAttribute("data-theme", "field");

  await page.getByRole("link", { name: "About" }).first().click();
  await expect(page.locator("[data-marketing-theme]")).toHaveAttribute("data-theme", "field");
});
