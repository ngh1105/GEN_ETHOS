import { expect, test } from "@playwright/test";

test("onboarding flow works with mock data", async ({ page }) => {
  await page.goto("/onboarding");

  await page.getByTestId("register-company-id").fill("SMOKE_CO");
  await page.getByTestId("register-target").fill("25");
  await page.getByTestId("register-submit").click();

  await page.getByTestId("deposit-company-id").fill("SMOKE_CO");
  await page.getByTestId("deposit-amount").fill("150");
  await page.getByTestId("deposit-submit").click();

  await page.goto("/explorer");
  await page.getByTestId("explorer-company-id").fill("SMOKE_CO");
  await page.getByTestId("explorer-lookup").click();

  await expect(page.getByTestId("explorer-profile")).toContainText("SMOKE_CO");
  await expect(page.getByTestId("explorer-escrow-balance")).toHaveText("150 GEN");
});

test("audit-engine flow returns INCONCLUSIVE for single source", async ({ page }) => {
  await page.goto("/audit-engine");

  await page.getByTestId("audit-company-id").fill("APPLE_INC");
  await page
    .getByTestId("audit-official-url")
    .fill("https://www.apple.com/environment/");
  await page.getByTestId("audit-submit").click();

  await expect(page.getByText("STATUS: ACCEPTED")).toBeVisible();
  await expect(page.getByTestId("audit-result-card")).toContainText("INCONCLUSIVE");

  await page.goto("/explorer");
  await page.getByTestId("explorer-company-id").fill("APPLE_INC");
  await page.getByTestId("explorer-lookup").click();

  await expect(page.getByTestId("explorer-latest-verdict")).toContainText("INCONCLUSIVE");
});

test("explorer pagination can load additional audits", async ({ page }) => {
  await page.goto("/explorer");

  await page.getByTestId("explorer-company-id").fill("PAGED_INC");
  await page.getByTestId("explorer-lookup").click();

  await expect(page.getByTestId("explorer-total-audits")).toHaveText("28");
  await expect(page.locator("tbody > tr")).toHaveCount(20);

  await page.getByTestId("explorer-load-more").click();
  await expect(page.locator("tbody > tr")).toHaveCount(28);
});
