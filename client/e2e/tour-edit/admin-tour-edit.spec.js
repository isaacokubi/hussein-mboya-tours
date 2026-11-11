/**
 * Purpose: admin tour edit.spec automated test. Main declarations: tourFixture, prepareAdminSession.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { expect, test } from "@playwright/test";

// Declare tourId for use by the surrounding module or function.
const tourId = "65b000000000000000000001";
// Declare destinationId for use by the surrounding module or function.
const destinationId = "65b000000000000000000002";
// Declare tourFixture for use by the surrounding module or function.
const tourFixture = () => ({
  _id: tourId,
  title: "Meru Untamed Wilderness Safari",
  shortDescription: "A saved short description",
  description: "A saved description for the selected Meru tour.",
  category: "Safari",
  destination: { _id: destinationId, name: "Meru National Park" },
  country: "Kenya",
  location: "Meru",
  meetingPoint: "Nairobi",
  date: "2027-04-15T00:00:00.000Z",
  startDate: "2027-04-15T00:00:00.000Z",
  endDate: "2027-04-16T00:00:00.000Z",
  duration: 2,
  capacity: 12,
  price: 42000,
  discount: 5,
  difficulty: "moderate",
  status: "upcoming",
  featured: true,
  available: true,
});

// Define prepareAdminSession; its parameters and body implement this operation.
async function prepareAdminSession(page, { failLoad = false, failSave = false, saveDelay = 0 } = {}) {
  // Declare tour for use by the surrounding module or function.
  let tour = tourFixture();
  // Declare otherTour for use by the surrounding module or function.
  const otherTour = { ...tourFixture(), _id: "65b000000000000000000003", title: "Hell's Gate Cycling Adventure" };
  // Declare updateCount for use by the surrounding module or function.
  let updateCount = 0;
  // Declare lastUpdateTenantId for use by the surrounding module or function.
  let lastUpdateTenantId = "";
  // Perform the side effect or state update expressed on the following line.
  await page.addInitScript(() => {
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("token", "mock-admin-token");
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("user", JSON.stringify({
      _id: "65b000000000000000000010",
      name: "Demo Safari Administrator",
      role: "admin",
      tenantId: "65b000000000000000000020",
      tenantSlug: "demo-safari-adventures",
    }));
  });

  // Perform the side effect or state update expressed on the following line.
  await page.route("http://127.0.0.1:4174/api/**", async (route) => {
    // Declare request for use by the surrounding module or function.
    const request = route.request();
    // Declare url for use by the surrounding module or function.
    const url = new URL(request.url());
    // Declare path for use by the surrounding module or function.
    const path = url.pathname;
    // Check the condition (path.endsWith("/auth/me")) and run the matching branch.
    if (path.endsWith("/auth/me")) {
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { user: { _id: "65b000000000000000000010", name: "Demo Safari Administrator", role: "admin", tenantId: "65b000000000000000000020", tenantSlug: "demo-safari-adventures" } } });
    }
    // Check the condition (path.endsWith("/admin/tours") && request.method() === "GET") and run the matching branch.
    if (path.endsWith("/admin/tours") && request.method() === "GET") {
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { success: true, tours: [tour, otherTour] } });
    }
    // Check the condition (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "GET") and run the matching branch.
    if (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "GET") {
      // Check the condition (failLoad) and run the matching branch.
      if (failLoad) return route.fulfill({ status: 404, json: { success: false, message: "Tour not found for this test." } });
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { success: true, tour } });
    }
    // Check the condition (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "PUT") and run the matching branch.
    if (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "PUT") {
      // Perform the side effect or state update expressed on the following line.
      updateCount += 1;
      // Perform the side effect or state update expressed on the following line.
      lastUpdateTenantId = request.headers()["x-tenant-id"] || "";
      // Check the condition (saveDelay) and run the matching branch.
      if (saveDelay) await new Promise((resolve) => setTimeout(resolve, saveDelay));
      // Check the condition (failSave) and run the matching branch.
      if (failSave) return route.fulfill({ status: 422, json: { success: false, message: "Tour update rejected for this test." } });
      // Declare body for use by the surrounding module or function.
      const body = request.postData() || "";
      // Declare title for use by the surrounding module or function.
      const title = body.match(/name="title"\r?\n\r?\n([^\r\n]+)/)?.[1];
      // Check the condition (title) and run the matching branch.
      if (title) tour = { ...tour, title };
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { success: true, tour } });
    }
    // Check the condition (path.endsWith("/destinations")) and run the matching branch.
    if (path.endsWith("/destinations")) {
      // Return the result of route.fulfill() to the caller.
      return route.fulfill({ json: { destinations: [{ _id: destinationId, name: "Meru National Park" }] } });
    }
    // Return the result of route.fulfill() to the caller.
    return route.fulfill({ json: { success: true, data: [] } });
  });

  // Return the object assembled below to the caller.
  return { getUpdateCount: () => updateCount, getLastUpdateTenantId: () => lastUpdateTenantId };
}

// Perform the side effect or state update expressed on the following line.
test("admin Add Tour stays in the admin workspace instead of the tour-manager redirect", async ({ page }) => {
  // Perform the side effect or state update expressed on the following line.
  await prepareAdminSession(page);
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/admin/tours");
  // Perform the side effect or state update expressed on the following line.
  await page.getByRole("link", { name: "Add Tour" }).click();
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL("/admin/create-tour");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("heading", { name: "Create New Tour" })).toBeVisible();
});

// Perform the side effect or state update expressed on the following line.
test("admin Edit opens the tenant editor for the selected database ID and preserves its destination", async ({ page }) => {
  // Perform the side effect or state update expressed on the following line.
  await prepareAdminSession(page);
  // Perform the side effect or state update expressed on the following line.
  await page.goto("/admin/tours");
  // Perform the side effect or state update expressed on the following line.
  await page.getByRole("link", { name: "Edit" }).first().click();

  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL(`/admin/tours/${tourId}/edit`);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("heading", { name: "Edit Tour" })).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Title")).toHaveValue("Meru Untamed Wilderness Safari");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Category")).toHaveValue("Safari");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator('textarea[name="description"]')).toHaveValue("A saved description for the selected Meru tour.");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Destination")).toHaveValue(destinationId);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Destination")).toContainText("Meru National Park");
});

// Perform the side effect or state update expressed on the following line.
test("a failed tour load shows an error instead of leaving the editor in a loading state", async ({ page }) => {
  // Perform the side effect or state update expressed on the following line.
  await prepareAdminSession(page, { failLoad: true });
  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/admin/tours/${tourId}/edit`);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByText("Failed to load the tour.")).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("status")).toHaveCount(0);
});

// Perform the side effect or state update expressed on the following line.
test("save updates the selected tour once and refreshes the admin list", async ({ page }) => {
  // Declare mock for use by the surrounding module or function.
  const mock = await prepareAdminSession(page, { saveDelay: 250 });
  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/admin/tours/${tourId}/edit`);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Title")).toHaveValue("Meru Untamed Wilderness Safari");
  // Perform the side effect or state update expressed on the following line.
  await page.getByLabel("Title").fill("Meru Safari Updated");
  // Declare save for use by the surrounding module or function.
  const save = page.getByRole("button", { name: "Update Tour" });
  // Perform the side effect or state update expressed on the following line.
  await save.dblclick();
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL("/admin/tours");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("heading", { name: "Meru Safari Updated" })).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("heading", { name: "Hell's Gate Cycling Adventure" })).toBeVisible();
  // Perform the side effect or state update expressed on the following line.
  expect(mock.getUpdateCount()).toBe(1);
  // Perform the side effect or state update expressed on the following line.
  expect(mock.getLastUpdateTenantId()).toBe("65b000000000000000000020");
});

// Perform the side effect or state update expressed on the following line.
test("cancel leaves the tour unchanged and a failed save stays visible with the form intact", async ({ page }) => {
  // Declare mock for use by the surrounding module or function.
  const mock = await prepareAdminSession(page, { failSave: true });
  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/admin/tours/${tourId}/edit`);
  // Perform the side effect or state update expressed on the following line.
  await page.getByRole("button", { name: "Cancel" }).click();
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL("/admin/tours");
  // Perform the side effect or state update expressed on the following line.
  expect(mock.getUpdateCount()).toBe(0);

  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/admin/tours/${tourId}/edit`);
  // Perform the side effect or state update expressed on the following line.
  await page.getByLabel("Title").fill("Unsaved attempt");
  // Perform the side effect or state update expressed on the following line.
  await page.getByRole("button", { name: "Update Tour" }).click();
  // Perform the side effect or state update expressed on the following line.
  await expect(page.locator('div[role="alert"].mb-5')).toContainText("Tour update rejected for this test.");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByLabel("Title")).toHaveValue("Unsaved attempt");
  // Perform the side effect or state update expressed on the following line.
  await expect(page).toHaveURL(`/admin/tours/${tourId}/edit`);
});
