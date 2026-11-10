# Source explanation: server/tests/productionReadinessContract.test.js

**Source:** [server/tests/productionReadinessContract.test.js](../../../server/tests/productionReadinessContract.test.js)

## Purpose

A Node test module. Its assertions prove only the cases and environment configured by the test; inspect mocks and setup before generalizing.

## Imports and dependencies

- `assert` from `node:assert/strict`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `test` from `node:test`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `read` — lines 7–7

Parameters: `file`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 6: `const root = path.resolve(process.cwd());`.
- Line 7: `const read = (file) => fs.readFileSync(path.join(root, file), "utf8");`.
- Line 10: `const check = read("scripts/production-readiness-check.js");`.
- Line 17: `const middleware = read("middleware/planFeatureMiddleware.js");`.
- Line 18: `const service = read("services/tenantSubscriptionService.js");`.
- Line 28: `const check = read("scripts/production-readiness-check.js");`.
- Line 29: `const checklist = read("../docs/PRODUCTION_GO_LIVE_CHECKLIST.md");`.
- Line 37: `const check = read("scripts/production-readiness-check.js");`.
- Line 43: `const app = read("app.js");`.
- Line 44: `const server = read("server.js");`.
- Line 45: `const database = read("config/database.js");`.
- Line 46: `const render = read("../render.yaml");`.
- Line 47: `const healthRoute = app.indexOf('app.get("/api/health"');`.
- Line 48: `const tenantResolver = app.indexOf("app.use(resolveTenant)");`.
- Line 61: `const monitorCheck = read("../scripts/check-production-api-health.sh");`.
- Line 67: `const workflow = read("../.github/workflows/production-backup.yml");`.
- Line 68: `const restore = workflow.indexOf("mongorestore --host \"$container:27017\" --archive --gzip");`.
- Line 69: `const dataValidation = workflow.indexOf("tenantReferenceOrphans");`.
- Line 70: `const upload = workflow.indexOf("Upload encrypted backup artifact");`.
- Line 82: `const workflow = read("../.github/workflows/production-monitoring.yml");`.
- Line 92: `const workflow = read("../.github/workflows/ci.yml");`.
- Line 111: `const workflow = read(path);`.
- Line 117: `const hotel = read("controllers/hotelController.js");`.
- Line 118: `const transfer = read("controllers/airportTransferController.js");`.
- Line 125: `const hotel = read("controllers/hotelController.js");`.
- Line 126: `const transfer = read("controllers/airportTransferController.js");`.
- Line 134: `const source = read("controllers/bookingAdminController.js");`.
- Line 141: `const source = read("controllers/bookingController.js");`.
- Line 149: `const source = read("controllers/adminBookingController.js");`.
- Line 155: `const env = read(".env.example");`.
- Line 161: `const source = read("controllers/agentBookingController.js");`.
- Line 162: `const transitionGuard = source.indexOf("if (!canTransitionBookingStatus(booking.status, status))");`.
- Line 163: `const paymentGuard = source.indexOf("PAYMENT_REQUIRED_BEFORE_COMPLETION", transitionGuard);`.
- Line 164: `const statusMutation = source.indexOf("booking.status = status;", paymentGuard);`.
- Line 169: `const route = read("routes/agentBookingRoutes.js");`.
- Line 170: `const tenantMiddleware = route.indexOf("router.use(resolveTenant)");`.
- Line 171: `const authentication = route.indexOf("router.use(protect)");`.
- Line 172: `const agentAuthorization = route.indexOf("router.use(agentMiddleware)");`.
- Line 180: `const source = read("controllers/adminBookingController.js");`.
- Line 187: `const management = fs.readFileSync(path.join(root, "../client/src/pages/admin/BookingManagement.jsx"), "utf8");`.
- Line 188: `const manage = fs.readFileSync(path.join(root, "../client/src/pages/admin/ManageBookings.jsx"), "utf8");`.
- Line 196: `const hotel = read("controllers/hotelController.js");`.
- Line 197: `const transfer = read("controllers/airportTransferController.js");`.

## Security, errors and performance checkpoints

- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
