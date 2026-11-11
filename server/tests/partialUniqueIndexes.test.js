/**
 * Purpose: partial Unique Indexes.test automated test. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import assert from "node:assert/strict";
// Load node:test so this module can use its exported dependencies.
import test from "node:test";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";

// Perform the side effect or state update expressed on the following line.
test("partial unique indexes do not also request MongoDB sparse indexes", () => {
  // Repeat the enclosed work for each required iteration.
  for (const Model of [Booking, SubscriptionPayment]) {
    // Repeat the enclosed work for each required iteration.
    for (const [keys, options] of Model.schema.indexes()) {
      // Check the condition (!options.partialFilterExpression) and run the matching branch.
      if (!options.partialFilterExpression) continue;
      // Perform the side effect or state update expressed on the following line.
      assert.equal(options.sparse, undefined, `${Model.modelName} index ${options.name || JSON.stringify(keys)}`);
    }
  }
  // Declare bookingIndex for use by the surrounding module or function.
  const bookingIndex = Booking.schema.indexes().find(([, options]) => options.name === "tenantId_1_externalSource_1_externalBookingId_1");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(bookingIndex);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(bookingIndex[1].unique, true);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(bookingIndex[1].partialFilterExpression, { externalBookingId: { $type: "string", $gt: "" } });
  // Declare subscriptionPaymentIndex for use by the surrounding module or function.
  const subscriptionPaymentIndex = SubscriptionPayment.schema.indexes().find(([, options]) => options.name === "provider_1_transactionReference_1");
  // Perform the side effect or state update expressed on the following line.
  assert.ok(subscriptionPaymentIndex);
  // Perform the side effect or state update expressed on the following line.
  assert.equal(subscriptionPaymentIndex[1].unique, true);
  // Perform the side effect or state update expressed on the following line.
  assert.deepEqual(subscriptionPaymentIndex[1].partialFilterExpression, { transactionReference: { $type: "string", $gt: "" } });
});
