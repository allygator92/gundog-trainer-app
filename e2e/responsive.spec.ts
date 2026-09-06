import { expect, test, type Page } from "@playwright/test";
import { adminHeaderLayout } from "../src/lib/admin-header-layout";
import { expectLocatorsDoNotOverlap, skipDemoWelcome } from "./helpers";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "ipad", width: 768, height: 1024 },
  { name: "web", width: 1280, height: 800 },
] as const;

test.beforeEach(async ({ page }) => {
  await skipDemoWelcome(page);
});

async function mountAdminHeaderFixture(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("site-header")).toBeVisible();
  const css = await page.evaluate(() =>
    [...document.querySelectorAll("link[rel='stylesheet'], style")]
      .map((node) => node.outerHTML)
      .join("\n"),
  );
  const { bar, brand, toggle, actions } = adminHeaderLayout;
  await page.setContent(`<!DOCTYPE html>
    <html lang="en-GB">
      <head>${css}</head>
      <body>
        <header class="admin-header">
          <div class="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div class="${bar}">
              <h1 class="${brand}" data-testid="fixture-brand">Gundog Trainer Admin</h1>
              <div class="${toggle}" data-testid="fixture-toggle">
                <div class="theme-toggle inline-flex h-8 w-[8.5rem] shrink-0 rounded-full border"></div>
              </div>
              <div class="${actions}" data-testid="fixture-actions">
                <button type="button" class="admin-header-btn h-9 rounded-md border px-3 text-sm">Support</button>
                <button type="button" class="admin-header-btn h-9 rounded-md border px-3 text-sm">View site</button>
                <button type="button" class="admin-header-btn h-9 rounded-md px-3 text-sm">Sign out</button>
              </div>
            </div>
          </div>
        </header>
      </body>
    </html>`);
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("public header brand and look toggle do not overlap", async ({ page }) => {
      await page.goto("/");
      const brand = page.getByRole("link", { name: "Gundog Trainer home" });
      const toggle = page.getByRole("group", { name: "Website look" });
      await expectLocatorsDoNotOverlap(brand, toggle, `${viewport.name} public header`);
      await expect(page.getByRole("button", { name: /heath look/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /field look/i })).toBeVisible();
    });

    test("booking calendar stays usable and does not offer a past-day waitlist", async ({ page }) => {
      await page.goto("/book");
      await page.getByRole("button", { name: /Virtual Training Session/ }).click();
      await expect(page.getByRole("button", { name: "First available" })).toBeVisible({ timeout: 15_000 });
      await expect(page.getByRole("heading", { name: /That day is full/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^\d{2}:\d{2}$/ }).first()).toBeVisible();
    });

    test("cookies sample note explains the live-site behaviour", async ({ page }) => {
      await page.goto("/cookies");
      await expect(page.getByText("Why this cookies page is here")).toBeVisible();
      await expect(page.getByText(/On a live site you would still see this kind of page/i)).toBeVisible();
    });

    test("admin header actions wrap instead of covering the brand", async ({ page }) => {
      await mountAdminHeaderFixture(page);
      const brand = page.getByTestId("fixture-brand");
      const actions = page.getByTestId("fixture-actions");
      const toggle = page.getByTestId("fixture-toggle");
      await expectLocatorsDoNotOverlap(brand, actions, `${viewport.name} admin brand vs actions`);
      await expectLocatorsDoNotOverlap(brand, toggle, `${viewport.name} admin brand vs toggle`);
      await expectLocatorsDoNotOverlap(toggle, actions, `${viewport.name} admin toggle vs actions`);
    });
  });
}
