# Source explanation: server/scripts/reconcileDemoSeedData.js

**Source:** [server/scripts/reconcileDemoSeedData.js](../../../server/scripts/reconcileDemoSeedData.js)

## Purpose

An operational script for checks, repair, migration, or data setup; it is not part of ordinary request handling.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `assertTarget` — lines 8–19

Parameters: none.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 9:** `if (process.env.CONFIRM_DEMO_DATA_REPAIR !== "YES") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 10:** `throw new Error("Set CONFIRM_DEMO_DATA_REPAIR=YES to repair the verified synthetic demo records.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 12:** `const rawUri = String(process.env.MONGODB_URI || "");` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 13:** `if (!rawUri) throw new Error("MONGODB_URI is required.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 14:** `const target = new URL(rawUri);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 15:** `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 16:** `if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 17:** `throw new Error(\`Refusing repair outside ${EXPECTED_DATABASE} on the configured demo Atlas cluster.\`);` — Stops the current operation with an error; callers or Express error handling determine the response.

### `id` — lines 21–21

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `round` — lines 22–22

Parameters: `value`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `netPaid` — lines 25–30

Parameters: `payments`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 26:** `return round(payments.reduce((sum, payment) => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 27:** `if (!["completed", "refunded"].includes(payment.status)) return sum;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 28:** `return sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `paymentState` — lines 32–40

Parameters: `booking`, `payments`, `amountPaid`.
5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 33:** `if (booking.status === "refunded" || payments.some((payment) =>` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 35:** `if (amountPaid >= Number(booking.totalAmount || 0) && amountPaid > 0) return "paid";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 36:** `if (amountPaid > 0) return "partial";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 37:** `if (booking.status === "cancelled") return "cancelled";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 38:** `if (payments.some((payment) => payment.status === "failed")) return "failed";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 39:** `return "pending";` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `main` — lines 42–272

Parameters: none.
18 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 33 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 44:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 45:** `const db = mongoose.connection.db;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const tenants = await db.collection("organizations")` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 47:** `.find({ slug: { $in: TENANT_SLUGS } }, { projection: { _id: 1, slug: 1 } }).toArray();` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 48:** `if (tenants.length !== TENANT_SLUGS.length) throw new Error("Expected exactly the three known demo tenants; no records were changed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 50:** `const summary = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `for (const tenant of tenants) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 52:** `const scope = { tenantId: tenant._id };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 53:** `const [bookings, payments, reviews, tours, destinations, customers, vehicles, quotations] = await Promise.all([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 54:** `db.collection("bookings").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 55:** `db.collection("payments").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 56:** `db.collection("reviews").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 57:** `db.collection("tours").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 58:** `db.collection("destinations").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 59:** `db.collection("customers").find(scope).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 60:** `db.collection("vehicles").find({ ...scope, isDeleted: { $ne: true } }).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 61:** `db.collection("quotations").find({ ...scope, status: "converted", isDeleted: { $ne: true } }).toArray(),` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 63:** `if (bookings.length !== 12 || tours.length !== 12 || destinations.length !== 12 || customers.length !== 4` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `available` — lines 85–85

Parameters: `booking`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 4: `const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";`.
- Line 5: `const EXPECTED_DATABASE = "husseindb";`.
- Line 6: `const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];`.
- Line 8: `function assertTarget() {`.
- Line 12: `const rawUri = String(process.env.MONGODB_URI || "");`.
- Line 14: `const target = new URL(rawUri);`.
- Line 15: `const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");`.
- Line 21: `const id = (value) => String(value || "");`.
- Line 22: `const round = (value) => Math.round(Number(value || 0) * 100) / 100;`.
- Line 23: `const DAY_MS = 24 * 60 * 60 * 1000;`.
- Line 25: `function netPaid(payments) {`.
- Line 32: `function paymentState(booking, payments, amountPaid) {`.
- Line 45: `const db = mongoose.connection.db;`.
- Line 46: `const tenants = await db.collection("organizations")`.
- Line 50: `const summary = [];`.
- Line 52: `const scope = { tenantId: tenant._id };`.
- Line 53: `const [bookings, payments, reviews, tours, destinations, customers, vehicles, quotations] = await Promise.all([`.
- Line 67: `const bookingIds = new Set(bookings.map((booking) => id(booking._id)));`.
- Line 68: `const customerById = new Map(customers.map((customer) => [id(customer._id), customer]));`.
- Line 69: `const vehicleByTour = new Map(vehicles.filter((vehicle) => vehicle.assignedTour)`.
- Line 71: `const tourById = new Map(tours.map((tour) => [id(tour._id), tour]));`.
- Line 72: `const paymentsByBooking = new Map();`.
- Line 76: `const list = paymentsByBooking.get(id(payment.booking)) || [];`.
- Line 80: `const eligibleBookings = bookings.filter((booking) => booking.status === "completed");`.
- Line 82: `const assignedReviews = new Set();`.
- Line 83: `const reviewTargets = [];`.
- Line 85: `const available = (booking) => !assignedReviews.has(id(booking._id));`.
- Line 86: `const target = eligibleBookings.find((booking) => available(booking)`.
- Line 98: `const bookingPayments = paymentsByBooking.get(id(booking._id)) || [];`.
- Line 99: `const amountPaid = Math.min(Number(booking.totalAmount || 0), netPaid(bookingPayments));`.
- Line 100: `const nextState = paymentState(booking, bookingPayments, amountPaid);`.
- Line 101: `const assignedVehicle = vehicleByTour.get(id(booking.tour));`.
- Line 102: `const bookingTour = tourById.get(id(booking.tour));`.
- Line 103: `const durationDays = Math.max(1, Number(bookingTour?.durationDetails?.days || bookingTour?.durationDays || 1));`.
- Line 104: `let travelDate = booking.travelDate ? new Date(booking.travelDate) : new Date();`.
- Line 105: `let completedAt = booking.completedAt || null;`.
- Line 106: `const now = new Date();`.
- Line 121: `const pickupTime = new Date(travelDate.getTime() + 8 * 60 * 60 * 1000);`.
- Line 137: `const customerUserId = booking.user || customerById.get(id(booking.customer))?.user;`.
- Line 143: `const invoice = await db.collection("invoices").findOne({ ...scope, booking: booking._id });`.
- Line 151: `const bookingById = new Map(bookings.map((booking) => [id(booking._id), booking]));`.
- Line 153: `const booking = bookingById.get(id(reservation.linkedBooking));`.
- Line 155: `const tripDays = Math.max(1, Number(tourById.get(id(booking.tour))?.durationDetails?.days || 1));`.
- Line 162: `const booking = bookingById.get(id(reservation.linkedBooking));`.
- Line 170: `const booking = bookings.find((row) => id(row.customer) === id(quote.customer)`.
- Line 176: `const total = Number(booking.totalAmount || 0);`.
- Line 177: `const quantity = Math.max(1, Number(booking.numberOfGuests || 1));`.
- Line 201: `const customerBookings = bookings.filter((booking) => id(booking.customer) === id(customer._id));`.
- Line 202: `const totalSpent = round(customerBookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0));`.
- Line 203: `const dates = customerBookings.map((booking) => booking.createdAt).filter(Boolean).sort((a, b) => b - a);`.
- Line 223: `const freshReviews = await db.collection("reviews").find({ ...scope, approved: true }).toArray();`.
- Line 224: `const freshBookings = await db.collection("bookings").find(scope).toArray();`.
- Line 225: `const reviewsByTour = new Map();`.
- Line 227: `const row = reviewsByTour.get(id(review.tour)) || { count: 0, ratingTotal: 0 };`.
- Line 232: `const bookingsByTour = new Map();`.
- Line 234: `const row = bookingsByTour.get(id(booking.tour)) || { total: 0, guests: 0 };`.
- Line 239: `const destinationStats = new Map();`.
- Line 241: `const key = id(tour.destination);`.
- Line 242: `const reviewStats = reviewsByTour.get(id(tour._id)) || { count: 0, ratingTotal: 0 };`.
- Line 243: `const bookingStats = bookingsByTour.get(id(tour._id)) || { total: 0, guests: 0 };`.
- Line 244: `const assignedVehicle = vehicleByTour.get(id(tour._id));`.
- Line 245: `const destination = destinationStats.get(key) || { totalTours: 0, totalBookings: 0, totalReviews: 0, ratingTotal: 0 };`.
- Line 251: `const availability = (tour.availability || []).map((slot) => ({ ...slot, bookedSlots: bookingStats.guests }));`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
