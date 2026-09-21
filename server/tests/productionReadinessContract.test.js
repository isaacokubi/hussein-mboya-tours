import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd());
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("production readiness contract covers tenancy and payment boundaries", () => {
  const check = read("scripts/production-readiness-check.js");
  for (const file of ["middleware/tenantMiddleware.js", "middleware/resourceTenantGuard.js", "middleware/permissionMiddleware.js", "middleware/mpesaCallbackIntegrity.js", "middleware/resolveMpesaCallbackTenant.js", "tenancy/tenantPlugin.js", "services/tenantSubscriptionService.js", "services/etimsService.js"]) {
    assert.match(check, new RegExp(file.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")));
  }
});

test("subscription enforcement supports grace and billing recovery", () => {
  const middleware = read("middleware/planFeatureMiddleware.js");
  const service = read("services/tenantSubscriptionService.js");
  assert.match(middleware, /SUBSCRIPTION_REQUIRED/);
  assert.match(middleware, /GRACE_DAYS/);
  assert.match(middleware, /feature === "billing"/);
  assert.match(service, /SUBSCRIPTION_GRACE_PERIOD_DAYS/);
  assert.match(service, /status: "past_due"/);
  assert.match(service, /status: "expired"/);
});

test("production evidence gates are explicit", () => {
  const check = read("scripts/production-readiness-check.js");
  const checklist = read("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md");
  for (const key of ["PRODUCTION_PAYMENT_VERIFIED", "PRODUCTION_ETIMS_VERIFIED", "PRODUCTION_WEBHOOKS_VERIFIED", "PRODUCTION_BACKUP_VERIFIED", "PRODUCTION_RESTORE_TESTED", "PRODUCTION_MONITORING_VERIFIED"]) {
    assert.match(check, new RegExp(key));
    assert.match(checklist, new RegExp(key));
  }
});

test("CI validates server, live tenant isolation, and client production build", () => {
  const workflow = read("../.github/workflows/ci.yml");
  assert.match(workflow, /npm run check:all/);
  assert.match(workflow, /npm run check:multitenancy:live/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
});

test("hospitality booking mutations cannot directly set payment status", () => {
  const hotel = read("controllers/hotelController.js");
  const transfer = read("controllers/airportTransferController.js");
  assert.doesNotMatch(hotel, /booking\.paymentStatus\s*=/);
  assert.doesNotMatch(transfer, /booking\.paymentStatus\s*=/);
  assert.match(read("middleware/paymentMutationGuard.js"), /verified payment lifecycle/);
});

test("hospitality customer mutations are restricted to safe request fields", () => {
  const hotel = read("controllers/hotelController.js");
  const transfer = read("controllers/airportTransferController.js");
  assert.match(hotel, /Customers may only update special requests/);
  assert.match(transfer, /Customers may only update special requests/);
  assert.match(transfer, /Vehicle is already assigned to transfer/);
  assert.match(transfer, /Driver is already assigned to transfer/);
});

test("admin booking payment endpoint is read-only", () => {
  const source = read("controllers/bookingAdminController.js");
  assert.match(source, /BOOKING_PAYMENT_STATUS_READ_ONLY/);
  assert.doesNotMatch(source, /booking\.paymentStatus = status/);
  assert.doesNotMatch(source, /Manual "paid" changes must also create/);
});

test("canonical booking status route cannot mutate payment status directly", () => {
  const source = read("controllers/bookingController.js");
  assert.match(source, /canTransitionBookingStatus/);
  assert.match(source, /PAYMENT_REQUIRED_BEFORE_COMPLETION/);
  assert.doesNotMatch(source, /if\s*\(req\.body\.paymentStatus\)/);
  assert.doesNotMatch(source, /booking\.paymentStatus\s*=\s*req\.body\.paymentStatus/);
});

test("legacy admin booking payment endpoint is disabled", () => {
  const source = read("controllers/adminBookingController.js");
  assert.match(source, /BOOKING_PAYMENT_STATUS_READ_ONLY/);
  assert.doesNotMatch(source, /booking\.paymentStatus\s*=\s*status/);
});

test("unsafe fallback examples default to disabled", () => {
  const env = read(".env.example");
  assert.match(env, /ALLOW_SINGLE_TENANT_DEV_FALLBACK=false/);
  assert.match(env, /ALLOW_GLOBAL_MPESA_FALLBACK=false/);
});

test("agent booking status updates enforce lifecycle and payment boundaries", () => {
  const source = read("controllers/agentBookingController.js");
  assert.match(source, /canTransitionBookingStatus/);
  assert.match(source, /PAYMENT_REQUIRED_BEFORE_COMPLETION/);
  assert.doesNotMatch(source, /booking\.status = status;\s*\n\s*booking\.updatedBy/);
});

test("admin booking status updates enforce lifecycle and payment boundaries", () => {
  const source = read("controllers/adminBookingController.js");
  assert.match(source, /canTransitionBookingStatus/);
  assert.match(source, /PAYMENT_REQUIRED_BEFORE_COMPLETION/);
  assert.doesNotMatch(source, /findOneAndUpdate\([\s\S]*?\{ status \}/);
});

test("admin client cannot manually mutate booking payment status", () => {
  const management = fs.readFileSync(path.join(root, "../client/src/pages/admin/BookingManagement.jsx"), "utf8");
  const manage = fs.readFileSync(path.join(root, "../client/src/pages/admin/ManageBookings.jsx"), "utf8");
  assert.doesNotMatch(management, /updateBookingPayment/);
  assert.doesNotMatch(management, /paymentMutation/);
  assert.doesNotMatch(manage, /updateBookingPayment/);
  assert.doesNotMatch(manage, /paymentMutation/);
});

test("hospitality booking mutation controllers enforce authorized staff roles", () => {
  const hotel = read("controllers/hotelController.js");
  const transfer = read("controllers/airportTransferController.js");
  assert.match(hotel, /Only authorized booking operations staff may modify this reservation/);
  assert.match(transfer, /Only authorized booking operations staff may modify this reservation/);
});
