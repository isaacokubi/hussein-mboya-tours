# Source explanation: server/controllers/bookingController.js

**Source:** [server/controllers/bookingController.js](../../../server/controllers/bookingController.js)

## Purpose

An HTTP controller module. Route modules pass Express request/response objects into exported handlers; handlers coordinate validation, services/models and JSON response branches.

## Imports and dependencies

- `mergeTenantFilter`, `requireTenantId` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getSystemSettings` from `../services/settingsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/settingsService.js](../../../server/services/settingsService.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `sendSMS` from `../services/smsService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/smsService.js](../../../server/services/smsService.js)
- `sendWhatsApp` from `../services/whatsappService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/whatsappService.js](../../../server/services/whatsappService.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)
- `reserveSlots`, `validateTourCapacity`, `releaseSlots` from `../services/inventoryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/inventoryService.js](../../../server/services/inventoryService.js)
- `BOOKING_PAYMENT_STATUSES`, `BOOKING_STATUSES`, `PAYMENT_METHODS`, `canTransitionBookingStatus`, `isValidBookingStatus` from `../constants/bookingConstants.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/constants/bookingConstants.js](../../../server/constants/bookingConstants.js)
- `calculateBookingAmounts` from `../utils/bookingPricing.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/bookingPricing.js](../../../server/utils/bookingPricing.js)
- `calculateTax` from `../services/taxEngineService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/taxEngineService.js](../../../server/services/taxEngineService.js)
- `createBookingAtomically` from `../services/bookingCreationService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/bookingCreationService.js](../../../server/services/bookingCreationService.js)
- `queueWebhookEvent` from `../services/webhookDeliveryService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/webhookDeliveryService.js](../../../server/services/webhookDeliveryService.js)
- `sendBookingConfirmationEmail`, `sendEmailBestEffort` from `../services/emailService.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/services/emailService.js](../../../server/services/emailService.js)
- `successResponse` from `../utils/apiResponse.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/apiResponse.js](../../../server/utils/apiResponse.js)

## Runtime declarations and data flow

