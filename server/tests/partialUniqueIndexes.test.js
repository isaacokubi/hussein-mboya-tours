import assert from "node:assert/strict";
import test from "node:test";
import Booking from "../models/Booking.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";

test("partial unique indexes do not also request MongoDB sparse indexes", () => {
  for (const Model of [Booking, SubscriptionPayment]) {
    for (const [keys, options] of Model.schema.indexes()) {
      if (!options.partialFilterExpression) continue;
      assert.equal(options.sparse, undefined, `${Model.modelName} index ${options.name || JSON.stringify(keys)}`);
    }
  }
  const bookingIndex = Booking.schema.indexes().find(([, options]) => options.name === "tenantId_1_externalSource_1_externalBookingId_1");
  assert.ok(bookingIndex);
  assert.equal(bookingIndex[1].unique, true);
  assert.deepEqual(bookingIndex[1].partialFilterExpression, { externalBookingId: { $type: "string", $gt: "" } });
  const subscriptionPaymentIndex = SubscriptionPayment.schema.indexes().find(([, options]) => options.name === "provider_1_transactionReference_1");
  assert.ok(subscriptionPaymentIndex);
  assert.equal(subscriptionPaymentIndex[1].unique, true);
  assert.deepEqual(subscriptionPaymentIndex[1].partialFilterExpression, { transactionReference: { $type: "string", $gt: "" } });
});
