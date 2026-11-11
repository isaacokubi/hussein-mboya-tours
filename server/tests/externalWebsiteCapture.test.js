/**
 * Purpose: external Website Capture.test automated test. Main declarations: read.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import test from "node:test";
// Load node:assert/strict so this module can use its exported dependencies.
import assert from "node:assert/strict";
// Load node:fs so this module can use its exported dependencies.
import fs from "node:fs";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";

// Declare here for use by the surrounding module or function.
const here = path.dirname(fileURLToPath(import.meta.url));
// Declare read for use by the surrounding module or function.
const read = (relative) => fs.readFileSync(path.join(here, "..", relative), "utf8");

// Declare controller for use by the surrounding module or function.
const controller = read("controllers/integrationController.js");
// Declare routes for use by the surrounding module or function.
const routes = read("routes/integrationRoutes.js");
// Declare auth for use by the surrounding module or function.
const auth = read("middleware/integrationAuth.js");
// Declare keyModel for use by the surrounding module or function.
const keyModel = read("models/WebsiteIntegrationKey.js");
// Declare eventModel for use by the surrounding module or function.
const eventModel = read("models/WebsiteIntegrationEvent.js");
// Declare docs for use by the surrounding module or function.
const docs = fs.readFileSync(path.join(here, "../../docs/EXTERNAL_WEBSITE_CONNECTOR.md"), "utf8");

// Perform the side effect or state update expressed on the following line.
test("browser connector exposes the public-key booking flow", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /requirePublicIntegrationKey/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /requireIntegrationPermission\("booking:create"\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.post\("\/v1\/bookings"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /X-Public-Integration-Key/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /data-hmt-booking-form/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /hmt:booking-created/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /hmt:booking-error/);
});

// Perform the side effect or state update expressed on the following line.
test("server-to-server booking flow uses secret API-key authentication", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /router\.post\("\/v1\/server\/bookings"/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /requireIntegrationKey/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /X-API-Key/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /keyHash: hashKey\(rawKey\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /tenantId: key\.tenantId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /runWithTenant\(/);
});

// Perform the side effect or state update expressed on the following line.
test("integration keys enforce origin restrictions and support revocation", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /At least one allowed website origin is required for a live browser connector/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /allowedOrigins/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /publicRequest/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /A browser Origin is required for the public website connector/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /!allowed\.includes\(origin\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(auth, /website origin is not authorized/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /active:false/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /revokedAt:new Date\(\)/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(keyModel, /revokedAt/);
});

// Perform the side effect or state update expressed on the following line.
test("booking capture has server-side validation and pricing", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /tourId or tourSlug is required/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Travel date cannot be in the past/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /validateTourCapacity/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /reserveSlots/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /calculateBookingAmounts/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /totalAmount:amounts\.totalAmount/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Customer phone number is required/);
});

// Perform the side effect or state update expressed on the following line.
test("invalid external bookings validate customer contact before reserving inventory", () => {
  // Declare phoneValidation for use by the surrounding module or function.
  const phoneValidation = controller.indexOf('if(!ph)return res.status(400).json({success:false,message:"Customer phone number is required."})');
  // Declare reservation for use by the surrounding module or function.
  const reservation = controller.indexOf('await reserveSlots(tourId,count)');
  // Perform the side effect or state update expressed on the following line.
  assert.notEqual(phoneValidation, -1, "customer phone validation must remain explicit");
  // Perform the side effect or state update expressed on the following line.
  assert.notEqual(reservation, -1, "inventory reservation must remain explicit");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(phoneValidation < reservation, "customer validation must happen before inventory reservation");
});

// Perform the side effect or state update expressed on the following line.
test("external booking retries are idempotent and audited", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /externalBookingId/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /booking\.duplicate/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Booking already received/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /WebsiteIntegrationEvent\.create/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(eventModel, /tenantPlugin/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(eventModel, /booking\.created/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(eventModel, /booking\.rejected/);
});

// Perform the side effect or state update expressed on the following line.
test("connector excludes high-risk browser fields", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /password/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /card/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /cvv/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /cvc/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /authorization/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /Never place the `hmt_live_\.\.\.` secret API key in browser JavaScript/);
});

// Perform the side effect or state update expressed on the following line.
test("connector documentation covers authorized website integration", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /one-time integration/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /POST \/api\/integrations\/v1\/bookings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /GET \/api\/integrations\/v1\/tours/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /Server-to-server/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(docs, /legal\/technical limitation/i);
});
