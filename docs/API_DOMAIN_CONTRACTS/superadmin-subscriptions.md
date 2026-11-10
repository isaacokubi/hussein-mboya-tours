# Super Admin subscription activation, plan switching, deletion and payment listing

All routes are mounted under server/routes/superAdminRoutes.js and inherit protect then superAdminOnly. The subscription controller also checks the requester role directly for sensitive manual subscription operations.

## POST /api/superadmin/tenants/:id/subscription/activate — inventory 437 and 438

Handler approveTenantSubscription. It independently requires req.user.role or legacyRole to be super_admin/superadmin; otherwise 403. It loads Organization by path id (missing tenant 404), defaults plan to the tenant's current plan or starter, and normalizes periodDays to 1–3660 (default 30). It obtains the configured platform plan price; if the price is not a positive integer, returns 400. It requires a non-empty body.reference; missing reference returns 400 "A verified payment reference is required for manual activation."

It creates a SubscriptionPayment with provider manual, status pending, tenant/user/plan/amount/periodDays, transactionReference and metadata.approvedBy/note, then calls activateTenantSubscription with that payment and reference. The service updates Organization status/subscription and Subscription, then marks the supplied payment completed and sets paidAt. Success is 200 {success:true,message,tenant,payment}. Errors go to next(error).

**Payment verification finding:** the route checks only that reference is non-empty. It does not look up a provider settlement, reconcile a pre-existing payment, or verify the reference with M-Pesa/bank/Stripe. It creates its own pending manual payment and then the service marks it completed. Thus the response's completed payment status is an administrative assertion based on the supplied string, not independently verified provider evidence. The route should require auditable proof/approval or a verified provider transaction before marking payment completed.

## PATCH /api/superadmin/tenants/:id/subscription/plan — inventory 439 and 440

Handler switchTenantSubscription. It independently requires a platform Super Admin role. Body plan is lowercased and required; missing plan returns 400. It calls switchTenantSubscriptionPlan, which validates tenant ObjectId and plan key, loads Organization, changes the plan/seats, and preserves the existing Organization renewal date. A suspended organization is changed to active; other statuses remain as-is. It upserts Subscription in platform bypass context with the new plan/seats and status active. Success is 200 {success:true,message,tenant,subscription}; the message states the prior and new plan and that the renewal period was preserved. Errors go to next(error).

**Plan catalogue inconsistency:** TENANT_PLANS in superAdminTenantController.js lists seats starter 5, professional 20, business 50, enterprise 100. PLAN_SEATS in tenantSubscriptionService.js uses starter 5, professional 15, business 50, enterprise 250. Activation and plan switching use PLAN_SEATS, so professional and enterprise seat counts can differ from the public plan catalogue and tenant-creation path.

## DELETE /api/superadmin/tenants/:id — inventory 441 and 442

Handler deleteTenant. Requires a valid ObjectId path id and body.confirmation exactly "DELETE"; otherwise 400. It independently checks req.user.role or legacyRole against super_admin/superadmin; otherwise 403. Missing organization returns 404. It refuses deletion when slug is platform/system/superadmin/super-admin or settings.isPlatform/settings.platform is true.

The handler lists Mongo collections and, in a transaction, deletes documents whose tenantId matches the tenant ObjectId from every collection except system.* and organizations, then deletes the Organization record. Success is 200 {success:true,deleted:true,tenantId,message}. Errors go to next(error); the session is ended in finally.

**Deletion scope:** this is a broad hard delete of tenantId-tagged Mongo documents, not a soft delete. It does not inspect collection-specific retention rules in this handler, and records lacking tenantId are not removed. Non-Mongo assets/files are not addressed by this code. Mongo transaction support is required.

## GET /api/superadmin/subscription-payments — inventory 443 and 444

Handler listSubscriptionPayments. It independently requires a platform Super Admin role, reads SubscriptionPayment.find({}) in platform bypass context, sorts newest first and limits the response to 100. Success is 200 {success:true,payments}. There is no pagination, query filter or count metadata. Errors go to next(error).

## Model and service semantics

SubscriptionPayment stores tenantId, userId, plan, amount/currency, provider/status, phone, checkout/merchant IDs, M-Pesa receipt, transactionReference, paidAt, periodDays, failureReason and metadata. It has a partial unique index on provider + non-empty transactionReference and a tenant/status/createdAt index. Subscription stores one record per tenant, plan/status/provider, seat count and period/trial dates.

activateTenantSubscription validates tenant ID and plan, sets Organization.status active and renewal date, upserts Subscription as active, and marks a supplied payment completed. It does not independently verify provider settlement. switchTenantSubscriptionPlan changes plan/seats and keeps the existing renewal date. The service's PLAN_SEATS values differ from the tenant controller's TENANT_PLANS catalogue for professional and enterprise.

## Test evidence and limitations

No focused tests for approveTenantSubscription, switchTenantSubscription, deleteTenant or listSubscriptionPayments were found in the searched paths. This is source tracing only; no tenant deletion, subscription activation, plan switch or payment completion was executed.
