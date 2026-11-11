/**
 * Purpose: tenant Mpesa Navigation.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs/promises so this module can use its exported dependencies.
import { readFile } from "node:fs/promises";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare read for use by the surrounding module or function.
const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

// Perform the side effect or state update expressed on the following line.
test("tenant navigation exposes M-Pesa Configuration independently from plan features and transactions", async () => {
  // Declare layout for use by the surrounding module or function.
  const layout = await read("../../client/src/layouts/AdminLayout.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /\["M-Pesa Configuration", "\/admin\/payment-gateways", Smartphone, "settings\.manage"\]/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /"M-Pesa Transactions"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /"M-Pesa Configuration"/);
  // Declare entry for use by the surrounding module or function.
  const entry = layout.match(/\["M-Pesa Configuration", "\/admin\/payment-gateways", Smartphone, "settings\.manage"([^\]]*)\]/);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(entry?.[1], "", "the link must not be plan-feature gated");
});

// Perform the side effect or state update expressed on the following line.
test("tenant route reuses the tenant gateway form and remains inside the authenticated admin layout", async () => {
  // Declare routes for use by the surrounding module or function.
  const routes = await read("../../client/src/routes/AppRoutes.jsx");
  // Declare page for use by the surrounding module or function.
  const page = await read("../../client/src/pages/admin/MpesaConfiguration.jsx");
  // Declare layout for use by the surrounding module or function.
  const layout = await read("../../client/src/components/admin/PaymentGatewayCenter.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(routes.indexOf('<Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>') >= 0);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(routes.includes('<Route path="payment-gateways" element={<MpesaConfiguration/>}/>'));
  // Perform the side effect or state update expressed on the following line.
  assert.match(page, /<PaymentGatewayCenter mpesaOnly\s*\/>/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /getPaymentGateway\(provider, form\.environment\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /type="password" autoComplete="new-password"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(layout, /Validate configuration/);
});

// Perform the side effect or state update expressed on the following line.
test("gateway detail API selects safe metadata for the requested environment", async () => {
  // Declare controller for use by the surrounding module or function.
  const controller = await read("../controllers/paymentGatewayController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /req\.query\?\.environment/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /activeEnvironment: config\.environment \|\| "sandbox"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /enabled: \["MPESA", "PAYPAL"\]\.includes\(provider\) \? Boolean\(config\.enabled && config\.environment === environment\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /checkoutAvailable: paypalCheckoutAvailable/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /secretsConfigured: provider === "PAYPAL"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /secretsConfigured: \{ clientId: Boolean\(paypalSettings\.clientId\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(controller.match(/export const getGatewayConfig[\s\S]*?export const disableGatewayConfig/)?.[0] || "", /consumerKeyEncrypted:/);
});

// Perform the side effect or state update expressed on the following line.
test("tenant Settings payment-method controls remain present", async () => {
  // Declare settings for use by the surrounding module or function.
  const settings = await read("../../client/src/pages/admin/AdminSettings.jsx");
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /Regional, tax & payment rules/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /M-Pesa/);
});
