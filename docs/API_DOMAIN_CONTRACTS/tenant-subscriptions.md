# Tenant subscription and M-Pesa checkout API contracts

## Route boundary

server/routes/index.js mounts tenantSubscriptionRoutes at /subscription. The child router applies protect then resolveTenant before all declarations. Authenticated tenant users are bound to their tenant by the token and tenant resolver. The controller uses req.tenantId or req.user.tenantId for tenant-scoped subscription/payment records.

## GET /api/subscription — inventory 512

Handler getTenantSubscription. Requires a selected tenant; absence returns 400 {success:false,message:"No tenant is selected."}. Missing Organization returns 404. It reads Organization, the tenant's Subscription and the latest 10 SubscriptionPayment records sorted newest first. Plan resolves from Organization.subscription.plan, then Subscription.plan, then starter. It loads platform-configured plan prices, resolved feature IDs and the feature catalogue. Success is 200 {success:true,tenant,subscription,plan,amountDue,planPrices,features,featureCatalog,payments}. Errors go to next(error). Any authenticated tenant user can read the subscription summary and payment history; the handler does not require admin role.

## POST /api/subscription/mpesa — inventory 513

Handler startTenantSubscriptionPayment. Requires tenantId and admin/administrator/super_admin/superadmin role; otherwise 403. Body plan is lowercased; phone is body.phone or req.user.phone. It loads the configured price for the selected plan and requires a positive integer KES amount; missing/invalid price returns 400. It delegates to initiateTenantMpesaPayment and returns 200 {success:true,message,payment,data}.

The service verifies Organization exists, validates the plan, requires legacy platform-level M-Pesa environment credentials and callback URL, normalizes Kenyan phone numbers to 2547/2541 format, generates Daraja OAuth credentials/timestamp/password, creates a pending SubscriptionPayment, and sends an STK Push to the configured Daraja endpoint with a 30-second timeout. It stores MerchantRequestID and CheckoutRequestID from the provider response. On provider failure it marks the payment failed, stores failureReason and throws an error. This route initiates a payment request; it does not itself activate the subscription. Settlement depends on the callback flow.

**Credential-scope note:** the subscription checkout service uses legacy platform environment variables from server/config/mpesa.js (MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL). It does not use the per-tenant PaymentGatewayConfig that powers ordinary tenant M-Pesa gateway settings. Platform subscription checkout therefore requires platform Daraja credentials even when a tenant has its own M-Pesa configuration.

## GET /api/subscription/payment/:checkoutRequestId — inventory 514

Handler getTenantSubscriptionPaymentStatus. Reads checkoutRequestId from the path and looks up SubscriptionPayment by both checkoutRequestID and req.tenantId/req.user.tenantId. Missing or cross-tenant payment returns 404 {success:false,message:"Subscription payment not found."}. Success is 200 {success:true,payment}. It does not poll Daraja or refresh settlement; it returns the persisted local record. Any authenticated tenant user can read a payment in the same tenant; no additional role check is applied.

## Data model and limitations

SubscriptionPayment is tenant-scoped and stores plan, amount/currency, provider/status, phone, checkout/merchant request IDs, M-Pesa receipt, transactionReference, paidAt, periodDays and failure metadata. A partial unique index protects non-empty provider + transactionReference pairs. Subscription is one record per tenant with plan/status/provider, seats and trial/current-period dates. The M-Pesa service's provider callback path is outside these three route handlers; a pending payment remains pending until callback processing updates it.

No focused tenantSubscriptionRoutes/controller tests were found in searched paths. No STK Push or payment status request was executed during this review.
