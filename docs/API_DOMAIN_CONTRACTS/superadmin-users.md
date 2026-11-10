# Super Admin user administration API contracts

All routes are mounted by server/routes/superAdminRoutes.js and inherit protect then superAdminOnly. The platform-owner role establishes tenant bypass for User/Role/Staff/Agent model operations in these handlers.

## GET /api/superadmin/users — inventory 451 and 452

Handler getSuperAdminUsers. Optional query fields: page and search. page is coerced with Number and clamped to at least 1, default 1. Page size is fixed at 10. search is stringified and trimmed; a non-empty value is interpolated directly into a case-insensitive regex across name, email, phone, role, legacyRole and status.

User.find and countDocuments run concurrently with the same filter. Results exclude password, populate roleId name/displayName/permissions, sort newest first and apply skip/limit. Response mapping resolves role from roleId.name, then role, legacyRole or customer; status defaults to active and isActive is true only for active. Success is 200 {success:true,page,limit,total,pages,count,users,data}; users and data are the same array. Errors go to next(error).

**Input caveat:** search is not regex-escaped and has no explicit maximum length. Page has no upper bound; extreme page numbers can produce large skip values.

## POST /api/superadmin/users/accounts — inventory 453 and 454

Handler createSuperAdminCompanyAccount (alias of createCompanyAccount). Body fields: name, email, phone, password, role. role is normalized through a fixed mapping: admin/administrator→admin; manager/tour_manager/"tour manager"→manager; tour_guide/guide/"tour guide"→tour_guide; driver→driver; agent/travel_agent/"travel agent"→agent; customer→customer. Unknown roles return 400.

Name and email must be non-empty; phone must be exactly 10 digits. Password must be at least 12 characters and include uppercase and a digit (the controller does not require lowercase). Email is trimmed/lowercased and checked for an existing user; duplicate email returns 409. The handler looks up the canonical Role and returns 400 if it is not configured. It creates an active, verified User with role and legacyRole set to the canonical role, then creates a Staff record for tour_guide/driver, or an Agent record for agent. Created agents are active but isApproved:false and have commissionRate 10. The response re-reads the user without password and returns 201 {success:true,message,user,staff,agent}.

**Tenant assignment concern:** this handler does not assign tenantId when creating the User, Staff or Agent. It runs under the platform Super Admin bypass context, while those models are tenant-scoped. The tenant plugin permits bypass writes without injecting a tenant ID for non-platform-owner documents. Consequently, this route can create tenantless operational accounts/records; confirm whether that is intentional for platform-wide company accounts or whether a target tenant should be required and propagated. Email uniqueness is also checked globally in bypass context even though the User model's declared unique index is tenantId/email.

## PATCH /api/superadmin/users/:id/status and PUT /api/superadmin/users/:id/status — inventory 455–458

Both HTTP method aliases invoke updateSuperAdminUserStatus. The path id must be a valid ObjectId; body.status must be one of active, inactive, disabled, suspended or blocked. Invalid values return 400. It updates User by id with runValidators and returns the user without password. Missing user returns 404. Success is 200 {success:true,message,user,data}; errors go to next(error). The handler does not cascade status to linked Staff or Agent records.

## DELETE /api/superadmin/users/:id — inventory 459

Handler deleteSuperAdminUser. Invalid ObjectId returns 400. The caller cannot delete their own account (400). Missing user returns 404. Users whose role or legacyRole is super_admin/superadmin are protected and return 403. Otherwise it concurrently deletes Staff and Agent documents linked by user id and then deletes the User; success is 200 {success:true,deleted:true,message}. The three deletes are not in a transaction, so a partial failure can leave linked records or an orphaned user. The handler does not delete customer profiles, bookings or other related records.

## DELETE alias — inventory 460

Inventory entry 460 is a repeated mount of the same `DELETE /api/superadmin/users/:id` declaration and `deleteSuperAdminUser` handler documented above for entry 459. It has identical authentication, ObjectId validation, self-delete protection, Super Admin role check, linked Staff/Agent deletion, User deletion, response and non-transactional failure behavior. It is retained as a separate inventory row because the mounted route inventory preserves repeated mounts.

## Model evidence and limitations

User stores role/legacyRole, roleId, tenantId, status, verification and authentication metadata; password is excluded by default and hashed by the User save hook. Its unique email index is tenant-scoped for users with ObjectId tenantId. This controller's account creation path does not provide tenantId. No focused superAdminUserController tests were found in searched paths. No user was created, updated or deleted during this source review.
