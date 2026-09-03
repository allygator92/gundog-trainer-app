import { expect, test } from "@playwright/test";
import { demo } from "../content/demo";

test("sample-site welcome explains placeholders and payments", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: demo.welcome.title });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/booking confirmation and reminder emails/i)).toBeVisible();
  await expect(dialog.getByText(/stripe account linked to a bank/i)).toBeVisible();
  await page.getByRole("button", { name: demo.welcome.continueLabel }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: demo.launcherLabel }).click();
  await expect(page.getByText(demo.payment.testCardLabel)).toBeVisible();
  await expect(page.getByText("4242 4242 4242 4242")).toBeVisible();
});
