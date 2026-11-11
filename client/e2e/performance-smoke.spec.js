/**
 * Purpose: performance smoke.spec automated test. Main declarations: capturePublicFlow.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { test, expect } from "@playwright/test";
// Load node:process so this module can use its exported dependencies.
import process from "node:process";

// Define capturePublicFlow; its parameters and body implement this operation.
async function capturePublicFlow(page, testInfo) {
  // Declare requests for use by the surrounding module or function.
  const requests = [];
  // Declare apiOrigin for use by the surrounding module or function.
  const apiOrigin = new URL(process.env.DEMO_API_ORIGIN || "https://hussein-mboya-tours.onrender.com").origin;
  // Perform the side effect or state update expressed on the following line.
  page.on("request", (request) => {
    // Check the condition (new URL(request.url()).origin === apiOrigin) and run the matching branch.
    if (new URL(request.url()).origin === apiOrigin) requests.push({ request, url: new URL(request.url()).pathname, startedAt: Date.now() });
  });
  // Perform the side effect or state update expressed on the following line.
  page.on("response", async (response) => {
    // Declare url for use by the surrounding module or function.
    const url = new URL(response.url());
    // Check the condition (url.origin !== apiOrigin) and run the matching branch.
    if (url.origin !== apiOrigin) return;
    // Declare request for use by the surrounding module or function.
    const request = requests.find((item) => item.request === response.request());
    // Check the condition (request) and run the matching branch.
    if (request) {
      // Perform the side effect or state update expressed on the following line.
      request.durationMs = Date.now() - request.startedAt;
      // Perform the side effect or state update expressed on the following line.
      request.status = response.status();
    }
  });

  // Perform the side effect or state update expressed on the following line.
  await page.addInitScript(() => {
    // Perform the side effect or state update expressed on the following line.
    window.__webVitals = { lcp: null, cls: 0 };
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      new PerformanceObserver((list) => {
        // Declare entries for use by the surrounding module or function.
        const entries = list.getEntries();
        // Check the condition (entries.length) and run the matching branch.
        if (entries.length) window.__webVitals.lcp = entries.at(-1).startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      // Perform the side effect or state update expressed on the following line.
      new PerformanceObserver((list) => {
        // Repeat the enclosed work for each required iteration.
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__webVitals.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* Browser does not support a metric observer. */ }
  });

  // Declare startedAt for use by the surrounding module or function.
  const startedAt = Date.now();
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator("body")).toContainText(/Hussein|safari|tour/i);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("link", { name: "Tours", exact: true }).first()).toBeVisible();
  // Declare startup for use by the surrounding module or function.
  const startup = await page.evaluate(() => ({
    lcpMs: window.__webVitals.lcp,
    cls: window.__webVitals.cls,
    navigation: performance.getEntriesByType("navigation").map(({ responseStart, domContentLoadedEventEnd, loadEventEnd, transferSize }) => ({ responseStart, domContentLoadedEventEnd, loadEventEnd, transferSize }))[0],
  }));
  // Perform the side effect or state update expressed on the following line.
  startup.usableMs = Date.now() - startedAt;
  // Perform the side effect or state update expressed on the following line.
  startup.apiRequests = requests.map(({ url, durationMs, status }) => ({ url, durationMs, status }));
  // Perform the side effect or state update expressed on the following line.
  expect(startup.apiRequests.length, "homepage startup API request budget").toBeLessThanOrEqual(3);

  // Declare tourListStartedAt for use by the surrounding module or function.
  const tourListStartedAt = Date.now();
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/tours");
  // Declare firstTour for use by the surrounding module or function.
  const firstTour = page.locator("a[href*='/tours/']:not([href='/tours'])").first();
  // Perform the side effect or state update expressed on the following line.
  await expect(firstTour).toBeVisible({ timeout: 20_000 });
  // Declare tourListUsableMs for use by the surrounding module or function.
  const tourListUsableMs = Date.now() - tourListStartedAt;
  // Declare tourStartedAt for use by the surrounding module or function.
  const tourStartedAt = Date.now();
  // Declare tourResponsePromise for use by the surrounding module or function.
  const tourResponsePromise = page.waitForResponse((response) => /\/api\/tours\/slug\//.test(new URL(response.url()).pathname));
  // Perform the side effect or state update expressed on the following line.
  await firstTour.click();
  // Declare tourResponse for use by the surrounding module or function.
  const tourResponse = await tourResponsePromise;
  // Perform the side effect or state update expressed on the following line.
  expect(tourResponse.status()).toBe(200);
  // Declare tourHeading for use by the surrounding module or function.
  const tourHeading = page.locator("main").last().locator("h1").first();
  // Perform the side effect or state update expressed on the following line.
  await expect(tourHeading).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await expect(tourHeading).not.toContainText(/couldn.t find|not found/i);
  // Declare tourUsableMs for use by the surrounding module or function.
  const tourUsableMs = Date.now() - tourStartedAt;

  // Declare destinationListStartedAt for use by the surrounding module or function.
  const destinationListStartedAt = Date.now();
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/destinations");
  // Declare firstDestination for use by the surrounding module or function.
  const firstDestination = page.locator("main").last().locator("a[href^='/destinations/']").first();
  // Perform the side effect or state update expressed on the following line.
  await expect(firstDestination).toBeVisible({ timeout: 20_000 });
  // Declare destinationListUsableMs for use by the surrounding module or function.
  const destinationListUsableMs = Date.now() - destinationListStartedAt;
  // Declare destinationStartedAt for use by the surrounding module or function.
  const destinationStartedAt = Date.now();
  // Declare destinationResponsePromise for use by the surrounding module or function.
  const destinationResponsePromise = page.waitForResponse((response) => /\/api\/destinations\//.test(new URL(response.url()).pathname) && !/\/api\/destinations\/featured$/.test(new URL(response.url()).pathname));
  // Perform the side effect or state update expressed on the following line.
  await firstDestination.click();
  // Declare destinationResponse for use by the surrounding module or function.
  const destinationResponse = await destinationResponsePromise;
  // Perform the side effect or state update expressed on the following line.
  expect(destinationResponse.status()).toBe(200);
  // Declare destinationHeading for use by the surrounding module or function.
  const destinationHeading = page.locator("main").last().locator("h1").first();
  // Perform the side effect or state update expressed on the following line.
  await expect(destinationHeading).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await expect(destinationHeading).not.toContainText(/destination not found/i);
  // Declare destinationUsableMs for use by the surrounding module or function.
  const destinationUsableMs = Date.now() - destinationStartedAt;

  // Declare sample for use by the surrounding module or function.
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
  // Declare sampleJson for use by the surrounding module or function.
  const sampleJson = JSON.stringify(sample, null, 2);
  // Perform the side effect or state update expressed on the following line.
  console.log(`PERFORMANCE_SAMPLE ${sampleJson}`);
  // Perform the side effect or state update expressed on the following line.
  await testInfo.attach("public-performance-sample.json", {
    body: sampleJson,
    contentType: "application/json",
  });
}

// Perform the side effect or state update expressed on the following line.
test("public startup and catalogue navigation performance sample — desktop", async ({ browser }, testInfo) => {
  // Declare context for use by the surrounding module or function.
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 1280, height: 720 } });
  // Run this operation with a dedicated error-handling path for failures.
  try { await capturePublicFlow(await context.newPage(), testInfo); }
  finally { await context.close(); }
});

// Perform the side effect or state update expressed on the following line.
test("public startup and catalogue navigation performance sample — mobile", async ({ browser }, testInfo) => {
  // Declare context for use by the surrounding module or function.
  const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  // Run this operation with a dedicated error-handling path for failures.
  try { await capturePublicFlow(await context.newPage(), testInfo); }
  finally { await context.close(); }
});
