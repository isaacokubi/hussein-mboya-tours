# Customer booking reservation regression tests

**Classification: SOURCE-VERIFIED (test-scope).** The test file uses Node's built-in test runner and strict assertions against `createCustomerBookingWithReservations` with in-memory callback fakes.

The six tests establish that: (1) a capacity failure prevents credit and booking writes; (2) a conditional credit-limit miss releases prior capacity; (3) a rejected credit update releases capacity and preserves the update error; (4) booking insertion failure triggers both compensations; (5) a failed compensation is reported while the original booking error remains the thrown error; and (6) success retains both reservations and returns the created booking.

These unit tests verify control flow only. They do not test concurrent Mongo updates, controller validation, duplicate HTTP requests, persistence rollback, or process-crash recovery.
