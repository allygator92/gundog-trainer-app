import type { Page } from "@playwright/test";

export async function skipDemoWelcome(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("gundog-demo-welcome", "dismissed");
  });
}
