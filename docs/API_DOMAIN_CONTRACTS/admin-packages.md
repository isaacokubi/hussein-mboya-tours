# Admin tour package contracts

## Shared middleware and data rules

Mounted at `/api/admin/packages`. The pipeline is `resolveTenant` → `protect` → `adminMiddleware` → `authorize("tour.manage")` → handler. Only active `admin` and `super_admin` roles pass the admin gate; the permission middleware accepts `tour.manage`/`manage_tours` aliases and platform wildcard permission. Missing auth is 401; missing/inactive user, wrong role, or missing permission is 403; middleware lookup failures are 500. Tenant context is required and package reads/writes use `mergeTenantFilter`; branch scope is not applied.

The controller accepts only: title, description, shortDescription, destination, country, startLocation, category, duration, numberOfDays, currency, basePrice, agentPrice, discountPercentage, discountPrice, minimumGuests, maximumGuests, availableSeats, itinerary, inclusions, exclusions, highlights, bookingDeadline, instantBooking, featured, seo, coverImage, gallery. It discards other fields. Its package normalization trims title/description/destination/duration, derives a lowercase ASCII slug (max 100 chars), uppercases currency, defaults country to Kenya/currency to KES on create, and validates required title/description/destination/category/duration, non-negative finite basePrice/agentPrice when supplied, duration from 1–365 days, status in draft/active/inactive/sold_out, and boolean `published` when present. Remaining field types/enums/defaults are enforced by TourPackage schema. Duplicate slug returns 409.

## GET /api/admin/packages

No endpoint-specific params/body/query. Finds non-deleted tenant packages, newest first, returns HTTP 200 `{success:true,count,packages}` as lean documents. No explicit projection, so the model document fields are returned. Caller: no first-party client API reference found in `client/src` at review time.

## POST /api/admin/packages

JSON body uses the shared allowed fields. Create requires title, description, destination, category, duration, basePrice and agentPrice (the latter two are schema-required; price handler validation permits omission, then schema validation fails). `published` defaults false in the controller, despite model default true. `status` defaults draft; country/currency default Kenya/KES. Creator and tenant are set from authenticated user/context; client cannot set `tenantId` or `createdBy`. Success HTTP 201 `{success:true,package}`. Invalid slug collision returns 409 `{success:false,message:...}`; explicit validation failures return 400 through `next(error)` and schema failures use centralized handling.

## PUT /api/admin/packages/:id

Requires path `id`; invalid ObjectId returns 400, missing/deleted/cross-tenant package returns 404. JSON body is filtered to allowed fields. It first loads the tenant-owned non-deleted document, validates required values against existing data, then tenant-filters `findOneAndUpdate` with schema validators. If supplied, status must be one of draft/active/inactive/sold_out; `published` must be boolean and is normalized to strict true/false. Body `slug`, when present, is normalized. Success HTTP 200 `{success:true,package}`. Duplicate slug returns 409; explicit validation errors return 400; persistence errors are centralized.

## DELETE /api/admin/packages/:id

Soft delete. Invalid ObjectId returns 400; missing/deleted/cross-tenant package returns 404. Updates `isDeleted:true`, `status:"inactive"`, `published:false`. Success HTTP 200 `{success:true,deleted:true,packageId}`. No media cleanup is performed by this handler.

## Frontend

No matching first-party `client/src` caller was found by searching the package endpoint and exported operation names; this contract is server-source verified and the frontend-caller dimension is absent.
