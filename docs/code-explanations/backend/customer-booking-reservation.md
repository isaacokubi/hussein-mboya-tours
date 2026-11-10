# Customer booking reservation helper

**Classification: SOURCE-VERIFIED (scoped).** This explanation covers the reservation ordering and compensation path implemented in `server/services/customerBookingReservation.js`.

`createCustomerBookingWithReservations` receives database operations as callbacks so its ordering can be tested without a MongoDB connection. It first reserves tour capacity. Only after that succeeds does it conditionally reserve corporate credit. It then invokes booking creation and returns its result.

If a later operation fails, it attempts to release capacity and, if the credit claim completed, release corporate credit. Compensation errors are passed to `onCompensationError`; they do not replace the original operation error. A rejected capacity reservation does not trigger a release because no successful reservation was recorded.

This is compensating logic across separate writes, not a MongoDB transaction. Process termination or a compensation write failure can leave partial state. The helper also does not provide an idempotency key, so duplicate requests and cross-operation concurrency still require safeguards in the controller/database operations. The corporate credit callback must use an atomic conditional update, and capacity reservation must itself be atomic to close races.

The controller supplies the callbacks and logs compensation failures. Regression tests in `server/tests/customerBookingReservation.test.js` verify callback order and failure behavior; they do not exercise MongoDB atomicity or HTTP response behavior.
