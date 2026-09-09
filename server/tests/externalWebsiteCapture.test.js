import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (relative) => fs.readFileSync(path.join(here, "..", relative), "utf8");

const controller = read("controllers/integrationController.js");
const routes = read("routes/integrationRoutes.js");
const auth = read("middleware/integrationAuth.js");
const keyModel = read("models/WebsiteIntegrationKey.js");
const eventModel = read("models/WebsiteIntegrationEvent.js");
const docs = fs.readFileSync(path.join(here, "../../docs/EXTERNAL_WEBSITE_CONNECTOR.md"), "utf8");

test("browser connector exposes the public-key booking flow", () => {
  assert.match(routes, /requirePublicIntegrationKey/);
  assert.match(routes, /requireIntegrationPermission\("booking:create"\)/);
  assert.match(routes, /router\.post\("\/v1\/bookings"/);
  assert.match(controller, /X-Public-Integration-Key/);
  assert.match(controller, /data-hmt-booking-form/);
  assert.match(controller, /hmt:booking-created/);
  assert.match(controller, /hmt:booking-error/);
});

test("server-to-server booking flow uses secret API-key authentication", () => {
  assert.match(routes, /router\.post\("\/v1\/server\/bookings"/);
  assert.match(routes, /requireIntegrationKey/);
  assert.match(auth, /X-API-Key/);
  assert.match(auth, /keyHash: hashKey\(rawKey\)/);
  assert.match(auth, /runWithTenant\(\{ tenantId: key\.tenantId/);
});

test("integration keys enforce origin restrictions and support revocation", () => {
  assert.match(controller, /At least one allowed website origin is required for a live browser connector/);
  assert.match(auth, /allowedOrigins/);
  assert.match(auth, /publicRequest/);
  assert.match(auth, /A browser Origin is required for the public website connector/);
  assert.match(auth, /!allowed\.includes\(origin\)/);
  assert.match(auth, /website origin is not authorized/);
  assert.match(controller, /active:false/);
  assert.match(controller, /revokedAt:new Date\(\)/);
  assert.match(keyModel, /revokedAt/);
});

test("booking capture has server-side validation and pricing", () => {
  assert.match(controller, /tourId or tourSlug is required/);
  assert.match(controller, /Travel date cannot be in the past/);
  assert.match(controller, /validateTourCapacity/);
  assert.match(controller, /reserveSlots/);
  assert.match(controller, /calculateBookingAmounts/);
  assert.match(controller, /totalAmount:amounts\.totalAmount/);
  assert.match(controller, /Customer phone number is required/);
});

test("external booking retries are idempotent and audited", () => {
  assert.match(controller, /externalBookingId/);
  assert.match(controller, /booking\.duplicate/);
  assert.match(controller, /Booking already received/);
  assert.match(controller, /WebsiteIntegrationEvent\.create/);
  assert.match(eventModel, /tenantPlugin/);
  assert.match(eventModel, /booking\.created/);
  assert.match(eventModel, /booking\.rejected/);
});

test("connector excludes high-risk browser fields", () => {
  assert.match(controller, /password/);
  assert.match(controller, /card/);
  assert.match(controller, /cvv/);
  assert.match(controller, /cvc/);
  assert.match(controller, /authorization/);
  assert.match(docs, /Never place the `hmt_live_\.\.\.` secret API key in browser JavaScript/);
});

test("connector documentation covers authorized website integration", () => {
  assert.match(docs, /one-time integration/);
  assert.match(docs, /POST \/api\/integrations\/v1\/bookings/);
  assert.match(docs, /GET \/api\/integrations\/v1\/tours/);
  assert.match(docs, /Server-to-server/);
  assert.match(docs, /legal\/technical limitation/i);
});
