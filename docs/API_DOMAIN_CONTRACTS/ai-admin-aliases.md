# `/api/ai/admin` route contracts

## Security and mount behavior

`server/routes/index.js` mounts `aiRoutes.js` at `/api/ai`. Router-wide `resolveTenant` runs before each route's `protect`; each handler then calls `requireTenantId()` directly or through its services. Unlike `/api/admin-ai/*`, these routes do **not** install `checkPermission("analytics.view")` or an administrator role check. Therefore any authenticated user with a valid tenant context can reach these admin-labeled endpoints; tenant filters constrain data to that tenant, but do not restrict roles. This is an observed access-control gap, not an assumption. The admin-AI client uses the permission-checked `/admin-ai` paths, so no first-party caller for `/ai/admin/*` was found.

## GET `/api/ai/admin/dashboard` (entry 159)

No query/body/path fields. `getAIDashboard` requires tenant and in parallel counts tenant non-deleted bookings, pending-payment bookings, non-deleted tours, customer Users, non-deleted vehicles, and reviews; revenue comes from `getBookingRevenueMetrics` (posted journal revenue). Success 200 `{success:true,data:{bookings,revenue,pendingPayments,tours,customers,vehicles,reviews}}`. It performs no AI provider call or writes. Errors go to central handler. Revenue counts are snapshots, not transactionally consistent. This shares the controller with permission-checked `/api/admin-ai/dashboard`, but the route chain is materially weaker.

## POST `/api/ai/admin/query` (entry 160)

JSON body reads `message`; there is no explicit required/type/length validation. It counts tenant bookings, payments, tours, vehicles, reviews, composes a prompt, and calls `generateTravelAdvice(context,req.user)`. Success 200 `{success:true,data:{reply}}`. That service may call OpenAI when configured and falls back to deterministic response on provider errors. If booking intent is detected it may create a pending Booking draft through `createAIBookingDraft` without reserving capacity. No rate limiter, admin permission gate, transaction, or explicit body validation is mounted here. Tenant, DB, search/draft errors are centrally handled; provider error is normally caught and falls back. This controller is shared with `/api/admin-ai/query`, which adds `analytics.view` permission but still has no route-level rate limit.

## GET `/api/ai/admin/analytics` and `/briefing` (entries 161–162)

No request fields. These reuse `getAIAnalytics` and `getAIBriefing`, also mounted under `/api/admin-ai/*`. Both require tenant and aggregate/count Booking, Payment, Tour, Review data. Analytics returns `{success:true,data:{monthlyRevenue,bookingActivity,topTours,bookingStatus,totalTours,recentBookings}}`; briefing returns `{success:true,data:{summary,metrics:{pendingBookings,confirmedBookings,paidBookings,revenue,rating,totalTours},recommendations}}`. Errors reach centralized handling; no writes/provider calls in these two handlers. See [admin AI contracts](admin-ai.md) for aggregation definitions and known metric caveats. Their `/ai/admin/*` variants lack the permission gate present at `/admin-ai/*`.

Source: `server/routes/aiRoutes.js`, `server/routes/adminAIRoutes.js`, `server/controllers/adminAIController.js`, `adminAIAnalyticsController.js`, `adminAIBriefingController.js`, `services/aiService.js`, `services/aiBookingDraftService.js`, tenant query helpers. No dedicated endpoint tests were found for these alias paths; source review only.
