# Public and manager tour catalogue APIs

## Tenant resolution and route order

server/app.js applies global resolveTenant before mounting /api routes. tourRoutes is mounted at /tours. It declares public read routes first, then applies protect and tourManagerOnly to subsequent manager operations. The public reads are tenant-facing: tenant host/verified tenant context scopes results to that tenant; only an intentional platform Super Admin bypass can read globally. On the platform host without tenant context, tenant-scoped reads fail closed rather than silently returning every tenant's tours.

## GET /api/tour-reports — inventory 584

tourReportRoutes applies resolveTenant, protect and roleMiddleware("admin","manager","super_admin"). getTourReports requires tenant context. It returns total bookings, total revenue from getBookingRevenueMetrics, booking-status counts, top five tours from completed Payment records joined to tenant-owned bookings/tours, monthly revenue from posted journal reporting, total customer users, total tours and completed tours. Success is 200 {success:true,data:{totalBookings,totalRevenue,totalCustomers,totalTours,completedTours,bookingStatus,popularTours,monthlyRevenue,revenueBasis:"posted_journals"}}. Errors are passed to next(error). totalRevenue and monthlyRevenue come from different services/bases and should not be assumed to reconcile exactly without comparing booking/payment and posted-journal sources.

## Public tour reads

### GET /api/tours — inventory 585

Query fields: page (safe integer >0, capped 10,000; default 1), limit (integer clamped 1–24; default 12), search (trimmed, escaped regex, max 120 chars), destination, category (escaped exact-match case-insensitive regex), featured ("true"), duration ("1-3","4-6","7+"), travellers (integer 1–100), sort (price-asc, price-desc, newest; otherwise featured/popularity/newest). Public filter requires available:true, isDeleted:false, published:true and status scheduled/upcoming/ongoing. Results select public fields, limit images/gallery to one each, populate destination, attach slot totals and tenant/system currency, and return 200 {success:true,data,tours,pagination:{page,limit,total,pages}}.

### GET /api/tours/featured — inventory 586

Uses the same public visibility filter plus featured:true. Sorts popularity then createdAt descending, limits six, populates destination and attaches slot availability/hasOwnImage. Returns 200 {success:true,data}. No request fields are read.

### GET /api/tours/search — inventory 587

Query fields: keyword or search, category, country, destination, page, limit. Uses the same public visibility filter; search is escaped and truncated to 120 characters across title/description/location. Category uses escaped exact match. Pagination follows the same 10,000 page / 24 item cap. Sort newest first. Returns 200 {success:true,count,pagination,data}.

### GET /api/tours/slug/:slug — inventory 588

Trims/lowercases slug; blank slug returns 400. Looks up only a publicly visible tour in the active tenant (or global Super Admin bypass) and populates destination. Missing result returns 404; success 200 {success:true,data} with availability and hasOwnImage fields.

### GET /api/tours/:id/availability — inventory 589

Public read route declared before protected manager routes. It invokes getTourAvailability, which requires tenant context, loads a tenant-owned non-deleted tour and calculates slots/occupancy from per-date Tour.availability when a matching travelDate is selected, otherwise availabilitySettings/capacity. It counts active bookings for the tour/date and returns {success:true,data:{tourId,tourName,travelDate,totalSlots,bookedSlots,availableSlots,totalBookings,occupancyRate,isFull,availability,sourceOfTruth}}. A malformed travelDate is normalized to null and treated as no date filter; if a valid date is supplied but the tour has availability entries with no matching date, returns 400. Missing tour is 404.

### GET /api/tours/:id — inventory 590

Public read route after the availability route. Uses the same public visibility filter and tenant context, populates destination, attaches slot availability/hasOwnImage, and returns 200 {success:true,data}. Missing/unpublished/unavailable/out-of-tenant tour returns 404. The controller does not explicitly validate ObjectId format before Mongoose lookup; cast errors are delegated to next(error).

## Protected tour-manager routes

After public declarations, the router applies protect then tourManagerOnly. tourManagerOnly permits tour_manager/tourmanager/manager/admin/super_admin (normalized aliases). Controllers remain tenant-scoped and requireTenantId, so a platform Super Admin bypass with no tenant ID cannot use these tenant mutation routes as unscoped platform operations.