### `createBooking` — lines 46–312

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.user, req.tenantId. Persistent operations detected: Tour.findOne, CustomTourRequest.findOne, Customer.findOne, Notification.create; verify tenant/ownership filters in the exact query. 10 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 18 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 49:** `const settings = await getSystemSettings();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 50:** `const companyName = settings.companyName || "Company";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 51:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 53:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 70:** `const totalTravellers =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `let tourData = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `if (tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 79:** `tourData = await Tour.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 87:** `let customTourData = null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 89:** `if (customTourRequest) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 90:** `customTourData = await CustomTourRequest.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 97:** `if (!customTourData) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 98:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 104:** `if (!["approved", "quoted"].includes(customTourData.status)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 105:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 111:** `if (!Number.isFinite(Number(customTourData.quotedAmount)) || Number(customTourData.quotedAmount) <= 0) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 112:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 120:** `if (!tourData && !customTourData) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getMyBookings` — lines 322–403

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query, req.user. Persistent operations detected: Customer.findOne, Booking.countDocuments, Booking.find; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 323:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 325:** `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 328:** `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 331:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 335:** `const customerProfile = await Customer.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 343:** `const ownershipFilters = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 347:** `if (customerProfile?._id) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 353:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 358:** `const total =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 359:** `await Booking.countDocuments(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 363:** `const bookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 364:** `await Booking.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 384:** `return successResponse(` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getAllBookings` — lines 413–557

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.countDocuments, Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 415:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 418:** `const {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 425:** `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 428:** `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 431:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 435:** `const filter={};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 439:** `if(status){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 445:** `if(paymentStatus){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 451:** `if(search){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 484:** `const total =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 485:** `await Booking.countDocuments(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 489:** `const bookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 490:** `await Booking.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 533:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 551:** `catch(error){` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `getConfirmedBookings` — lines 568–648

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.query. Persistent operations detected: Booking.countDocuments, Booking.find; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false.

Key statements:
- **Line 569:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 571:** `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 574:** `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 577:** `const skip =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 582:** `const filter = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 591:** `const total =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 592:** `await Booking.countDocuments(filter);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 596:** `const bookings =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 597:** `await Booking.find(filter)` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 624:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `isPrivilegedBookingViewer` — lines 659–678

Parameters: `user`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 660:** `const role = String(` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 667:** `return [` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `getBookingById` — lines 680–793

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 686:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 688:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 689:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 695:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 697:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 731:** `if(!booking){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 733:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 743:** `if (!isPrivilegedBookingViewer(req.user)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 744:** `const requesterId = req.user._id.toString();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 746:** `const ownsAsUser =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 750:** `const ownsThroughCustomer =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 756:** `if (!ownsAsUser && !ownsThroughCustomer) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 757:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 768:** `return successResponse(` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 786:** `catch(error){` — Handles an exception from the preceding try block; check whether it returns, rethrows, logs safely, or continues.

### `updateBookingPayment` — lines 819–1120

Parameters: `bookingId`, `paymentStatus`, `paymentData (defaulted)`.
Persistent operations detected: Booking.findOne, Commission.findOne, Agent.findById, Commission.create; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 18 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 830:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 834:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 842:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 843:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 851:** `if(!booking){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 853:** `throw new Error(` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 864:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 869:** `return booking;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 878:** `if (paymentStatus === "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 879:** `const paymentAmount = Number(paymentData?.amount || 0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 901:** `if(paymentStatus==="paid"){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 910:** `if(booking.agent){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 912:** `const existingCommission =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 913:** `await Commission.findOne({` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 918:** `if(!existingCommission){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 921:** `const agent =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 922:** `await Agent.findById(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 927:** `if(agent){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `updateBookingStatus` — lines 1133–1187

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.body. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1134:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1135:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1139:** `if (!booking) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1140:** `return res.status(404).json({ success: false, message: "Booking not found" });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1143:** `const requestedStatus = String(req.body?.status || "").trim().toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1144:** `if (!isValidBookingStatus(requestedStatus)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1145:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1152:** `if (requestedStatus === booking.status) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1153:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1159:** `if (!canTransitionBookingStatus(booking.status, requestedStatus)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1160:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1168:** `if (requestedStatus === "completed" && booking.paymentStatus !== "paid") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1169:** `return res.status(409).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1177:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1179:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `cancelBooking` — lines 1195–1343

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.params, req.user. Persistent operations detected: Booking.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1202:** `try{` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1204:** `if (!mongoose.Types.ObjectId.isValid(req.params.id)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1205:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1211:** `const booking =` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1212:** `await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1220:** `if(!booking){` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1222:** `return res.status(404).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1235:** `if (` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1240:** `return res.status(403).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1246:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1250:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1264:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1268:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1291:** `if(` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1303:** `if (booking.tour) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1304:** `await releaseSlots(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1318:** `await booking.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1322:** `return res.status(200).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `getAllowedTourRange` — lines 1346–1363

Parameters: `booking`.
Persistent operations detected: Tour.findOne; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1347:** `if (!booking.tour) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1348:** `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour }))` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1351:** `if (!tour) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1352:** `const start = new Date(tour.startDate || tour.date);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1353:** `if (Number.isNaN(start.getTime())) return null;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1355:** `const storedEnd = tour.endDate ? new Date(tour.endDate) : null;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1356:** `if (storedEnd && !Number.isNaN(storedEnd.getTime())) storedEnd.setHours(0, 0, 0, 0);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1357:** `const match = String(tour.durationDetails?.days ?? tour.duration ?? 1).match(/\d+(?:\.\d+)?/);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1358:** `const days = Math.max(1, Math.round(Number(match?.[0] || 1)));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1359:** `const calculatedEnd = new Date(start);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1361:** `const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1362:** `return { start, end };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `rescheduleBooking` — lines 1365–1421

Parameters: `req`, `res`, `next`.
Reads request/component inputs: req.body, req.params, req.user. Persistent operations detected: Booking.findOne, Notification.create, User.find; verify tenant/ownership filters in the exact query. 6 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 12 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 1366:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 1367:** `const { newTravelDate, reason = "" } = req.body || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1368:** `if (!newTravelDate || Number.isNaN(new Date(newTravelDate).getTime())) return res.status(400).json({ success:false, message:"A valid future travel date is required." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1369:** `const target = new Date(newTravelDate); target.setHours(0,0,0,0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1370:** `const today = new Date(); today.setHours(0,0,0,0);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1371:** `if (target <= today) return res.status(400).json({ success:false, message:"The rescheduled date must be in the future." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1372:** `const booking = await Booking.findOne(` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1381:** `if (!booking) return res.status(404).json({ success:false, message:"Booking not found." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1382:** `if (["cancelled","completed","refunded"].includes(booking.status)) return res.status(400).json({ success:false, message:"This booking cannot be rescheduled." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1383:** `if (booking.travelDate && target.getTime() === new Date(booking.travelDate).setHours(0,0,0,0)) return res.status(400).json({ success:false, message:"Choose a different travel date." });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1384:** `const allowedRange = await getAllowedTourRange(booking);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 1385:** `if (booking.tour && (!allowedRange?.start || !allowedRange?.end)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1386:** `return res.status(409).json({ success:false, message:"This tour has no configured travel-date range." });` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1388:** `if (allowedRange && (target < allowedRange.start || target > allowedRange.end)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1389:** `return res.status(400).json({` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 1394:** `const previous = booking.travelDate;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 1395:** `if (!booking.originalTravelDate) booking.originalTravelDate = previous;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 1397:** `if (booking.pickupTime) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

## Module-level declarations

- Line 46: `export const createBooking = async (req, res, next) => {`.
- Line 49: `const settings = await getSystemSettings();`.
- Line 50: `const companyName = settings.companyName || "Company";`.
- Line 53: `const {`.
- Line 70: `const totalTravellers =`.
- Line 76: `let tourData = null;`.
- Line 87: `let customTourData = null;`.
- Line 128: `let capacityAvailable = true;`.
- Line 145: `const amounts = tourData`.
- Line 159: `const tax = calculateTax({`.
- Line 175: `const customerProfile = await Customer.findOne(`.
- Line 179: `const bookingData = {`.
- Line 215: `const booking = await createBookingAtomically({`.
- Line 223: `const tenantId = booking.tenantId;`.
- Line 246: `const bookingTour = tourData || customTourData || {`.
- Line 250: `const bookingTourTitle =`.
- Line 254: `const systemSettings = await getSystemSettings({`.
- Line 258: `const bookingNotificationsEnabled = systemSettings?.bookingNotifications !== false;`.
- Line 259: `const customerPhone =`.
- Line 264: `const bookingMessage = [`.
- Line 322: `export const getMyBookings = async (req, res, next) => {`.
- Line 325: `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));`.
- Line 328: `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));`.
- Line 331: `const skip =`.
- Line 335: `const customerProfile = await Customer.findOne(`.
- Line 343: `const ownershipFilters = [`.
- Line 353: `const filter = {`.
- Line 358: `const total =`.
- Line 363: `const bookings =`.
- Line 413: `export const getAllBookings = async (req,res,next)=>{`.
- Line 418: `const {`.
- Line 425: `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));`.
- Line 428: `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));`.
- Line 431: `const skip =`.
- Line 435: `const filter={};`.
- Line 484: `const total =`.
- Line 489: `const bookings =`.
- Line 561: `export const getBookings =`.
- Line 568: `export const getConfirmedBookings = async (req, res, next) => {`.
- Line 571: `const page = Math.max(1, Math.floor(Number(req.query.page) || 1));`.
- Line 574: `const limit = Math.min(100, Math.max(1, Math.floor(Number(req.query.limit) || 20)));`.
- Line 577: `const skip =`.
- Line 582: `const filter = {`.
- Line 591: `const total =`.
- Line 596: `const bookings =`.
- Line 659: `const isPrivilegedBookingViewer = (user) => {`.
- Line 660: `const role = String(`.
- Line 680: `export const getBookingById = async (`.
- Line 695: `const booking =`.
- Line 744: `const requesterId = req.user._id.toString();`.
- Line 746: `const ownsAsUser =`.
- Line 750: `const ownsThroughCustomer =`.
- Line 798: `export const getBooking =`.
- Line 819: `export const updateBookingPayment = async (`.
- Line 842: `const booking =`.
- Line 879: `const paymentAmount = Number(paymentData?.amount || 0);`.
- Line 912: `const existingCommission =`.
- Line 921: `const agent =`.
- Line 930: `const rate =`.
- Line 934: `const amount =`.
- Line 1133: `export const updateBookingStatus = async (req, res, next) => {`.
- Line 1135: `const booking = await Booking.findOne(`.
- Line 1143: `const requestedStatus = String(req.body?.status || "").trim().toLowerCase();`.
- Line 1195: `export const cancelBooking = async (`.
- Line 1211: `const booking =`.
- Line 1346: `const getAllowedTourRange = async (booking) => {`.
- Line 1348: `const tour = await Tour.findOne(mergeTenantFilter({ _id: booking.tour }))`.
- Line 1352: `const start = new Date(tour.startDate || tour.date);`.
- Line 1355: `const storedEnd = tour.endDate ? new Date(tour.endDate) : null;`.
- Line 1357: `const match = String(tour.durationDetails?.days ?? tour.duration ?? 1).match(/\d+(?:\.\d+)?/);`.
- Line 1358: `const days = Math.max(1, Math.round(Number(match?.[0] || 1)));`.
- Line 1359: `const calculatedEnd = new Date(start);`.
- Line 1361: `const end = storedEnd && storedEnd > calculatedEnd ? storedEnd : calculatedEnd;`.
- Line 1365: `export const rescheduleBooking = async (req, res, next) => {`.
- Line 1367: `const { newTravelDate, reason = "" } = req.body || {};`.
- Line 1369: `const target = new Date(newTravelDate); target.setHours(0,0,0,0);`.
- Line 1370: `const today = new Date(); today.setHours(0,0,0,0);`.
- Line 1372: `const booking = await Booking.findOne(`.
- Line 1384: `const allowedRange = await getAllowedTourRange(booking);`.
- Line 1394: `const previous = booking.travelDate;`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
