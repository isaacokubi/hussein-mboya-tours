# Admin coupon API contracts

## Shared access and tenancy

Mounted at /api/admin/coupons. Router middleware order is resolveTenant → protect → adminMiddleware → authorize("coupon.manage"). The explicit route permission is coupon.manage. Coupon uses tenantPlugin and tenant-scoped unique indexes on code. The controller also calls requireTenantId and filters list/update/delete by tenant.

## Shared payload normalization and validation (create/update)

Controller copies the request body, uppercases/trims code, trims description, lowercases discountType, number-coerces amount/usageLimit/minimumBookingAmount, converts empty/null maximumDiscount to null (including when omitted), number-coerces other maximumDiscount values, and parses truthy startDate/expiresAt as Dates. Validation requires code length 2–50, discountType percentage/fixed, finite nonnegative amount (percentage <=100), integer usageLimit >=1, nonnegative finite optional minimum/maximum amounts, valid dates, and expiry after start when both supplied. Model schema additionally requires expiresAt and enforces types/enums/ranges.

The helper requires usageLimit and amount on both create and update even though the schema has a usageLimit default. On update it also sets maximumDiscount to null when the caller omits that property.

Serialization adds numeric usedCount/usageLimit, remainingUses, expired, and a display status with precedence: inactive, expired, scheduled, used, active. A coupon at its use limit is labeled used even if it is otherwise active.

## GET /api/admin/coupons

- **Request:** No handler query/body fields; standard auth/tenant context. Frontend adds a cache-busting _ts query parameter, which the controller ignores.
- **Read/response:** Tenant coupons newest first, serialized. Sets Cache-Control: no-store. HTTP 200 {success:true,count,coupons:[...]}.
- **Failures:** Read errors pass to centralized Express handling. Read-only.
- **Frontend:** getCoupons() normalizes the coupons envelope.

## POST /api/admin/coupons

- **Request:** Shared normalized fields above; body is expected to be an object. createdBy is set from authenticated user ID or null; caller cannot override it because controller spreads payload first.
- **Write/response:** Creates a tenant Coupon; HTTP 201 {success:true,coupon:serializedCoupon}.
- **Errors:** Custom invalid fields return 400 with helper message; duplicate tenant code returns 409; schema/database errors pass to centralized handling.
- **Frontend:** createCoupon(payload) sends payload unchanged.

## PUT /api/admin/coupons/:id

- **Request:** Path ID must pass mongoose ObjectId validation (400 otherwise). The same validation helper means code, discountType, amount, and integer usageLimit must all be present in the body even for an intended partial update.
- **Write/response:** Tenant-filtered findOneAndUpdate with validators; HTTP 200 {success:true,coupon:serializedCoupon}.
- **Errors:** Invalid ID 400; invalid body 400; missing/cross-tenant coupon 404; duplicate code 409; other errors use centralized handling.
- **Frontend:** updateCoupon(id,payload) sends payload unchanged.

## DELETE /api/admin/coupons/:id

- **Request:** Path ID must be a valid ObjectId; no body.
- **Write/response:** Tenant-filtered findOneAndDelete; HTTP 200 {success:true,message:"Coupon deleted"}.
- **Errors:** Invalid ID 400; missing/cross-tenant coupon 404; other failures pass to centralized handling. This is a hard delete and does not alter bookings already discounted.
- **Frontend:** deleteCoupon(id) returns the response envelope.
