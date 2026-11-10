# Tenant wishlist API contracts

## Route boundary

server/routes/index.js mounts wishlistRoutes at /wishlist. The router applies resolveTenant then protect to every route. All operations are authenticated and scoped to req.user._id plus the active tenant.

## GET /api/wishlist — inventory 627

Handler getWishlist. Requires tenant context. Reads the authenticated user's Wishlist and populates only tours with isDeleted:false and published:true. If no wishlist exists, creates an empty tenant/user wishlist. Success is 200 {success:true,count,wishlist:[tours]}. It does not filter tours by available:true or scheduled/upcoming/ongoing status, so unavailable or cancelled-but-still-published tours may appear.

## POST /api/wishlist — inventory 628

Body requires tourId; missing returns 400, invalid ObjectId returns 400. The tour must belong to the current tenant and satisfy isDeleted:false/published:true; otherwise 404. It loads or creates the authenticated user's wishlist, then uses $addToSet to add the tour ID (duplicate additions are idempotent). It re-reads/populates the wishlist and returns 200 {success:true,message,count,wishlist}. Concurrent first-time creates can race against the unique user index and may surface a duplicate-key error; no retry is implemented.

## DELETE /api/wishlist/:tourId — inventory 629

Requires valid ObjectId; invalid returns 400. Finds the authenticated user's tenant wishlist; missing returns 404. Uses $pull to remove the tour ID, re-reads/populates and returns 200 {success:true,message,count,wishlist}. Removing a tour not currently saved still returns success.

## Model and test evidence

Wishlist stores tenantId, unique user owner and array of Tour IDs, uses tenantPlugin, and has a pre-save deduplication hook plus totalTours virtual. No focused wishlistRoutes/controller tests were found in searched paths. No wishlist was created or modified during this review.
