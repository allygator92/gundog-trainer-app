import { expect, test } from "@playwright/test";
import { skipDemoWelcome } from "./helpers";

test.beforeEach(async ({ page }) => {
  await skipDemoWelcome(page);
});

test("booking keeps one progress row and Pay stays visible during intake", async ({ page }) => {
  await page.goto("/book");
  await expect(page.getByRole("heading", { name: "Book a training session" })).toBeVisible();
  await expect(page.getByText("Session", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Pay", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: /Virtual Training Session/ }).click();
  await expect(page.getByRole("button", { name: "First available" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first().click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(page.getByText("Intake 1 of 4 · You")).toBeVisible();
  await expect(page.getByText("Pay", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Intake received" })).toHaveCount(0);
  await expect(page.getByText("You", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Your name")).toBeVisible();
});
