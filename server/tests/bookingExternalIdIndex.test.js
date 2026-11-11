/**
 * Purpose: booking External Id Index.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// Perform the side effect or state update expressed on the following line.
test("booking external-id index uses a valid partial unique index", () => {
  // Declare index for use by the surrounding module or function.
  const index = Booking.schema.indexes().find(([, options]) => options.name === "tenantId_1_externalSource_1_externalBookingId_1");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(index, "the tenant-scoped external booking identifier index is declared");
  // Perform the side effect or state update expressed on the following line.
  assert.equal(index[1].unique, true);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(index[1].sparse, undefined, "MongoDB cannot combine sparse and partial index options");
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(index[1].partialFilterExpression, { externalBookingId: { $type: "string", $gt: "" } });
});
