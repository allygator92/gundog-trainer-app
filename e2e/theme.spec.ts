import { expect, test } from "@playwright/test";
import { skipDemoWelcome } from "./helpers";

test("theme toggle switches the public site look", async ({ page }) => {
  await skipDemoWelcome(page);
  await page.goto("/");
  const shell = page.locator("[data-marketing-theme]");
  await expect(shell).toHaveAttribute("data-theme", "heath");
  await expect(page.getByTestId("site-header").getByRole("group", { name: "Website look" })).toHaveCount(0);

  await page.getByRole("button", { name: "Sample notes" }).click();
  await page.getByRole("button", { name: "Field" }).click();
  await expect(shell).toHaveAttribute("data-theme", "field");

  await page.getByRole("link", { name: "About" }).first().click();
  await expect(page.locator("[data-marketing-theme]")).toHaveAttribute("data-theme", "field");
});
