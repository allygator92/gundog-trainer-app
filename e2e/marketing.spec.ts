import { expect, test } from "@playwright/test";
import { skipDemoWelcome } from "./helpers";

test.beforeEach(async ({ page }) => {
  await skipDemoWelcome(page);
});

test("home page shows the book CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /confidence, recall, and field skills/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Book a session" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Gundog Trainer home" }).locator("img")).toBeVisible();
  await expect(page.getByRole("heading", { name: "FAQs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What to expect in a session" })).toBeVisible();
});

test("marketing pages render", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/training");
  await expect(page.getByRole("heading", { name: /what makes a gundog a gundog/i })).toBeVisible();

  await page.goto("/pricing");
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/privacy");
  await expect(page.getByRole("heading").first()).toBeVisible();

  await page.goto("/cookies");
  await expect(page.getByRole("heading", { name: /cookies/i })).toBeVisible();
});

test("contact form shows validation before sending", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Enter a valid email address")).toBeVisible();
});
