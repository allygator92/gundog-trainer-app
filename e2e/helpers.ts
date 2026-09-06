import { expect, type Locator, type Page } from "@playwright/test";
import { assertNoOverlap } from "../src/lib/layout-overlap";

export async function skipDemoWelcome(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("gundog-demo-welcome", "dismissed");
  });
}

export async function expectLocatorsDoNotOverlap(left: Locator, right: Locator, label: string) {
  await expect(left).toBeVisible();
  await expect(right).toBeVisible();
  const a = await left.boundingBox();
  const b = await right.boundingBox();
  expect(a, `${label}: left box`).toBeTruthy();
  expect(b, `${label}: right box`).toBeTruthy();
  expect(() => assertNoOverlap(a, b, label)).not.toThrow();
}