### GET /api/tours/manager — inventory 591

Handler getManagerTours. Requires tenant context, filters non-deleted tours by tenant and additionally createdBy=req.user._id, populates destination/assigned guide/driver/vehicle, sorts newest first, and returns 200 {success:true,count,data}. No pagination; a manager sees only tours created by their own user ID.

### POST /api/tours — inventory 592

Runs validateTourCommand(), upload.array("images",10), then createTour. Validates tour text/price/capacity/discount/duration/date fields, accepts up to 10 uploaded images, normalizes structured JSON arrays and boolean strings, requires title/description/destination/country/location/date-or-startDate/non-negative price, and validates duration 1–365 days. The controller requires tenant context, starts a Mongo transaction, verifies tenant destination and any supplied guide/driver/vehicle, checks active/availability/date overlap, creates Tour and updates resource state atomically. Returns 201 {success:true,message,data,tour}. Errors are passed to next(error).

### PATCH /api/tours/:id/availability — inventory 593

Protected manager capacity update. Body totalSlots must be a positive integer. It loads a tenant-owned non-deleted tour, aggregates booked guests from active bookings, rejects a capacity below current booked guests with 400, updates Tour.capacity and availabilitySettings.totalSlots/bookedSlots, recalculates available/status and returns 200 {success:true,message,data:{tour,bookedSlots,availableSlots}}. It does not update per-date Tour.availability entries, so GET with travelDate may continue to return stale per-date values.

### PUT /api/tours/:id — inventory 594

Runs validateTourCommand({allowPast:true}), upload.array("images",10), then updateTour. Requires valid ObjectId and tenant-owned non-deleted tour. It rejects guide/driver/vehicle changes in the body and directs callers to assignment routes. Normalizes allowlisted mutable fields, preserves existing values, removes tenantId/createdBy from update and returns 200 {success:true,message,data,tour}. Unlike creation, this update is not wrapped in a Mongo transaction.

### DELETE /api/tours/:id — inventory 595

Handler deleteTour. Requires valid ObjectId and delegates to cancelTourAndBookings with deleted:true. This performs a transactional cancellation of active bookings, marks paid booking amounts refund requested (does not issue provider refunds), creates customer notifications, cancels/unpublishes the tour, releases resources and soft-deletes the Tour. Returns 200 {success:true,message,data,bookingsAffected}; completed tours cannot be cancelled.

### PATCH /api/tours/:id/publication — inventory 596

Body published must be boolean or string "true"/"false". Updates only tenant-owned non-deleted tour, populates destination/resources and returns 200 {success:true,message,data,tour}. Invalid value/ID returns 400; missing tour 404.

### PUT /api/tours/:id/assign — inventory 597

Calls assignTourResourcesSafe directly (without validateTourAssignmentTenant middleware). The controller itself requires tenant context, validates ObjectIds and verifies tenant-owned active guide/driver/vehicle records, availability and overlapping active tour windows, then transactionally updates Tour/Staff/Vehicle and queues a webhook after commit. Returns 200 with populated updated tour; invalid ID 400, missing resource/tour 404, unavailable/conflicting resource 409.

### PATCH /api/tours/:id/assign-vehicle — inventory 598

Compatibility alias to the same assignTourResourcesSafe handler. The body must use the handler's guideId/driverId/vehicleId fields; despite the route name, it can update any of the three resources if supplied. The controller performs the same tenant and availability checks and transaction.

### PATCH /api/tours/:id/remove-vehicle — inventory 599

Inline middleware replaces/merges req.body with vehicleId:null, then calls assignTourResourcesSafe. It clears the vehicle assignment while preserving omitted guide/driver assignments, updates resource state in a transaction and queues the same post-commit webhook. Success 200; validation/not-found/conflict errors follow the shared assignment handler.

## Test evidence and limitations

All 16 mounted method/path entries were source-traced through the route and controller files. No public API request or manager mutation was executed during this documentation pass. The tour resource assignment implementation is shared with the dedicated /api/tour-assignments route contract.
