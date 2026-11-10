# Tenant user profile and directory APIs

## Route boundary

server/routes/index.js mounts userRoutes at /users. The router applies resolveTenant then protect to all routes. Profile reads/updates require authentication. GET /guides additionally requires roleMiddleware(admin, tour_manager, tourmanager, manager); DELETE /:id requires roleMiddleware(admin). Controllers use tenant-scoped User/Staff queries.

## GET /api/users/profile — inventory 614

Handler getUserProfile. Requires tenant context, reads the authenticated req.user._id, excludes password and returns 200 {success:true,data:user}. Missing user returns 404 {success:false,message:"User not found"}. Errors are logged and passed to next(error).

## PUT /api/users/profile — inventory 615

Handler updateUserProfile. Copies only name, phone and profileImage from body. If supplied, name and phone cannot be blank; no phone-format rule is applied here. It updates the authenticated user by ID with runValidators:true, excludes password and returns 200 {success:true,message,data,user}. Missing user returns 404. Other errors go to next(error). The handler does not synchronize corresponding Staff/Customer profile records.

## GET /api/users/guides — inventory 616

Requires admin, tour_manager/tourmanager or manager. Reads tenant-scoped Staff records with position guide, status active, isActive true and isDeleted not true. Returns name/email/phone/profileImage/experience/availability/assignedTours/position, sorted by name. Success is 200 {success:true,count,data,guides}. The Staff IDs are returned intentionally because tour assignment references Staff rather than User. No pagination.

## DELETE /api/users/:id — inventory 617

Requires admin. Reads a tenant-scoped User by path ID using mergeTenantFilter. Missing/out-of-tenant user returns 404. It then calls user.deleteOne() and returns {success:true,message:"User deleted successfully"}. There is no explicit ObjectId validation, soft-delete, transaction or cascade in this controller. User.js has no pre/post delete hook; linked Staff/Agent/Customer records and bookings are not deleted by this handler. Errors are caught and returned as 500 {success:false,message} using publicErrorMessage.

## Test evidence and limitations

No focused userRoutes/userController tests were found in the paths searched. No profile was changed and no user was deleted during this review.
