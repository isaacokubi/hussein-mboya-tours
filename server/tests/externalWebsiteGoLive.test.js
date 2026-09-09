import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (relative) => fs.readFileSync(path.join(here, "..", relative), "utf8");
const controller = read("controllers/integrationController.js");
const routes = read("routes/integrationRoutes.js");
const docs = fs.readFileSync(path.join(here, "../../docs/EXTERNAL_WEBSITE_CONNECTOR_GO_LIVE.md"), "utf8");
const settings = fs.readFileSync(path.join(here, "../../client/src/pages/admin/AdminSettings.jsx"), "utf8");

test("website onboarding and browser connector are exposed", () => {
  assert.match(routes, /\/keys/);
  assert.match(routes, /\/v1\/config/);
  assert.match(routes, /\/v1\/tours/);
  assert.match(routes, /\/v1\/widget\.js/);
  assert.match(routes, /\/v1\/bookings/);
  assert.match(controller, /hmt_site_/);
  assert.match(controller, /hmt_live_/);
  assert.match(settings, /Existing website.*automatic booking capture/s);
});

test("automatic capture maps common website booking fields", () => {
  for (const field of ["firstName", "lastName", "email", "phone", "travelDate", "numberOfGuests", "pickupLocation", "hotelName", "roomNumber"]) {
    assert.match(controller, new RegExp(field));
  }
  assert.match(controller, /data-hmt-booking-form/);
});

test("catalogue, customer, booking and operations hand-off are documented", () => {
  for (const phrase of ["GET /api/integrations/v1/tours", "customer:create", "POST /api/integrations/v1/bookings", "booking.created", "M-Pesa", "eTIMS"]) {
    assert.match(docs, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("security and idempotency requirements are documented", () => {
  for (const phrase of ["Secret API keys must never", "externalBookingId", "rate-limited", "passwords", "card data", "Revocation"]) {
    assert.match(docs, new RegExp(phrase, "i"));
  }
  assert.match(controller, /Booking already received/);
  assert.match(controller, /WebsiteIntegrationEvent\.create/);
});
