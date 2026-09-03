import { expect, test } from "@playwright/test";
import { skipDemoWelcome } from "./helpers";

test("admin dashboard sends guests to sign in", async ({ page }) => {
  await skipDemoWelcome(page);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("Admin sign in")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("admin client pages also require sign in", async ({ page }) => {
  await skipDemoWelcome(page);
  await page.goto("/admin/clients");
  await expect(page).toHaveURL(/\/admin\/login/);
});
