# Admin review moderation contracts

## Shared middleware and tenancy

Mounted at `/api/admin/reviews`: `resolveTenant` → `protect` → `adminMiddleware` → `authorize("review.manage")`. Active `admin` and `super_admin` roles pass the role gate, then need `review.manage` (or configured alias/wildcard). Tenant is required; review lookups are tenant-scoped. No branch filter. Middleware failures use standard JSON 401/403/500 responses.

## GET /api/admin/reviews

No route-specific parameters, query, or body. Finds non-deleted reviews for the current tenant, populates user/customer name-email-profileImage and tour title, sorts newest first, returns HTTP 200 `{success:true,count,reviews}`. Database failures go to centralized error handling. Frontend: `client/src/api/adminReviewApi.js`, rendered by the review admin page.

## PATCH /api/admin/reviews/:id/approve

Finds the tenant review by `id` (no explicit ObjectId validation). Missing/cross-tenant record is HTTP 404 `{success:false,message:"Review not found"}`. Sets `approved=true`, `rejected=false`, clears `rejectionReason`, saves, then recalculates rating from all approved, non-deleted reviews for that tenant/tour and updates Tour `averageRating`, `rating`, `reviewsCount`, `totalReviews`. Success HTTP 200 `{success:true,review}`. No body fields are read. Review save and tour aggregate update are separate writes with no transaction; a second-write failure can leave stale tour metrics. Frontend `approveReview(id)` sends PATCH with no body.

## PATCH /api/admin/reviews/:id/reject

Reads optional JSON `reason`; sets approved false, rejected true, and `rejectionReason = reason || "Rejected by administrator"`, then saves and recalculates ratings using the same aggregation path. Missing review is 404; success 200 `{success:true,review}`; other failures go to centralized handling. Empty strings use the default. Frontend sends `{reason}` and defaults reason to an empty string.

## DELETE /api/admin/reviews/:id

Soft-deletes by setting `isDeleted=true`, saves, then recalculates the associated tour rating. Missing review is 404; success 200 `{success:true,message:"Review deleted"}`. The review record remains stored. As with moderation, review and tour updates are not transactional. Frontend caller: `deleteReview(id)`.
