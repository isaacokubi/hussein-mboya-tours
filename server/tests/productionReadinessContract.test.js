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

test("runtime production readiness requires a platform host for tenant URLs", () => {
  const check = read("scripts/production-readiness-check.js");
  assert.match(check, /const missingPlatformHost = production && !platformHost/);
  assert.match(check, /PLATFORM_HOST must be configured in production for tenant subdomain resolution/);
});

test("Render health stays reachable before MongoDB startup and retries failed initialization", () => {
  const app = read("app.js");
  const server = read("server.js");
  const database = read("config/database.js");
  const render = read("../render.yaml");
  const healthRoute = app.indexOf('app.get("/api/health"');
  const tenantResolver = app.indexOf("app.use(resolveTenant)");
  assert.ok(healthRoute >= 0 && tenantResolver > healthRoute, "health must bypass tenant/database middleware");
  assert.match(app, /startup === "ready" && database === "connected"/);
  assert.match(app, /app\.get\("\/api\/live"/);
  assert.match(app, /app\.get\("\/api\/ready"/);
  assert.ok(server.indexOf('server.listen(env.PORT, "0.0.0.0"') < server.indexOf("void initializeDatabase()"), "HTTP must bind on Render's port and public interface before database startup work");
  assert.match(server, /withTimeout\(migrateInvoiceIndexes, STARTUP_MIGRATION_TIMEOUT_MS/);
  assert.match(server, /while \(!shuttingDown\)/);
  assert.match(server, /STARTUP_RETRY_MAX_MS/);
  assert.match(server, /await operation\.catch\(\(\) => \{\}\)/);
  assert.match(database, /serverSelectionTimeoutMS/);
  assert.match(render, /healthCheckPath:\s*\/api\/health/);
  assert.match(render, /MONGODB_SERVER_SELECTION_TIMEOUT_MS/);
  const monitorCheck = read("../scripts/check-production-api-health.sh");
  assert.match(monitorCheck, /body\.get\("startup"\) in \{"starting", "failed"\}/,
    "monitoring must retry during the bounded startup-recovery backoff");
});

test("backup workflow validates a real isolated restore before encrypted artifact upload", () => {
  const workflow = read("../.github/workflows/production-backup.yml");
  const restore = workflow.indexOf("mongorestore --host \"$container:27017\" --archive --gzip");
  const dataValidation = workflow.indexOf("tenantReferenceOrphans");
  const upload = workflow.indexOf("Upload encrypted backup artifact");
  assert.ok(restore >= 0, "backup must restore into the disposable MongoDB server");
  assert.equal(workflow.includes("--dryRun"), false, "a dry run cannot satisfy restore verification");
  assert.match(workflow, /sha256sum -c/);
  assert.match(workflow, /mongosh[\s\S]*organizations[\s\S]*users[\s\S]*bookings[\s\S]*payments[\s\S]*invoices/);
  assert.match(workflow, /docker logs --tail 100/);
  assert.ok(dataValidation > restore && upload > dataValidation, "upload must follow completed restore data checks");
  assert.match(workflow, /backup\/\*\.archive\.gz\.enc/);
  assert.doesNotMatch(workflow, /backup\/\n\s*if-no-files-found/, "diagnostic and plaintext files must not be uploaded");
});

test("monitoring closes existing alerts after a complete recovery check", () => {
  const workflow = read("../.github/workflows/production-monitoring.yml");
  assert.match(workflow, /Close recovered production monitoring alert/);
  assert.match(workflow, /github\.paginate\(github\.rest\.issues\.listForRepo/);
  assert.match(workflow, /state: 'closed'/);
  assert.match(workflow, /inputs\.simulate_failure != true/);
  assert.match(workflow, /cancel-in-progress: false/,
    "a new scheduled run must not cancel an active failure check before alert delivery");
});

test("CI validates server, live tenant isolation, and client production build", () => {
  const workflow = read("../.github/workflows/ci.yml");
  assert.match(workflow, /npm run check:all/);
  assert.match(workflow, /npm run check:multitenancy:live/);
  assert.match(workflow, /server-live-isolation:[\s\S]*runs-on: ubuntu-22\.04/);
  assert.match(workflow, /server-tour-lifecycle-integration:[\s\S]*runs-on: ubuntu-22\.04/);
  assert.match(workflow, /LIFECYCLE_TEST_MONGODB_URI:[^\n]*hussein_mboya_ci_test/);
  assert.match(workflow, /HEALTH_TEST_MONGODB_URI:[^\n]*global_tours_test/);
  assert.match(workflow, /FIRST_TENANT_TEST_MONGODB_URI:[^\n]*global_tours_test\?replicaSet=rs0/);
  assert.match(workflow, /Initialize disposable MongoDB replica set[\s\S]*docker run -d --name mongo-live-isolation-ci[^\n]*mongo:8 --replSet rs0/);
  assert.match(workflow, /Initialize disposable MongoDB replica set[\s\S]*?rs\.initiate/);
  assert.match(workflow, /node --test tests\/firstTenantAcceptance\.integration\.test\.js/);
  assert.match(workflow, /MongoDB replica set did not become ready/);
  assert.match(workflow, /LIFECYCLE_TEST_MONGODB_URI:[^\n]*hussein_mboya_ci_test\?replicaSet=rs0/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
});

test("MongoDB 8 backup and restore validation uses the compatible LTS runner", () => {
  for (const path of ["../.github/workflows/production-backup.yml", "../.github/workflows/production-restore-drill.yml"]) {
    const workflow = read(path);
    assert.match(workflow, /runs-on: ubuntu-22\.04/);
  }
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
  const transitionGuard = source.indexOf("if (!canTransitionBookingStatus(booking.status, status))");
  const paymentGuard = source.indexOf("PAYMENT_REQUIRED_BEFORE_COMPLETION", transitionGuard);
  const statusMutation = source.indexOf("booking.status = status;", paymentGuard);
  assert.ok(transitionGuard >= 0, "status transition authorization must be enforced");
  assert.ok(paymentGuard > transitionGuard, "payment authorization must follow the transition check");
  assert.ok(statusMutation > paymentGuard, "status cannot change before both guards pass");

  const route = read("routes/agentBookingRoutes.js");
  const tenantMiddleware = route.indexOf("router.use(resolveTenant)");
  const authentication = route.indexOf("router.use(protect)");
  const agentAuthorization = route.indexOf("router.use(agentMiddleware)");
  assert.ok(tenantMiddleware >= 0 && authentication > tenantMiddleware && agentAuthorization > authentication,
    "agent status updates must resolve tenant, authenticate, and authorize the agent in order");
  assert.match(source, /Agent\.findOne\(\{\s*user: req\.user\._id,\s*\}\)/);
  assert.match(source, /Booking\.findOne\(\{\s*_id: req\.params\.id,\s*agent: agentProfile\._id,/);
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
