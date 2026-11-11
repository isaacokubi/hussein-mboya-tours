/**
 * Purpose: checkout controls.spec automated test. Main declarations: openTourCheckout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { expect, test } from "@playwright/test";

// Declare customer for use by the surrounding module or function.
const customer = {
  _id: "65b000000000000000000110",
  name: "Checkout Control Test",
  role: "customer",
  tenantId: "65b000000000000000000120",
  phone: "0700000000",
};
// Declare tour for use by the surrounding module or function.
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

// Define openTourCheckout; its parameters and body implement this operation.
async function openTourCheckout(page) {
  // Perform the side effect or state update expressed on the following line.
  await page.addInitScript((user) => {
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("token", "checkout-control-test-token");
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("user", JSON.stringify(user));
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("tenantId", user.tenantId);
  }, customer);
  // Perform the side effect or state update expressed on the following line.
  await page.route("**/api/**", async (route) => {
    // Declare url for use by the surrounding module or function.
    const url = new URL(route.request().url());
    // Check the condition (url.pathname.endsWith("/subscription")) and run the matching branch.
    if (url.pathname.endsWith("/subscription")) return route.fulfill({ json: { plan: "enterprise", features: ["payments"] } });
    // Check the condition (url.pathname.endsWith("/auth/me")) and run the matching branch.
    if (url.pathname.endsWith("/auth/me")) return route.fulfill({ json: { user: customer } });
    // Check the condition (url.pathname.includes(tour._id)) and run the matching branch.
    if (url.pathname.includes(tour._id)) return route.fulfill({ json: { success: true, data: tour } });
    // Check the condition (url.pathname.endsWith("/settings/public")) and run the matching branch.
    if (url.pathname.endsWith("/settings/public")) return route.fulfill({ json: { success: true, settings: { currency: "KES", enableMpesa: true, bookingDepositPercentage: 30 } } });
    // Return the result of route.fulfill() to the caller.
    return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [] } });
  });
  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/checkout/tour/${tour._id}`);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("heading", { name: "Complete your booking" })).toBeVisible();
}

// Repeat the enclosed work for each required iteration.
for (const viewport of [
  { label: "mobile", width: 375, height: 812 },
  { label: "laptop", width: 1280, height: 800 },
]) {
  // Perform the side effect or state update expressed on the following line.
  test(`traveller count remains editable after clearing on ${viewport.label}`, async ({ page }) => {
    // Perform the side effect or state update expressed on the following line.
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    // Perform the side effect or state update expressed on the following line.
    await openTourCheckout(page);
    // Declare travellers for use by the surrounding module or function.
    const travellers = page.getByRole("spinbutton", { name: "Number of travellers" });
    // Perform the side effect or state update expressed on the following line.
    await expect(travellers).toHaveValue("1");
    // Perform the side effect or state update expressed on the following line.
    await travellers.fill("");
    // Perform the side effect or state update expressed on the following line.
    await expect(travellers).toBeVisible();
    // Perform the side effect or state update expressed on the following line.
    await expect(page.getByText("This booking is fully paid.")).toHaveCount(0);
    // Perform the side effect or state update expressed on the following line.
    await expect(travellers).toHaveValue("");
    // Perform the side effect or state update expressed on the following line.
    await travellers.fill("3");
    // Perform the side effect or state update expressed on the following line.
    await expect(travellers).toHaveValue("3");
    // Perform the side effect or state update expressed on the following line.
    await expect(page.getByText("This booking is fully paid.")).toHaveCount(0);
  });
}

// Perform the side effect or state update expressed on the following line.
test("checkout explains where operators enable payment methods when none are active", async ({ page }) => {
  // Perform the side effect or state update expressed on the following line.
  await page.addInitScript((user) => {
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("token", "checkout-control-test-token");
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("user", JSON.stringify(user));
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem("tenantId", user.tenantId);
  }, customer);
  // Perform the side effect or state update expressed on the following line.
  await page.route("**/api/**", async (route) => {
    // Declare url for use by the surrounding module or function.
    const url = new URL(route.request().url());
    // Check the condition (url.pathname.endsWith("/subscription")) and run the matching branch.
    if (url.pathname.endsWith("/subscription")) return route.fulfill({ json: { plan: "enterprise", features: ["payments"] } });
    // Check the condition (url.pathname.endsWith("/auth/me")) and run the matching branch.
    if (url.pathname.endsWith("/auth/me")) return route.fulfill({ json: { user: customer } });
    // Check the condition (url.pathname.includes(tour._id)) and run the matching branch.
    if (url.pathname.includes(tour._id)) return route.fulfill({ json: { success: true, data: tour } });
    // Check the condition (url.pathname.endsWith("/settings/public")) and run the matching branch.
    if (url.pathname.endsWith("/settings/public")) return route.fulfill({ json: { success: true, settings: { currency: "KES", enableMpesa: false, enableStripe: false, enablePaypal: false, enableBankTransfer: false, enableCash: false } } });
    // Return the result of route.fulfill() to the caller.
    return route.fulfill({ json: { success: true, data: [], bookings: [], tours: [] } });
  });
  // Perform the side effect or state update expressed on the following line.
  await page.goto(`/checkout/tour/${tour._id}`);
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("status")).toContainText("No payment methods are enabled for this tour operator.");
  // Perform the side effect or state update expressed on the following line.
  await expect(page.getByRole("status")).toContainText("Admin → Finance & Insight → Payment gateways");
});
