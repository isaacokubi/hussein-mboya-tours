import { expect, test } from "@playwright/test";

const tourId = "65b000000000000000000001";
const destinationId = "65b000000000000000000002";
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

async function prepareAdminSession(page, { failLoad = false, failSave = false, saveDelay = 0 } = {}) {
  let tour = tourFixture();
  const otherTour = { ...tourFixture(), _id: "65b000000000000000000003", title: "Hell's Gate Cycling Adventure" };
  let updateCount = 0;
  let lastUpdateTenantId = "";
  await page.addInitScript(() => {
    localStorage.setItem("token", "mock-admin-token");
    localStorage.setItem("user", JSON.stringify({
      _id: "65b000000000000000000010",
      name: "Demo Safari Administrator",
      role: "admin",
      tenantId: "65b000000000000000000020",
      tenantSlug: "demo-safari-adventures",
    }));
  });

  await page.route("http://127.0.0.1:4174/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith("/auth/me")) {
      return route.fulfill({ json: { user: { _id: "65b000000000000000000010", name: "Demo Safari Administrator", role: "admin", tenantId: "65b000000000000000000020", tenantSlug: "demo-safari-adventures" } } });
    }
    if (path.endsWith("/admin/tours") && request.method() === "GET") {
      return route.fulfill({ json: { success: true, tours: [tour, otherTour] } });
    }
    if (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "GET") {
      if (failLoad) return route.fulfill({ status: 404, json: { success: false, message: "Tour not found for this test." } });
      return route.fulfill({ json: { success: true, tour } });
    }
    if (path.endsWith(`/admin/tours/${tourId}`) && request.method() === "PUT") {
      updateCount += 1;
      lastUpdateTenantId = request.headers()["x-tenant-id"] || "";
      if (saveDelay) await new Promise((resolve) => setTimeout(resolve, saveDelay));
      if (failSave) return route.fulfill({ status: 422, json: { success: false, message: "Tour update rejected for this test." } });
      const body = request.postData() || "";
      const title = body.match(/name="title"\r?\n\r?\n([^\r\n]+)/)?.[1];
      if (title) tour = { ...tour, title };
      return route.fulfill({ json: { success: true, tour } });
    }
    if (path.endsWith("/destinations")) {
      return route.fulfill({ json: { destinations: [{ _id: destinationId, name: "Meru National Park" }] } });
    }
    return route.fulfill({ json: { success: true, data: [] } });
  });

  return { getUpdateCount: () => updateCount, getLastUpdateTenantId: () => lastUpdateTenantId };
}

test("admin Add Tour stays in the admin workspace instead of the tour-manager redirect", async ({ page }) => {
  await prepareAdminSession(page);
  await page.goto("/admin/tours");
  await page.getByRole("link", { name: "Add Tour" }).click();
  await expect(page).toHaveURL("/admin/create-tour");
  await expect(page.getByRole("heading", { name: "Create New Tour" })).toBeVisible();
});

test("admin Edit opens the tenant editor for the selected database ID and preserves its destination", async ({ page }) => {
  await prepareAdminSession(page);
  await page.goto("/admin/tours");
  await page.getByRole("link", { name: "Edit" }).first().click();

  await expect(page).toHaveURL(`/admin/tours/${tourId}/edit`);
  await expect(page.getByRole("heading", { name: "Edit Tour" })).toBeVisible();
  await expect(page.getByLabel("Title")).toHaveValue("Meru Untamed Wilderness Safari");
  await expect(page.getByLabel("Category")).toHaveValue("Safari");
  await expect(page.locator('textarea[name="description"]')).toHaveValue("A saved description for the selected Meru tour.");
  await expect(page.getByLabel("Destination")).toHaveValue(destinationId);
  await expect(page.getByLabel("Destination")).toContainText("Meru National Park");
});

test("a failed tour load shows an error instead of leaving the editor in a loading state", async ({ page }) => {
  await prepareAdminSession(page, { failLoad: true });
  await page.goto(`/admin/tours/${tourId}/edit`);
  await expect(page.getByText("Failed to load the tour.")).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("save updates the selected tour once and refreshes the admin list", async ({ page }) => {
  const mock = await prepareAdminSession(page, { saveDelay: 250 });
  await page.goto(`/admin/tours/${tourId}/edit`);
  await expect(page.getByLabel("Title")).toHaveValue("Meru Untamed Wilderness Safari");
  await page.getByLabel("Title").fill("Meru Safari Updated");
  const save = page.getByRole("button", { name: "Update Tour" });
  await save.dblclick();
  await expect(page).toHaveURL("/admin/tours");
  await expect(page.getByRole("heading", { name: "Meru Safari Updated" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hell's Gate Cycling Adventure" })).toBeVisible();
  expect(mock.getUpdateCount()).toBe(1);
  expect(mock.getLastUpdateTenantId()).toBe("65b000000000000000000020");
});

test("cancel leaves the tour unchanged and a failed save stays visible with the form intact", async ({ page }) => {
  const mock = await prepareAdminSession(page, { failSave: true });
  await page.goto(`/admin/tours/${tourId}/edit`);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL("/admin/tours");
  expect(mock.getUpdateCount()).toBe(0);

  await page.goto(`/admin/tours/${tourId}/edit`);
  await page.getByLabel("Title").fill("Unsaved attempt");
  await page.getByRole("button", { name: "Update Tour" }).click();
  await expect(page.locator('div[role="alert"].mb-5')).toContainText("Tour update rejected for this test.");
  await expect(page.getByLabel("Title")).toHaveValue("Unsaved attempt");
  await expect(page).toHaveURL(`/admin/tours/${tourId}/edit`);
});
