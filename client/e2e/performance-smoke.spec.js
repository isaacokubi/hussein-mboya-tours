import { test, expect } from "@playwright/test";
import process from "node:process";

async function capturePublicFlow(page, testInfo) {
  const requests = [];
  const apiOrigin = new URL(process.env.DEMO_API_ORIGIN || "https://hussein-mboya-tours.onrender.com").origin;
  page.on("request", (request) => {
    if (new URL(request.url()).origin === apiOrigin) requests.push({ request, url: new URL(request.url()).pathname, startedAt: Date.now() });
  });
  page.on("response", async (response) => {
    const url = new URL(response.url());
    if (url.origin !== apiOrigin) return;
    const request = requests.find((item) => item.request === response.request());
    if (request) {
      request.durationMs = Date.now() - request.startedAt;
      request.status = response.status();
    }
  });

  await page.addInitScript(() => {
    window.__webVitals = { lcp: null, cls: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) window.__webVitals.lcp = entries.at(-1).startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__webVitals.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* Browser does not support a metric observer. */ }
  });

  const startedAt = Date.now();
  await page.goto("/");
  await expect(page.locator("body")).toContainText(/Hussein|safari|tour/i);
  await expect(page.getByRole("link", { name: "Tours", exact: true }).first()).toBeVisible();
  const startup = await page.evaluate(() => ({
    lcpMs: window.__webVitals.lcp,
    cls: window.__webVitals.cls,
    navigation: performance.getEntriesByType("navigation").map(({ responseStart, domContentLoadedEventEnd, loadEventEnd, transferSize }) => ({ responseStart, domContentLoadedEventEnd, loadEventEnd, transferSize }))[0],
  }));
  startup.usableMs = Date.now() - startedAt;
  startup.apiRequests = requests.map(({ url, durationMs, status }) => ({ url, durationMs, status }));
  expect(startup.apiRequests.length, "homepage startup API request budget").toBeLessThanOrEqual(3);

  const tourListStartedAt = Date.now();
  await page.goto("/tours");
  const firstTour = page.locator("a[href*='/tours/']:not([href='/tours'])").first();
  await expect(firstTour).toBeVisible({ timeout: 20_000 });
  const tourListUsableMs = Date.now() - tourListStartedAt;
  const tourStartedAt = Date.now();
  const tourResponsePromise = page.waitForResponse((response) => /\/api\/tours\/slug\//.test(new URL(response.url()).pathname));
  await firstTour.click();
  const tourResponse = await tourResponsePromise;
  expect(tourResponse.status()).toBe(200);
  const tourHeading = page.locator("main").last().locator("h1").first();
  await expect(tourHeading).toBeVisible();
  await expect(tourHeading).not.toContainText(/couldn.t find|not found/i);
  const tourUsableMs = Date.now() - tourStartedAt;

  const destinationListStartedAt = Date.now();
  await page.goto("/destinations");
  const firstDestination = page.locator("main").last().locator("a[href^='/destinations/']").first();
  await expect(firstDestination).toBeVisible({ timeout: 20_000 });
  const destinationListUsableMs = Date.now() - destinationListStartedAt;
  const destinationStartedAt = Date.now();
  const destinationResponsePromise = page.waitForResponse((response) => /\/api\/destinations\//.test(new URL(response.url()).pathname) && !/\/api\/destinations\/featured$/.test(new URL(response.url()).pathname));
  await firstDestination.click();
  const destinationResponse = await destinationResponsePromise;
  expect(destinationResponse.status()).toBe(200);
  const destinationHeading = page.locator("main").last().locator("h1").first();
  await expect(destinationHeading).toBeVisible();
  await expect(destinationHeading).not.toContainText(/destination not found/i);
  const destinationUsableMs = Date.now() - destinationStartedAt;

  const sample = {
      capturedAt: new Date().toISOString(),
      environment: testInfo.project.use.baseURL || "configured Playwright baseURL",
      viewport: page.viewportSize(),
      startup,
      tourListUsableMs,
      tourUsableMs,
      destinationListUsableMs,
      destinationUsableMs,
      apiRequests: requests.map(({ url, durationMs, status }) => ({ url, durationMs, status })),
  };
  const sampleJson = JSON.stringify(sample, null, 2);
  console.log(`PERFORMANCE_SAMPLE ${sampleJson}`);
  await testInfo.attach("public-performance-sample.json", {
    body: sampleJson,
    contentType: "application/json",
  });
}

test("public startup and catalogue navigation performance sample — desktop", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 1280, height: 720 } });
  try { await capturePublicFlow(await context.newPage(), testInfo); }
  finally { await context.close(); }
});

test("public startup and catalogue navigation performance sample — mobile", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try { await capturePublicFlow(await context.newPage(), testInfo); }
  finally { await context.close(); }
});
