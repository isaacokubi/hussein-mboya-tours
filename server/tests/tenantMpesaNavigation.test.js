import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("tenant navigation exposes M-Pesa Configuration independently from plan features and transactions", async () => {
  const layout = await read("../../client/src/layouts/AdminLayout.jsx");
  assert.match(layout, /\["M-Pesa Configuration", "\/admin\/payment-gateways", Smartphone, "settings\.manage"\]/);
  assert.match(layout, /"M-Pesa Transactions"/);
  assert.match(layout, /"M-Pesa Configuration"/);
  const entry = layout.match(/\["M-Pesa Configuration", "\/admin\/payment-gateways", Smartphone, "settings\.manage"([^\]]*)\]/);
  assert.equal(entry?.[1], "", "the link must not be plan-feature gated");
});

test("tenant route reuses the tenant gateway form and remains inside the authenticated admin layout", async () => {
  const routes = await read("../../client/src/routes/AppRoutes.jsx");
  const page = await read("../../client/src/pages/admin/MpesaConfiguration.jsx");
  const layout = await read("../../client/src/components/admin/PaymentGatewayCenter.jsx");
  assert.ok(routes.indexOf('<Route path="/admin" element={<AdminRoute><AdminLayout/></AdminRoute>}>') >= 0);
  assert.ok(routes.includes('<Route path="payment-gateways" element={<MpesaConfiguration/>}/>'));
  assert.match(page, /<PaymentGatewayCenter mpesaOnly\s*\/>/);
  assert.match(layout, /getPaymentGateway\(provider, form\.environment\)/);
  assert.match(layout, /type="password" autoComplete="new-password"/);
  assert.match(layout, /Validate configuration/);
});

test("gateway detail API selects safe metadata for the requested environment", async () => {
  const controller = await read("../controllers/paymentGatewayController.js");
  assert.match(controller, /req\.query\?\.environment/);
  assert.match(controller, /activeEnvironment: config\.environment \|\| "sandbox"/);
  assert.match(controller, /enabled: \["MPESA", "PAYPAL"\]\.includes\(provider\) \? Boolean\(config\.enabled && config\.environment === environment\)/);
  assert.match(controller, /checkoutAvailable: paypalCheckoutAvailable/);
  assert.match(controller, /secretsConfigured: provider === "PAYPAL"/);
  assert.match(controller, /secretsConfigured: \{ clientId: Boolean\(paypalSettings\.clientId\)/);
  assert.doesNotMatch(controller.match(/export const getGatewayConfig[\s\S]*?export const disableGatewayConfig/)?.[0] || "", /consumerKeyEncrypted:/);
});

test("tenant Settings payment-method controls remain present", async () => {
  const settings = await read("../../client/src/pages/admin/AdminSettings.jsx");
  assert.match(settings, /Regional, tax & payment rules/);
  assert.match(settings, /M-Pesa/);
});
