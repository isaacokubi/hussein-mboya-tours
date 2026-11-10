# Tour Manager API contracts (tenant-scoped aliases)

## Mounts and authorization

server/routes/index.js mounts the same tourManagerRoutes router twice: /tourmanager and /tour-manager. Each of its 34 route declarations is therefore available under both prefixes, accounting for the paired inventory entries 516–583. The router applies protect, resolveTenant and managerOnly globally, in that order. managerOnly permits manager, admin and super_admin roles, but these handlers operate on tenant data and most call requireTenantId or mergeTenantFilter. A platform Super Admin token enters tenant bypass with req.tenantId=null, so tenant-required operations cannot be used as unscoped platform operations. Tenant managers/admins must have an active/trial tenant selected by the verified token/tenant resolver.

## Dashboard and operations copilot

### GET /api/tourmanager/dashboard and /api/tour-manager/dashboard — entries 516–517

getTourManagerDashboard requires tenant context. It counts non-deleted tenant tours, upcoming tours, customer users and completed payments/revenue metrics; returns up to 10 upcoming tours with populated destination/guide/driver/vehicle and up to 6 recent bookings. It aggregates guest counts by tour and formats occupancy/capacity, then normalizes customer contact fields from customer/user/snapshot/contact fallbacks. Response is 200 {success:true,data:{stats,upcomingTours,recentBookings}}. Stats include totalTours, upcomingTours, totalCustomers, revenue and revenueSource:"paid_booking_value". Revenue is supplied by getBookingRevenueMetrics. Errors are passed to next(error).

### GET /api/tourmanager/copilot/summary and /api/tour-manager/copilot/summary — entries 518–519

Read-only tenant summary. Requires tenant context and reads up to 100 non-deleted tours, booking aggregates (excluding cancelled/refunded), TourCost aggregates (excluding cancelled costs), up to 100 outstanding bookings and up to 200 active OperationalAsset records. It builds trip operations (assignment gaps, missing costs and outstanding balances), payment follow-up suggestions and asset expiry/maintenance alerts. Summary contains trip/booking counts, booked/collected/outstanding value, estimated costs/margin, payment follow-up counts and asset alerts. Response is 200 {success:true,data:{generatedAt,currency:"KES",source,summary,trips,paymentFollowUps,assetAlerts,disclaimer}}. It does not send messages or mutate bookings/payments. The tour list is capped at 100, so trip-derived estimated cost/margin can cover fewer tours than the all-booking totals; the disclaimer warns that missing costs make margins misleading.

### POST /api/tourmanager/copilot/quote-draft and /api/tour-manager/copilot/quote-draft — entries 520–521

Preview-only quote. Body: tourId (required ObjectId), travelerCount (integer 1–100), discountPercent (0–100, default 0), taxPercent (0–100, default 0). The tour must exist in the current tenant and not be deleted. Price is read from tour.discountPrice when present, otherwise tour.price; client cannot override the unit price. The response is 200 {success:true,data:{tourId,tourTitle,destination,travelerCount,unitPrice,currency:"KES",subtotal,discountPercent,discountAmount,taxPercent,taxAmount,total,inclusions,exclusions,itinerary,cancellationPolicy,requiresReview,note}}. It does not save a quote or booking. Invalid IDs/inputs return 400; missing tenant tour returns 404.

## Calendar reminders

### GET /api/tourmanager/calendar/reminders and /api/tour-manager/calendar/reminders — entries 522–523

Optional start/end query values must be real YYYY-MM-DD calendar dates. If both are supplied, start must be on/before end. It filters tenant reminders by date, sorts date then createdAt ascending, limits to 500, and returns 200 {success:true,data:reminders}. Invalid date/range returns 400.

### POST /api/tourmanager/calendar/reminders and /api/tour-manager/calendar/reminders — entries 524–525

