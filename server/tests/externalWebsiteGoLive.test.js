/**
 * Purpose: external Website Go Live.test automated test. Main declarations: read.
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
// Declare docs for use by the surrounding module or function.
const docs = fs.readFileSync(path.join(here, "../../docs/EXTERNAL_WEBSITE_CONNECTOR_GO_LIVE.md"), "utf8");
// Declare settings for use by the surrounding module or function.
const settings = fs.readFileSync(path.join(here, "../../client/src/pages/admin/AdminSettings.jsx"), "utf8");

// Perform the side effect or state update expressed on the following line.
test("website onboarding and browser connector are exposed", () => {
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/keys/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/v1\/config/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/v1\/tours/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/v1\/widget\.js/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(routes, /\/v1\/bookings/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /hmt_site_/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /hmt_live_/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(settings, /Existing website.*automatic booking capture/s);
});

// Perform the side effect or state update expressed on the following line.
test("automatic capture maps common website booking fields", () => {
  // Repeat the enclosed work for each required iteration.
  for (const field of ["firstName", "lastName", "email", "phone", "travelDate", "numberOfGuests", "pickupLocation", "hotelName", "roomNumber"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.match(controller, new RegExp(field));
  }
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /data-hmt-booking-form/);
});

// Perform the side effect or state update expressed on the following line.
test("catalogue, customer, booking and operations hand-off are documented", () => {
  // Repeat the enclosed work for each required iteration.
  for (const phrase of ["GET /api/integrations/v1/tours", "customer:create", "POST /api/integrations/v1/bookings", "booking.created", "M-Pesa", "eTIMS"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.match(docs, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

// Perform the side effect or state update expressed on the following line.
test("security and idempotency requirements are documented", () => {
  // Repeat the enclosed work for each required iteration.
  for (const phrase of ["Secret API keys must never", "externalBookingId", "rate-limited", "passwords", "card data", "Revocation"]) {
    // Perform the side effect or state update expressed on the following line.
    assert.match(docs, new RegExp(phrase, "i"));
  }
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /Booking already received/);
  // Perform the side effect or state update expressed on the following line.
  assert.match(controller, /WebsiteIntegrationEvent\.create/);
});
