import puppeteer, { Browser, Page } from "puppeteer";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

describe("UI Test", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto("http://localhost:5173");
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should simulate user interactions and assert against a pre-recorded screenshot", async () => {
    // Given
    await page.waitForSelector("#place:not([disabled])");

    // When
    await page.click("#place");
    await page.click("#left");
    await page.click("#move");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.click("#report");

    // Then
    const screenshot = await page.screenshot();
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: "ui-test",
      failureThreshold: 0.01,
      failureThresholdType: "percent",
      comparisonMethod: "ssim",
    });
  }, 10000);
});
