/**
 * Purpose: production Readiness Contract.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";

// Declare root for use by the surrounding module or function.
const root = path.resolve(process.cwd());
// Declare read for use by the surrounding module or function.
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Perform the side effect or state update expressed on the following line.
test("production readiness contract covers tenancy and payment boundaries", () => {
  // Declare check for use by the surrounding module or function.
  const check = read("scripts/production-readiness-check.js");
  // Repeat the enclosed work for each required iteration.
  for (const file of ["middleware/tenantMiddleware.js", "middleware/resourceTenantGuard.js", "middleware/permissionMiddleware.js", "middleware/mpesaCallbackIntegrity.js", "middleware/resolveMpesaCallbackTenant.js", "tenancy/tenantPlugin.js", "services/tenantSubscriptionService.js", "services/etimsService.js"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.match(check, new RegExp(file.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")));
  }
});

// Perform the side effect or state update expressed on the following line.
test("subscription enforcement supports grace and billing recovery", () => {
  // Declare middleware for use by the surrounding module or function.
  const middleware = read("middleware/planFeatureMiddleware.js");
  // Declare service for use by the surrounding module or function.
  const service = read("services/tenantSubscriptionService.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /SUBSCRIPTION_REQUIRED/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /GRACE_DAYS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(middleware, /feature === "billing"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /SUBSCRIPTION_GRACE_PERIOD_DAYS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /status: "past_due"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(service, /status: "expired"/);
});

// Perform the side effect or state update expressed on the following line.
test("production evidence gates are explicit", () => {
  // Declare check for use by the surrounding module or function.
  const check = read("scripts/production-readiness-check.js");
  // Declare checklist for use by the surrounding module or function.
  const checklist = read("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md");
  // Repeat the enclosed work for each required iteration.
  for (const key of ["PRODUCTION_PAYMENT_VERIFIED", "PRODUCTION_ETIMS_VERIFIED", "PRODUCTION_WEBHOOKS_VERIFIED", "PRODUCTION_BACKUP_VERIFIED", "PRODUCTION_RESTORE_TESTED", "PRODUCTION_MONITORING_VERIFIED"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.match(check, new RegExp(key));
    // Perform the side effect or state update expressed on the following line.
    assert.match(checklist, new RegExp(key));
  }
});

// Perform the side effect or state update expressed on the following line.
test("runtime production readiness allows shared-host deployment before a custom domain is registered", () => {
  // Declare check for use by the surrounding module or function.
  const check = read("scripts/production-readiness-check.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(check, /const invalidPlatformHost = production && Boolean\(platformHost\)/);
  assert.doesNotMatch(check, /PLATFORM_HOST must be configured in production/);
});

// Perform the side effect or state update expressed on the following line.
test("Render health stays reachable before MongoDB startup and retries failed initialization", () => {
  // Declare app for use by the surrounding module or function.
  const app = read("app.js");
  // Declare server for use by the surrounding module or function.
  const server = read("server.js");
  // Declare database for use by the surrounding module or function.
  const database = read("config/database.js");
  // Declare render for use by the surrounding module or function.
  const render = read("../render.yaml");
  // Declare healthRoute for use by the surrounding module or function.
  const healthRoute = app.indexOf('app.get("/api/health"');
  // Declare tenantResolver for use by the surrounding module or function.
  const tenantResolver = app.indexOf("app.use(resolveTenant)");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(healthRoute >= 0 && tenantResolver > healthRoute, "health must bypass tenant/database middleware");
  // Perform the side effect or state update expressed on the following line.
  assert.match(app, /startup === "ready" && database === "connected"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(app, /app\.get\("\/api\/live"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(app, /app\.get\("\/api\/ready"/);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(server.indexOf('server.listen(env.PORT, "0.0.0.0"') < server.indexOf("void initializeDatabase()"), "HTTP must bind on Render's port and public interface before database startup work");
  // Perform the side effect or state update expressed on the following line.
  assert.match(server, /withTimeout\(migrateInvoiceIndexes, STARTUP_MIGRATION_TIMEOUT_MS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(server, /while \(!shuttingDown\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(server, /STARTUP_RETRY_MAX_MS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(server, /await operation\.catch\(\(\) => \{\}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(database, /serverSelectionTimeoutMS/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(render, /healthCheckPath:\s*\/api\/health/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(render, /MONGODB_SERVER_SELECTION_TIMEOUT_MS/);
  // Declare monitorCheck for use by the surrounding module or function.
  const monitorCheck = read("../scripts/check-production-api-health.sh");
  // Perform the side effect or state update expressed on the following line.
  assert.match(monitorCheck, /body\.get\("startup"\) in \{"starting", "failed"\}/,
    "monitoring must retry during the bounded startup-recovery backoff");
});

// Perform the side effect or state update expressed on the following line.
test("backup workflow validates a real isolated restore before encrypted artifact upload", () => {
  // Declare workflow for use by the surrounding module or function.
  const workflow = read("../.github/workflows/production-backup.yml");
  // Declare restore for use by the surrounding module or function.
  const restore = workflow.indexOf("mongorestore --host \"$container:27017\" --archive --gzip");
  // Declare dataValidation for use by the surrounding module or function.
  const dataValidation = workflow.indexOf("tenantReferenceOrphans");
  // Declare upload for use by the surrounding module or function.
  const upload = workflow.indexOf("Upload encrypted backup artifact");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(restore >= 0, "backup must restore into the disposable MongoDB server");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(workflow.includes("--dryRun"), false, "a dry run cannot satisfy restore verification");
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /sha256sum -c/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /mongosh[\s\S]*organizations[\s\S]*users[\s\S]*bookings[\s\S]*payments[\s\S]*invoices/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /docker logs --tail 100/);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(dataValidation > restore && upload > dataValidation, "upload must follow completed restore data checks");
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /backup\/\*\.archive\.gz\.enc/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(workflow, /backup\/\n\s*if-no-files-found/, "diagnostic and plaintext files must not be uploaded");
});

// Perform the side effect or state update expressed on the following line.
test("monitoring closes existing alerts after a complete recovery check", () => {
  // Declare workflow for use by the surrounding module or function.
  const workflow = read("../.github/workflows/production-monitoring.yml");
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /Close recovered production monitoring alert/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /github\.paginate\(github\.rest\.issues\.listForRepo/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /state: 'closed'/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /inputs\.simulate_failure != true/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /cancel-in-progress: false/,
    "a new scheduled run must not cancel an active failure check before alert delivery");
});

// Perform the side effect or state update expressed on the following line.
test("CI validates server, live tenant isolation, and client production build", () => {
  // Declare workflow for use by the surrounding module or function.
  const workflow = read("../.github/workflows/ci.yml");
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /npm run check:all/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /npm run check:multitenancy:live/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /server-live-isolation:[\s\S]*runs-on: ubuntu-22\.04/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /server-tour-lifecycle-integration:[\s\S]*runs-on: ubuntu-22\.04/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /LIFECYCLE_TEST_MONGODB_URI:[^\n]*hussein_mboya_ci_test/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /HEALTH_TEST_MONGODB_URI:[^\n]*global_tours_test/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /FIRST_TENANT_TEST_MONGODB_URI:[^\n]*global_tours_test\?replicaSet=rs0/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /Initialize disposable MongoDB replica set[\s\S]*docker run -d --name mongo-live-isolation-ci[^\n]*mongo:8 --replSet rs0/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /Initialize disposable MongoDB replica set[\s\S]*?rs\.initiate/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /node --test tests\/firstTenantAcceptance\.integration\.test\.js/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /MongoDB replica set did not become ready/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /LIFECYCLE_TEST_MONGODB_URI:[^\n]*hussein_mboya_ci_test\?replicaSet=rs0/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /npm run lint/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(workflow, /npm run build/);
});

// Perform the side effect or state update expressed on the following line.
test("MongoDB 8 backup and restore validation uses the compatible LTS runner", () => {
  // Repeat the enclosed work for each required iteration.
  for (const path of ["../.github/workflows/production-backup.yml", "../.github/workflows/production-restore-drill.yml"]) {
    // Declare workflow for use by the surrounding module or function.
    const workflow = read(path);
    // Perform the side effect or state update expressed on the following line.
    assert.match(workflow, /runs-on: ubuntu-22\.04/);
  }
});

// Perform the side effect or state update expressed on the following line.
test("hospitality booking mutations cannot directly set payment status", () => {
  // Declare hotel for use by the surrounding module or function.
  const hotel = read("controllers/hotelController.js");
  // Declare transfer for use by the surrounding module or function.
  const transfer = read("controllers/airportTransferController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(hotel, /booking\.paymentStatus\s*=/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(transfer, /booking\.paymentStatus\s*=/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(read("middleware/paymentMutationGuard.js"), /verified payment lifecycle/);
});

// Perform the side effect or state update expressed on the following line.
test("hospitality customer mutations are restricted to safe request fields", () => {
  // Declare hotel for use by the surrounding module or function.
  const hotel = read("controllers/hotelController.js");
  // Declare transfer for use by the surrounding module or function.
  const transfer = read("controllers/airportTransferController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(hotel, /Customers may only update special requests/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(transfer, /Customers may only update special requests/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(transfer, /Vehicle is already assigned to transfer/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(transfer, /Driver is already assigned to transfer/);
});

// Perform the side effect or state update expressed on the following line.
test("admin booking payment endpoint is read-only", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/bookingAdminController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /BOOKING_PAYMENT_STATUS_READ_ONLY/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /booking\.paymentStatus = status/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /Manual "paid" changes must also create/);
});

// Perform the side effect or state update expressed on the following line.
test("canonical booking status route cannot mutate payment status directly", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/bookingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /canTransitionBookingStatus/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /PAYMENT_REQUIRED_BEFORE_COMPLETION/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /if\s*\(req\.body\.paymentStatus\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /booking\.paymentStatus\s*=\s*req\.body\.paymentStatus/);
});

// Perform the side effect or state update expressed on the following line.
test("legacy admin booking payment endpoint is disabled", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/adminBookingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /BOOKING_PAYMENT_STATUS_READ_ONLY/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /booking\.paymentStatus\s*=\s*status/);
});

// Perform the side effect or state update expressed on the following line.
test("unsafe fallback examples default to disabled", () => {
  // Declare env for use by the surrounding module or function.
  const env = read(".env.example");
  // Perform the side effect or state update expressed on the following line.
  assert.match(env, /ALLOW_SINGLE_TENANT_DEV_FALLBACK=false/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(env, /ALLOW_GLOBAL_MPESA_FALLBACK=false/);
});

// Perform the side effect or state update expressed on the following line.
test("agent booking status updates enforce lifecycle and payment boundaries", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/agentBookingController.js");
  // Declare transitionGuard for use by the surrounding module or function.
  const transitionGuard = source.indexOf("if (!canTransitionBookingStatus(booking.status, status))");
  // Declare paymentGuard for use by the surrounding module or function.
  const paymentGuard = source.indexOf("PAYMENT_REQUIRED_BEFORE_COMPLETION", transitionGuard);
  // Declare statusMutation for use by the surrounding module or function.
  const statusMutation = source.indexOf("booking.status = status;", paymentGuard);
  // Perform the side effect or state update expressed on the following line.
  assert.ok(transitionGuard >= 0, "status transition authorization must be enforced");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(paymentGuard > transitionGuard, "payment authorization must follow the transition check");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(statusMutation > paymentGuard, "status cannot change before both guards pass");

  // Declare route for use by the surrounding module or function.
  const route = read("routes/agentBookingRoutes.js");
  // Declare tenantMiddleware for use by the surrounding module or function.
  const tenantMiddleware = route.indexOf("router.use(resolveTenant)");
  // Declare authentication for use by the surrounding module or function.
  const authentication = route.indexOf("router.use(protect)");
  // Declare agentAuthorization for use by the surrounding module or function.
  const agentAuthorization = route.indexOf("router.use(agentMiddleware)");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(tenantMiddleware >= 0 && authentication > tenantMiddleware && agentAuthorization > authentication,
    "agent status updates must resolve tenant, authenticate, and authorize the agent in order");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /Agent\.findOne\(\{\s*user: req\.user\._id,\s*\}\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /Booking\.findOne\(\{\s*_id: req\.params\.id,\s*agent: agentProfile\._id,/);
});

// Perform the side effect or state update expressed on the following line.
test("admin booking status updates enforce lifecycle and payment boundaries", () => {
  // Declare source for use by the surrounding module or function.
  const source = read("controllers/adminBookingController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /canTransitionBookingStatus/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(source, /PAYMENT_REQUIRED_BEFORE_COMPLETION/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(source, /findOneAndUpdate\([\s\S]*?\{ status \}/);
});

// Perform the side effect or state update expressed on the following line.
test("admin client cannot manually mutate booking payment status", () => {
  // Declare management for use by the surrounding module or function.
  const management = fs.readFileSync(path.join(root, "../client/src/pages/admin/BookingManagement.jsx"), "utf8");
  // Declare manage for use by the surrounding module or function.
  const manage = fs.readFileSync(path.join(root, "../client/src/pages/admin/ManageBookings.jsx"), "utf8");
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(management, /updateBookingPayment/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(management, /paymentMutation/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(manage, /updateBookingPayment/);
  // Perform the side effect or state update expressed on the following line.
  assert.doesNotMatch(manage, /paymentMutation/);
});

// Perform the side effect or state update expressed on the following line.
test("hospitality booking mutation controllers enforce authorized staff roles", () => {
  // Declare hotel for use by the surrounding module or function.
  const hotel = read("controllers/hotelController.js");
  // Declare transfer for use by the surrounding module or function.
  const transfer = read("controllers/airportTransferController.js");
  // Perform the side effect or state update expressed on the following line.
  assert.match(hotel, /Only authorized booking operations staff may modify this reservation/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(transfer, /Only authorized booking operations staff may modify this reservation/);
});