Body date must be a real YYYY-MM-DD date; title must be a trimmed string of 1–180 characters. Title is normalized lowercase for duplicate detection. A duplicate tenant/date/normalizedTitle returns 409; a unique-index race also returns 409. Creates tenantId, createdBy, date, title and normalizedTitle and returns 201 {success:true,data:reminder}.

### DELETE /api/tourmanager/calendar/reminders/:id and /api/tour-manager/calendar/reminders/:id — entries 526–527

Requires valid ObjectId; invalid or missing/out-of-tenant reminder returns 404. Performs tenant-filtered hard delete and returns 200 {success:true,message:"Reminder removed.",data:{id}}.

CalendarReminder model evidence: tenantId is required; date is stored as a YYYY-MM-DD string; title is trimmed and constrained to 1–180 characters; normalizedTitle is required and lowercase. The model indexes tenant/date/createdAt and uniquely indexes tenant/date/normalizedTitle. The controller validates actual calendar dates (not only the model's regex) and maps duplicate-key races to 409. Listing is capped at 500 without pagination. Delete is a tenant-filtered hard delete. No focused calendarReminder controller/route test was found in the searched paths; no reminder was created or deleted during this source review.


## Tour catalogue and lifecycle

### GET /api/tourmanager/tours and /api/tour-manager/tours — entries 528–529

Query: upcoming (true/1), page (default 1), limit (default 10, clamped 1–50), status. Always excludes deleted tours and scopes by tenant. status is applied when supplied; upcoming overrides status with active tour statuses and a future startDate/date filter. Results populate guide/driver/vehicle/creator, sort by startDate/date/createdAt, and return 200 {success:true,count,total,data,tours,pagination:{total,page,limit,pages}}. Invalid status is not separately rejected; it simply becomes a database filter.

### POST /api/tourmanager/tours and /api/tour-manager/tours — entries 530–531

Runs validateFutureTourDate, validateTourCommand and createTour. New tour dates earlier than the local start of today are rejected by validateFutureTourDate and validateTourCommand; same-day times earlier than the current clock are not separately rejected. Required content: title, description, destination, country, location, date or startDate, and non-negative price. Duration is 1–365 days; capacity is normalized to at least 1; discount is clamped 0–100; depositType is fixed/percentage. Structured string fields (highlights, inclusions, exclusions, languages, tags, itinerary, availability, pricingRules) are parsed as JSON arrays; selected boolean strings must be "true" or "false". The tour-manager routes do not attach Multer upload middleware, so req.files is normally empty for these aliases. Although the shared controller contains a file-to-featuredImage/gallery branch, it is not activated by these route declarations; the admin tour route has its own upload middleware. Do not treat image upload as supported by /api/tourmanager/tours or /api/tour-manager/tours. Destination and optional assigned resources must belong to the tenant and pass active/availability/conflict checks. Tour creation and resource state updates run in a Mongo transaction. Success is 201 {success:true,message,data,tour}; errors are delegated to next(error).

### PUT /api/tourmanager/tours/:id and /api/tour-manager/tours/:id — entries 532–533

Runs validateTourCommand then updateTour. Requires valid ObjectId and an existing tenant-owned non-deleted tour. Resource assignment fields (assignedGuide/assignedDriver/assignedVehicle/guide/driver/vehicle) are rejected with 400; callers must use the dedicated assignment routes. The body is normalized against the existing document and allowlisted MUTABLE_FIELDS; tenantId and createdBy are removed before update. Success is 200 {success:true,message,data,tour}; missing tour is 404 and validation errors are delegated to next(error). This update is not wrapped in a transaction.

Update-route integrity boundaries: the route runs validateTourCommand() with its default allowPast=false, so any supplied date/startDate must parse and cannot be before the local start of today; an existing historical tour can still be edited when its date fields are omitted. The manager route has no Multer upload middleware, so the shared controller's req.files branch is not available through these aliases.

Two integrity gaps remain in the shared update handler. Unlike createTour, updateTour does not load/verify a newly supplied destination against the active tenant before writing the ObjectId reference; the Tour schema only declares a required Destination ref, so a foreign-tenant destination ID can be stored even though tenant-scoped populate may not resolve it. The generic update allowlist also accepts availability and availabilitySettings without comparing new capacity values against existing bookings; this bypasses the dedicated availability endpoint's booked-capacity guard. runValidators validates schema constraints but does not enforce these cross-document business invariants. The update is one tenant-filtered Tour document write, not a transaction.

Test evidence: the opt-in firstTenantAcceptance.integration.test.js exercises tour creation through /api/admin/tours, but the searched test does not exercise this Tour Manager update alias. No focused updateTour route/controller test was found.

### DELETE /api/tourmanager/tours/:id and /api/tour-manager/tours/:id — entries 534–535

Requires valid ObjectId. Calls cancelTourAndBookings with deleted:true, default reason "Tour deleted/cancelled", and requesting user ID. This is a soft delete, not a physical Tour delete: active bookings are cancelled in a transaction, paid amounts are marked refund requested (not refunded automatically), notifications are created, resources are released, and tour is marked cancelled/unavailable/unpublished/isDeleted. Returns 200 {success:true,message,data,bookingsAffected}. A completed tour cannot be cancelled; errors are delegated.

### PATCH /api/tourmanager/tours/:id/publication and /api/tour-manager/tours/:id/publication — entries 536–537

Body published must be boolean or string "true"/"false". Updates only a tenant-owned non-deleted tour, populates destination/resources, and returns 200 {success:true,message,data,tour}. Invalid value/ID returns 400; missing tour 404.

### PUT /api/tourmanager/tours/:id/assign, PUT /api/tourmanager/assign-resources/:id, POST /api/tourmanager/assign-guide and their /tour-manager aliases — entries 538–539, 544–547

All invoke validateTourAssignmentTenant then assignTourResourcesSafe. The assign-guide route first copies body.tourId into req.params.id. These use the same transactional tenant-safe resource assignment contract documented at [tour resource assignment](tour-resource-assignment.md): guide/driver/vehicle IDs are validated, availability and overlapping active tour windows are checked, Tour/Staff/Vehicle changes are committed together, and a tour.resources.assigned webhook is queued after commit. Omitted resource fields preserve current assignments; null/empty values clear them. Success 200 with populated updated tour; invalid IDs 400, missing tenant resources 404, conflicts/unavailability 409.

### PATCH /api/tourmanager/tours/:id/complete and /api/tour-manager/tours/:id/complete — entries 540–541

Requires tenant context, valid ObjectId and tenant-owned non-deleted tour. Runs in a Mongo transaction. Already-completed tours return an idempotent success. Otherwise marks completed/completedAt, releases guide/driver/vehicle and resets assignment state and bookedSlots. Success 200 {success:true,message,data}; missing tour 404 and invalid ID 400.

### PATCH /api/tourmanager/tours/:id/cancel and /api/tour-manager/tours/:id/cancel — entries 542–543

Calls cancelTourAndBookings with deleted:false and optional body.reason. Transactionally cancels active bookings, requests refunds for paid amounts (does not issue refunds), writes customer notifications, cancels/unpublishes the tour and releases resources. The resource-release helper sets assignmentStatus to pending after the cancellation service initially sets it to cancelled; the final saved tour therefore has assignmentStatus pending even though status is cancelled. This is a source-level state inconsistency. Success 200 {success:true,message,data,bookingsAffected}.

## Itineraries

### POST /api/tourmanager/itineraries and /api/tour-manager/itineraries — entries 548–549

Body requires tour ObjectId belonging to the tenant and not deleted. Only one active itinerary per tour is allowed; duplicate returns 409. Creates the itinerary from req.body plus createdBy/updatedBy and isDeleted:false, populates tour and creator, returns 201 {success:true,message,itinerary,data}. The model includes days (dayNumber/title/summary/activities), overview, highlights, included/excluded, status draft/published/archived and soft-delete fields. The model's unique tour index reinforces one itinerary per tour.

### GET /api/tourmanager/itineraries and /api/tour-manager/itineraries — entries 550–551

Lists tenant itineraries excluding isDeleted. Optional tour filters by tour ID; optional status is applied only when draft/published/archived. Populates tour and creator, newest first. Returns 200 {success:true,count,itineraries,data}. No pagination or explicit ObjectId validation for query tour is performed.

### GET /api/tourmanager/itineraries/:id and /api/tour-manager/itineraries/:id — entries 552–553

Validates ObjectId (400), reads a tenant-owned active itinerary, populates tour and creator. Missing/soft-deleted/out-of-tenant returns 404. Success 200 {success:true,itinerary,data}.

### PUT /api/tourmanager/itineraries/:id and /api/tour-manager/itineraries/:id — entries 554–555

Validates itinerary ID. If body.tour is supplied, validates ObjectId and tenant-owned non-deleted Tour; rejects a second active itinerary for that tour with 409. Copies request body, overwrites updatedBy, removes createdBy and isDeleted, then performs tenant-filtered findOneAndUpdate with validators and populates tour/creator. Success 200 {success:true,message,itinerary,data}; missing record 404, duplicate tour 409. The update body is not explicitly allowlisted by the controller; Mongoose schema governs persisted fields.

### DELETE /api/tourmanager/itineraries/:id and /api/tour-manager/itineraries/:id — entries 556–557

Validates ID, then tenant-filtered soft deletes by setting isDeleted:true and updatedBy. Returns 200 {success:true,message}; missing/out-of-tenant/already-deleted returns 404.

## Bookings and customer communication

### GET /api/tourmanager/bookings and /api/tour-manager/bookings — entries 558–559

Query: page (default 1), limit (default 20, clamped 1–100), status, paymentStatus, tour (only applied if valid ObjectId), search. Filters tenant and non-deleted bookings. Search is unescaped case-insensitive regex over bookingNumber and customer snapshot/contact name/email. Populates customer/user/tour/guide/driver/vehicle and normalizes customerDisplay fallbacks. Returns 200 {success:true,page,pages,total,count,bookings,data}. Invalid tour filter is silently ignored; regex metacharacters are active.

### PATCH/PUT /api/tourmanager/bookings/:id/complete and /api/tour-manager/bookings/:id/complete — entries 560–563

Both methods call completeBookingAndMaybeRelease. In a Mongo transaction, validates booking ID and tenant ownership; cancelled/refunded bookings cannot be completed; a non-completed booking must have paymentStatus:"paid". Marks booking completed/completedAt. If no other active (not cancelled/refunded/completed) booking remains for its tour, marks that tour completed and releases assigned resources. Returns 200 {success:true,message,data,booking} with populated related records. Invalid ID 400, missing booking 404, ineligible status/payment 400.

### PATCH/PUT /api/tourmanager/bookings/:id/cancel and /api/tour-manager/bookings/:id/cancel — entries 564–565 and 568–569

Both methods call cancelBookingAndUpdateCapacity. In a Mongo transaction, rejects invalid ID, missing/out-of-tenant booking, and cancelled/refunded/completed bookings. Sets status cancelled, cancelledAt/cancelledBy/cancellationReason and reduces tour availabilitySettings.bookedSlots by the booking guest count (minimum zero). It does not issue a refund or change paymentStatus/refundStatus. Returns 200 {success:true,message,data,booking}. Invalid ID 400, missing booking 404, ineligible status 400. The per-date Tour.availability array is not updated, so date-specific availability can diverge from availabilitySettings.

### POST /api/tourmanager/bookings/:id/notify and /api/tour-manager/bookings/:id/notify — entries 566–567

Requires valid booking ID and tenant-owned booking. Body type must be confirmation, payment_reminder, trip_reminder, booking, payment, tour_update or alert. channel must be sms, whatsapp, email or in_app. Recipient is booking.user or booking.customer.user; contact details come from customerSnapshot/contact. In-app creates a Notification record (requires a recipient user); SMS/WhatsApp/email call their respective external providers and require phone/email contact. Success 200 {success:true,message,notification,channel}. Invalid booking/type/channel or missing contact/account returns 400; missing booking 404. External delivery failure goes to next(error). This route can send real customer communications.

## Tenant directory and reporting

### GET /api/tourmanager/customers and /api/tour-manager/customers — entries 570–571

Query search, page (default 1) and limit (default 10, max 50). Lists tenant customer User records with non-deleted filter, role/legacyRole customer, search over name/email/phone, newest first. It adds legacy Customer.customerType and booking-derived totalBookings/totalSpent (only paid/completed paymentStatus contributes spend; uses depositAmount or totalAmount less refundAmount). Returns 200 {success:true,pagination,count,data,customers}. Search regex is unescaped; customer roleId-only records without role/legacyRole match are omitted.

### GET /api/tourmanager/guides and /api/tour-manager/guides — entries 572–573

Lists active, non-deleted tenant Staff with position guide/tour_guide/tourguide, selects name/email/phone/position/availability/assignedTours, populates assigned tour summary, sorts by name. Returns 200 {success:true,count,data,staff}. No pagination.

### GET /api/tourmanager/drivers and /api/tour-manager/drivers — entries 574–575

Same helper as guides, restricted to position driver. Returns 200 {success:true,count,data,staff}. No pagination.

### GET /api/tourmanager/vehicles and /api/tour-manager/vehicles — entries 576–577

Lists tenant Vehicle records excluding isDeleted, populates driver, newest first. Returns 200 {success:true,count,data,vehicles}. It does not filter isActive or status, so inactive/maintenance/out-of-service vehicles can appear in this directory.

### GET /api/tourmanager/reports and /api/tour-manager/reports — entries 578–579

Requires tenant context. Returns totalBookings, bookingStatus counts, totalCustomers, totalTours, completedTours, popularTours (top five by booking count/revenue from completed payments), totalRevenue from booking revenue metrics, and monthlyRevenue from posted journal reporting. Response 200 {success:true,data:{...metrics,revenueBasis:"posted_journals"}}. The totalRevenue and monthlyRevenue fields come from different services/bases; callers should not assume they reconcile exactly without comparing booking/payment and posted-journal sources.

## Availability

### GET /api/tourmanager/tours/:id/availability and /api/tour-manager/tours/:id/availability — entries 580–581

Requires tenant tour ID. Optional travelDate is parsed and normalized to local midnight; an invalid date parses to null and is treated like no date filter rather than returning 400. If a valid requested date is supplied and the tour has availability entries but none matches, returns 400. Slot counts use the matching Tour.availability entry when present, otherwise availabilitySettings/capacity/maxGuests. Counts active non-deleted bookings for the tour (and travelDate when valid), computes occupancy from bookedSlots/totalSlots, and returns 200 {success:true,data:{tourId,tourName,travelDate,totalSlots,bookedSlots,availableSlots,totalBookings,occupancyRate,isFull,availability,sourceOfTruth:"Tour.availability"}}. totalBookings counts booking records, not guest count.

### PUT /api/tourmanager/tours/:id/availability and /api/tour-manager/tours/:id/availability — entries 582–583

Body totalSlots must be a positive integer. It loads the tenant tour and aggregates booked guests from active bookings using numberOfGuests/guests/numberOfPeople fallback. Capacity cannot be reduced below booked guests (400). It sets Tour.capacity and availabilitySettings.totalSlots/bookedSlots, recalculates available and may change fully-booked to upcoming, saves and returns 200 {success:true,message,data:{tour,bookedSlots,availableSlots}}. It does not update individual Tour.availability date entries, although GET may prefer those entries for a requested travelDate; per-date availability can therefore remain stale.

## Test evidence and limitations

The route and handler source was traced for all 34 declarations and both prefixes. No dedicated end-to-end run or live provider notification was performed. The source review did not find a single comprehensive test suite covering all 34 routes; focused test coverage must be checked separately before declaring runtime behavior verified.
