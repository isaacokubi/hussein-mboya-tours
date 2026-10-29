import { expect, test } from "@playwright/test";

const customer = {
  _id: "65b000000000000000000110",
  name: "Checkout Control Test",
  role: "customer",
  tenantId: "65b000000000000000000120",
  phone: "0700000000",
};
const tour = {
  _id: "65b000000000000000000130",
  title: "Checkout Control Safari",
  price: 10000,
  capacity: 10,
  startDate: "2027-04-15T00:00:00.000Z",
  endDate: "2027-04-17T00:00:00.000Z",
  date: "2027-04-15T00:00:00.000Z",
  destination: { _id: "65b000000000000000000131", name: "Meru" },
};

async function openTourCheckout(page) {
  await page.addInitScript((user) => {
    localStorage.setItem("token", "checkout-control-test-token");
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("tenantId", user.tenantId);
  }, customer);
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/subscription")) return route.fulfill({ json: { plan: "enterprise", features: ["payments"] } });
    if (url.pathname.endsWith("/auth/me")) return route.fulfill({ json: { user: customer } });
    if (url.pathname.includes(tour._id)) return route.fulfill({ json: { success: true, data: tour } });
    if (url.pathname.endsWith("/settings/public")) return route.fulfill({ json: { success: true, settings: { currency: "KES", enableMpesa: true, bookingDepositPercentage: 30 } } });
    return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [] } });
  });
  await page.goto(`/checkout/tour/${tour._id}`);
  await expect(page.getByRole("heading", { name: "Complete your booking" })).toBeVisible();
}

for (const viewport of [
  { label: "mobile", width: 375, height: 812 },
  { label: "laptop", width: 1280, height: 800 },
]) {
  test(`traveller count remains editable after clearing on ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openTourCheckout(page);
    const travellers = page.getByRole("spinbutton", { name: "Number of travellers" });
    await expect(travellers).toHaveValue("1");
    await travellers.fill("");
    await expect(travellers).toBeVisible();
    await expect(page.getByText("This booking is fully paid.")).toHaveCount(0);
    await expect(travellers).toHaveValue("");
    await travellers.fill("3");
    await expect(travellers).toHaveValue("3");
    await expect(page.getByText("This booking is fully paid.")).toHaveCount(0);
  });
}

test("checkout explains where operators enable payment methods when none are active", async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem("token", "checkout-control-test-token");
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("tenantId", user.tenantId);
  }, customer);
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/subscription")) return route.fulfill({ json: { plan: "enterprise", features: ["payments"] } });
    if (url.pathname.endsWith("/auth/me")) return route.fulfill({ json: { user: customer } });
    if (url.pathname.includes(tour._id)) return route.fulfill({ json: { success: true, data: tour } });
    if (url.pathname.endsWith("/settings/public")) return route.fulfill({ json: { success: true, settings: { currency: "KES", enableMpesa: false, enableStripe: false, enablePaypal: false, enableBankTransfer: false, enableCash: false } } });
    return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [] } });
  });
  await page.goto(`/checkout/tour/${tour._id}`);
  await expect(page.getByRole("status")).toContainText("No payment methods are enabled for this tour operator.");
  await expect(page.getByRole("status")).toContainText("Admin → Finance & Insight → Payment gateways");
});
