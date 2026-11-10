# Tenant travel voucher, dynamic pricing and loyalty APIs

## Route boundary

server/routes/index.js mounts travelLifecycleRoutes at /travel, yielding /api/travel. The router applies protect globally. Only voucher issue and loyalty earn add managerOnly; voucher redemption, dynamic price calculation, loyalty balance and loyalty redemption are available to any authenticated user. This router does not call resolveTenant itself; handlers use req.user.tenantId and tenant-aware models/queries.

## POST /api/travel/vouchers — inventory 600

Handler issueVoucher; requires managerOnly. Generates 24 random bytes as a 48-character hex token, stores only its SHA-256 hash in OperationalAsset metadata, sets type voucher/status active/redemptionLimit 1/redeemedCount 0 and stores optional name, bookingId, tourId, expiresAt and issuedFor. Success is 201 {success:true,data:{...voucher,token}}; the raw token is returned once. The controller does not validate that supplied bookingId/tourId belong to the current tenant or that expiresAt is a valid future date. The OperationalAsset itself is created with req.user.tenantId.

## POST /api/travel/vouchers/redeem — inventory 601

Any authenticated user can redeem a token within their own tenant. The handler hashes req.body.token and finds an active tenant voucher by metadata.tokenHash. Missing/invalid/already-used returns 404; expired returns 410; exhausted redemptionLimit returns 409. It increments redeemedCount, records redeemedAt/redeemedBy, sets status completed and saves, then returns 200 {success:true,data:voucher}.

**Concurrency caveat:** lookup, limit check and save are separate operations, not an atomic conditional update or transaction. Concurrent redemption requests can both observe redeemedCount below the limit and both succeed before either save is visible. The default one-use limit is therefore not race-safe.

## POST /api/travel/pricing/calculate — inventory 602

Any authenticated user can request a calculation. Body fields: optional tourId or tour, optional travelDate or date, guests or numberOfGuests (default 1), basePrice and currency (default KES). If tourId is supplied, the controller loads a published/available scheduled/upcoming/ongoing Tour; tenant query scoping is supplied by the Tour tenant plugin under the protect-created user context. Missing/unavailable tour returns 404. If body.basePrice is finite, it is used even when a tourId is supplied; otherwise the tour discountPrice/price is used. basePrice must be non-negative; guests must be integer 1–100; supplied date must parse.

It loads active tenant TravelCommercialRule records of type dynamic_price, priority descending. Rules are applied sequentially when min/max guest and from/to date conditions pass; percent and fixed actions modify price, clamped at zero after each rule. Success is 200 {success:true,data:{basePrice,finalPrice,currency,guests,travelDate,rulesApplied}}.

**Pricing integrity caveat:** when a valid tourId is supplied, a caller can still supply a finite basePrice and override the tour's configured price. This endpoint only returns a calculation and does not create a booking/payment, but callers must not treat its client-supplied basePrice as an authoritative quote.

## GET /api/travel/loyalty/:customerId — inventory 603

Any authenticated user can request a tenant LoyaltyAccount by customerId (or own user ID if omitted). The handler queries {tenantId:req.user.tenantId,customerId} and returns 200 {success:true,data:account}; absent account returns {points:0,lifetimeEarned:0,lifetimeRedeemed:0}. No ObjectId validation or owner/manager authorization check is applied.

**Authorization finding:** a normal authenticated user can query another customer's loyalty balance within the same tenant by supplying that customer's ID. The route should enforce self-only access or a manager/admin role for other customers.

## POST /api/travel/loyalty/earn — inventory 604

Requires managerOnly. Body points must be a positive integer up to 1,000,000. customerId defaults to req.user._id. It reads an existing account, preserves or generates a referralCode, then upserts the tenant/customer account, increments points and lifetimeEarned, and returns 200 {success:true,data:account}. The controller does not verify that customerId refers to an active customer user in the tenant before upserting.

## POST /api/travel/loyalty/redeem — inventory 605

Any authenticated user can redeem points. Body points must be a positive integer; customerId defaults to req.user._id. It performs findOneAndUpdate constrained by tenantId, customerId and points >= requested, decrementing points and incrementing lifetimeRedeemed. Insufficient balance or missing account returns 409; success is 200 {success:true,data:account}.

**Authorization finding:** the route has no managerOnly/owner check. A user can submit another tenant customer's customerId and redeem that account's points, subject only to its balance. This is an unauthorized cross-customer mutation within the tenant. The controller should bind customerId to req.user._id for customer sessions and require a privileged role for another customer's account.

## Model and test evidence

LoyaltyAccount has a unique tenantId/customerId index, non-negative points/lifetime counters, referralCode and tenant plugin. OperationalAsset stores voucher token hash/limit/redemption metadata. No focused travelLifecycleRoutes/controller tests were found in searched paths. No voucher was issued/redeemed, no dynamic price was applied to a booking, and no loyalty balance was read or mutated during this source review.
