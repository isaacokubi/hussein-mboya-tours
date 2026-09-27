import assert from "node:assert/strict";
import test from "node:test";
import Booking from "../models/Booking.js";

test("booking external-id index uses a valid partial unique index", () => {
  const index = Booking.schema.indexes().find(([, options]) => options.name === "tenantId_1_externalSource_1_externalBookingId_1");
  assert.ok(index, "the tenant-scoped external booking identifier index is declared");
  assert.equal(index[1].unique, true);
  assert.equal(index[1].sparse, undefined, "MongoDB cannot combine sparse and partial index options");
  assert.deepEqual(index[1].partialFilterExpression, { externalBookingId: { $type: "string", $gt: "" } });
});
