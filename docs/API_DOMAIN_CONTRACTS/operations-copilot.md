# Tour Manager Operations Copilot API contracts

## Route aliases and access

server/routes/index.js mounts tourManagerRoutes at both /tourmanager and /tour-manager. The same child router serves both prefixes. It applies protect, resolveTenant and managerOnly before the route declarations; the application and parent API router also resolve tenant context. managerOnly normalizes manager to tour_manager and allows tour managers, admins and platform Super Admins. Both handlers require tenant context and keep their data queries tenant-scoped.

## GET /api/tourmanager/copilot/summary and /api/tour-manager/copilot/summary — inventory 518–519

Handler: getOperationsCopilotSummary. No query, path or body inputs. It requires tenant context and runs independent reads concurrently:

- Up to 100 non-deleted Tours, ordered by startDate then legacy date.
- Booking aggregation grouped by tour, scoped by explicit tenant ObjectId, excluding deleted, cancelled and refunded bookings. It counts bookings/guests and sums totalAmount and amountPaid.
- TourCost aggregation scoped by tenant, excluding cancelled costs; estimated and committed rows contribute estimated cost, actual rows contribute actual cost.
- Overall active-booking financial totals (including bookings not linked to a tour), excluding cancelled/refunded and deleted records.
- Up to 100 outstanding bookings with positive totalAmount minus amountPaid, ordered by travel date.
- Up to 200 non-inactive operational assets of types vehicle, driver, guide, traveller_document and incident.

Each returned trip is shaped by buildTripOperations: booking/guest counts, booked and collected values, estimated/actual cost and margin, assignment flags and alerts. Missing guide/driver/vehicle, missing cost data when there is booked value, and remaining booking balances generate alerts. Actual margin is null unless at least one actual cost item exists.

Payment follow-ups are derived from the outstanding-booking sample. Balance is clamped at zero; fully paid/cancelled/refunded records are omitted. Travel within three days, including overdue travel dates, is marked urgent; malformed or absent dates are normal priority. Customer contact fields are read for display only: the endpoint does not send messages or contact customers.

Asset alerts inspect explicit metadata keys only: expiryDate, documentExpiry, licenseExpiry, maintenanceDueAt and nextMaintenanceAt. Expired status or dates before now are urgent; dates within 30 days are warning. Assets without alerts are omitted.

Success is 200 {success:true,data:{generatedAt,currency:"KES",source,summary,trips,paymentFollowUps,assetAlerts,disclaimer}}. Summary values include trip/booking counts, booked/collected/outstanding value, estimated cost/margin, payment follow-up counts and asset alert counts. Errors are passed to Express next(error). This handler performs no writes or external provider calls.

**Interpretation limits:** Tours and assets are capped at 100 and 200, and outstanding bookings at 100; summary alert counts are therefore based on bounded samples. Overall booked/collected totals include bookings not linked to a tour, while estimated cost sums only the returned tour sample. The resulting overall estimated margin can be misleading when a tenant has more than 100 tours or unlinked bookings. Currency is hard-coded to KES. The response is a snapshot assembled from parallel reads, not a transactionally consistent report.

## POST /api/tourmanager/copilot/quote-draft and /api/tour-manager/copilot/quote-draft — inventory 520–521

Handler: createOperationsQuoteDraft. Body fields: tourId (required), travelerCount, discountPercent (default 0) and taxPercent (default 0). It requires tenant context, validates tourId as a Mongo ObjectId, then loads a non-deleted Tour using a tenant filter and populates destination name/title. Invalid ID returns 400; a missing or out-of-tenant tour returns 404.

The server chooses the catalogue price using discountPrice nullish-coalesced with price; the client cannot supply or override the authoritative unit price. travelerCount must be an integer from 1 to 100. Discount and tax must be finite numbers from 0 to 100. The selected price must be finite and non-negative. Subtotal, discount, taxable amount, tax and total are rounded to two decimal places. A numeric zero discountPrice takes precedence over price.

Success is 200 {success:true,data:{tourId,tourTitle,destination,travelerCount,unitPrice,currency:"KES",subtotal,discountPercent,discountAmount,taxPercent,taxAmount,total,inclusions,exclusions,itinerary,cancellationPolicy,requiresReview:true,note}}. Validation errors return 400; unexpected errors go to next(error).

The quote is preview-only: no quotation, booking, payment or other record is persisted. The response explicitly requires manager review and instructs confirmation of dates, availability, taxes and custom supplier costs before sending to a customer.

## Test evidence and limitations

server/tests/operationsCopilotAccess.test.js contains static contract checks for authentication/tenant/manager middleware order, tenant-scoped database reads and the absence of persistence in the quote controller. server/tests/operationsCopilotCalculations.test.js contains pure unit tests for trip margins/assignment alerts, payment follow-up priority and malformed dates, asset expiry/maintenance alerts, money rounding and quote calculations/validation. These tests cover calculation/access contracts but do not execute a live HTTP request or Mongo-backed controller integration. They were not rerun during this documentation-only pass.
