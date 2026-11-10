# Admin AI dashboard contract

## Tenant-query enforcement used by these controllers

Several controller queries below omit inline `tenantId` fields. The referenced Mongoose models use `server/tenancy/tenantPlugin.js`: query hooks add the active tenant to `find`/`countDocuments`/`findOneAndUpdate`, aggregation hooks insert a tenant `$match`, and nested `$lookup` stages add tenant scope for tenant collections. Save/insert hooks stamp or validate tenant ownership on created documents. These handlers run after `resolveTenant`; handlers that call `requireTenantId()` fail closed without context, and query hooks also require a valid tenant. Therefore, missing inline predicates in these Mongoose operations do not establish cross-tenant access. Raw collection access and explicit tenant bypasses require separate review.

## `GET /api/admin-ai/dashboard`

- **Mount/access:** `server/routes/index.js` mounts `adminAIRoutes` at `/admin-ai` under `/api`. Router middleware runs `protect` → `resolveTenant`; the route then requires `checkPermission("analytics.view")`. The handler also calls `requireTenantId()`.
- **Request:** No path, query, or body fields are read. Tenant selection follows global resolver/authenticated-user context; callers should use the tenant belonging to the authenticated account.
- **Reads and computation:** Builds `tenantFilter(req)` and concurrently counts non-deleted Bookings, pending-payment non-deleted Bookings, non-deleted Tours, customer Users (`role` or `legacyRole` equal to `customer`), non-deleted Vehicles, and Reviews. Revenue is delegated to `getBookingRevenueMetrics(req)`; its revenue amount comes from tenant posted JournalEntry revenue, while it separately counts qualifying paid bookings. No generative AI provider is called by this dashboard handler despite the route namespace.
- **Success:** HTTP 200 `{success:true,data:{bookings,revenue,pendingPayments,tours,customers,vehicles,reviews}}`; revenue falls back to numeric zero when the service result has no revenue value.
- **Errors/side effects:** Tenant, database, or revenue-service errors are passed to centralized Express error handling. Read-only; no model writes, notifications, or external AI calls.
- **Frontend:** `client/src/api/adminAIApi.js` calls `/admin-ai/dashboard`; admin AI tools consume the wrapper.

Counts are parallel snapshots and are not transactionally consistent with each other. Review count uses the tenant filter but does not explicitly exclude deleted rows, unlike several other counters.

## `POST /api/admin-ai/query`

- **Access:** Same router chain (`protect` → `resolveTenant`) plus `checkPermission("analytics.view")`; handler also requires tenant context.
- **Request:** JSON body property `message` is destructured and passed through without required/type/length validation. No path or query fields.
- **Behavior:** Counts tenant Bookings, Payments, Tours, Vehicles and Reviews; builds a text prompt with those totals and the user message; calls `generateTravelAdvice(context, req.user)`. That service uses configured system company name and tour search, attempts OpenAI Responses API when configured, and has deterministic text fallback on provider/configuration error.
- **Important side effect:** When the composed message has booking intent, `generateTravelAdvice` calls `createAIBookingDraft`; if `findTourForBooking` returns a tour, it creates a pending `Booking` for one guest with a date 30 days ahead, API source, tour price, and current user contact, then returns its booking ID in the generated text. The admin query endpoint can therefore create a booking record even though its own controller only reads counts. This draft path does not reserve inventory slots. `Booking` tenant save middleware stamps/validates the active tenant. It is not a confirmed reservation/payment.
- **Success:** HTTP 200 `{success:true,data:{reply}}`, where reply is the generated/fallback text. No separate booking object is returned.
- **Errors:** No explicit validation response. Tenant/database/search/draft errors propagate to centralized Express handling; OpenAI failure is caught by `generateTravelAdvice` and normally falls back to deterministic text. No transaction spans counts, draft creation, search, or AI generation.
- **Frontend:** `askAdminAI(message)` in `client/src/api/adminAIApi.js` posts `{message}` to this endpoint.

## `GET /api/admin-ai/analytics`

- **Access/request:** Same `protect` → `resolveTenant` → `checkPermission("analytics.view")` chain; handler requires tenant. No path, query, or body fields.
- **Reads:** In parallel, aggregates tenant completed Payments into monthly/yearly sums of `amount`; groups non-deleted tenant Bookings by creation calendar day and returns the earliest sorted 31 groups; groups non-deleted bookings with a non-null tour into top five tour IDs by booking count and `$lookup`s corresponding tour documents; groups bookings by status; counts non-deleted tenant Tours; and reads the ten newest non-deleted tenant bookings with populated tour.
- **Success:** HTTP 200 `{success:true,data:{monthlyRevenue,bookingActivity,topTours,bookingStatus,totalTours,recentBookings}}`. Aggregation row fields are emitted by MongoDB pipelines: monthly `{_id:{month,year},revenue}`, activity `{_id:{day,month,year},bookings}`, top `{_id,bookings,tour}`, status `{_id,count}`.
- **Errors/effects:** Database errors pass to centralized handling. Read-only; no AI model call, writes, time-range filter, currency normalization, or explicit output redaction appears in this handler. Monthly payment aggregation has no deleted-payment exclusion; date grouping is not restricted to a recent interval. Booking aggregation middleware scopes the nested tour `$lookup`; populated tour reads use tenant-aware Mongoose queries.
- **Frontend:** `getAIAnalytics()` in `client/src/api/adminAIApi.js`, consumed by `client/src/pages/admin/AdminAITools.jsx`.

## `GET /api/admin-ai/briefing`

- **Access/request:** Same authenticated tenant and `analytics.view` permission gate; no path, query, or body inputs.
- **Reads:** Counts non-deleted tenant bookings separately for pending status, confirmed status, and `paymentStatus:"paid"`; obtains revenue through `getBookingRevenueMetrics`; computes average rating across tenant Reviews; and counts non-deleted tenant Tours. Reads execute concurrently.
- **Derived output:** Rating is rounded to one decimal, default zero. Recommendations are deterministic: pending bookings prompt follow-up; positive rating below four prompts service review; more than ten paid bookings prompts additional transport; zero tours prompts adding inventory. Summary always labels revenue as KES and says “Today's operations,” although the queries are not limited to today and the amount is not currency-normalized in this handler.
- **Success:** HTTP 200 `{success:true,data:{summary,metrics:{pendingBookings,confirmedBookings,paidBookings,revenue,rating,totalTours},recommendations}}`.
- **Errors/effects:** Read failures go to centralized error handling. No model writes, AI provider call, date range, or transaction.
- **Frontend:** `getAIBriefing()` in `client/src/api/adminAIApi.js`, consumed by `AdminAITools.jsx`.

## `GET /api/admin-ai/intelligence`

- **Access/request:** Authenticated tenant plus `analytics.view`; no path, query, or body fields.
- **Reads:** Parallel counts/aggregates for non-deleted bookings, confirmed-or-completed bookings, failed payments, booking revenue service output, average booking total, top tour by booking count, average Review rating, non-deleted tours, customer users, and non-deleted vehicles. Tenant query/aggregation hooks supply active-tenant filters, including the top-tour lookup. The controller does not repeat explicit tenant predicates in every expression.
- **Derived fields:** Conversion is `confirmedBookings / totalBookings * 100`, rounded to one decimal (or zero). The numerator only includes confirmed/completed while denominator includes all non-deleted bookings. Revenue is the service's revenue or zero. Average booking value and customer rating default to zero; top tour title defaults null. Recommendations are deterministic for any failed payments, conversion below 50% when bookings exist, and average rating below 4.
- **Success:** HTTP 200 `{success:true,data:{conversionRate,confirmedBookings,failedPayments,revenue,averageBookingValue,topTour,customerRating,totalTours,totalCustomers,totalVehicles,totalBookings,recommendations}}`.
- **Errors/effects:** Read/service failures pass to centralized handling. Read-only, no AI provider use, date window, currency normalization, or transactional snapshot.
- **Frontend:** `getAIIntelligence()` in `client/src/api/adminAIApi.js`, consumed by `AdminAITools.jsx`.

## `GET /api/admin-ai/alerts`

- **Access/request:** Router requires JWT, resolves tenant, and applies `checkPermission("analytics.view")`; handler calls `requireTenantId()`. No request fields.
- **Observed query scope:** The controller (which imports but does not use `mergeTenantFilter`) omits inline tenant predicates in its five queries. However, Booking/Payment/Review/Vehicle use `tenantPlugin`, which scopes `countDocuments` and `aggregate` operations to active tenant context. The handler also calls `requireTenantId()` before querying. Under current model middleware, these reads are tenant scoped.
- **Response behavior:** HTTP 200 `{success:true,data:{alerts}}`. Emits warning for any pending bookings; danger for any failed payments; warning when average rating is below 4 (including a zero-rating/no-review case); warning when available vehicles are below 3; success when today's booking count exceeds 5. Alert fields are `{level,title,message}`. Rating message formats one decimal.
- **Failures/effects/frontend:** Query errors pass to centralized handling; read-only. `getAIAlerts()` in `client/src/api/adminAIApi.js` calls the route. Scope depends on model middleware rather than inline predicates in this controller.

## `POST /api/admin-ai/customer-support`

- **Access/request:** Authenticated tenant plus `analytics.view` permission. JSON body `customerMessage` is required by truthiness; optional `tone` defaults to `professional`. Neither field is type-, length-, or enum-validated. No path/query fields.
- **Behavior:** Builds a prompt containing the interpolated tone and customer message and passes it with `req.user` to `generateTravelAdvice`. That service requires tenant context, searches tours, may call OpenAI, and uses deterministic fallback when AI is unavailable. Its booking-intent detection scans the full prompt: if the customer message contains a booking/reservation term and a tour is found, the service may create a pending one-guest booking draft (details above), even though this is framed as reply generation.
- **Success:** HTTP 200 `{success:true,data:{reply}}`.
- **Errors:** Missing/falsy customerMessage returns 400 `{success:false,message:"Customer message required."}`. Service/search/draft errors propagate to centralized handling; provider errors are normally caught by AI service fallback. No write except the conditional draft path, and no transaction.
- **Frontend:** `generateCustomerReply(payload)` in `client/src/api/adminAIApi.js` posts caller payload unchanged.

## `GET /api/admin-ai/revenue-advice`

- **Access/request:** JWT, resolved tenant and `analytics.view` permission; no request fields.
- **Reads:** Counts non-deleted tenant bookings; reads revenue through `getBookingRevenueMetrics`; counts non-deleted tenant tours; aggregates top five non-deleted tenant booking tour IDs by booking count and joins tour records by ID. Tenant aggregation middleware scopes the query and nested join.
- **Rules/response:** Recommendations are deterministic: booking count below 20 → marketing; positive revenue → premium packages; any top tours → focus advertising; any tours → seasonal promotions; otherwise a collect-more-data fallback. Returns HTTP 200 `{success:true,data:{metrics:{totalBookings,totalRevenue,totalTours},topTours,recommendations}}`; revenue defaults to zero. No generative AI call.
- **Failure/effects:** Read/service errors go to centralized handling. Read-only, no date window, currency normalization, or transaction.
- **Frontend:** `getAIRevenueAdvice()` in `client/src/api/adminAIApi.js`.

## `GET /api/admin-ai/booking-risks`

- **Access/request:** Router applies JWT, tenant resolution and `analytics.view` permission. Handler itself does not call `requireTenantId`; request has no path/query/body inputs.
- **Observed query scope:** The controller's four expressions have no inline tenant predicate and it imports but does not use `mergeTenantFilter`. The Booking and Payment models apply tenant scope in their `countDocuments` query hooks. This controller does not call `requireTenantId()` itself, but router-level `resolveTenant` supplies context and model query hooks fail closed when it is missing.
- **Rules/response:** HTTP 200 `{success:true,data:{metrics:{pendingBookings,cancelledBookings,unpaidBookings,oldPendingBookings},risks}}`. Old pending count adds high risk; any unpaid payment adds medium risk; cancelled greater than pending adds cancellation warning; no conditions adds a low “No major booking risks detected” item. Each risk has `level`, `title`, and `message`.
- **Errors/effects/frontend:** Query failures pass to centralized handling. Read-only. `getBookingRiskAnalysis()` in `client/src/api/adminAIApi.js` calls this route. Tenant scoping is supplied by model middleware rather than explicit controller predicates.

## `GET /api/admin-ai/tasks`

- **Access/request:** JWT, tenant resolution and `analytics.view`; no request fields. Handler calls `requireTenantId()`.
- **Behavior/reads:** Counts pending Bookings, pending/failed Payments, and Reviews rated at most 2. These model queries use tenant middleware. It constructs up to three deterministic task records for follow-up, payment review, and poor feedback, then for each runs `AITask.findOneAndUpdate({title}, task, {upsert:true,new:true})`. The AITask query hook scopes the title match to tenant and applies tenantId on upsert. It then reads the current tenant's 20 most recently created AITasks.
- **Success:** HTTP 200 `{success:true,data:[task...]}`. Existing matching title records have their generated title/description/priority/category refreshed; status is not included in the update payload, so an existing task's status is not reset by this update. Generated tasks no longer present in current conditions are not deleted and may remain in the returned list.
- **Failure:** Errors pass to centralized Express handling. This nominal GET has database write side effects (upserts), and the separate counts/upserts/list are not one transaction.
- **Frontend:** `getAITasks()` in `client/src/api/adminAIApi.js` calls `/admin-ai/tasks`.

## `PATCH /api/admin-ai/tasks/:id`

- **Access/request:** Same JWT/tenant/`analytics.view` route chain. Path `id` is used directly in `_id` filter without local ObjectId validation. Body property `status` is written without an allowlist, type check, or `runValidators:true` option.
- **Database/scope:** `mergeTenantFilter(req,{_id:req.params.id})` explicitly merges tenant context, and AITask query middleware independently enforces tenant scope. `findOneAndUpdate` returns the new document; absent/cross-tenant/invalid ID match can produce null.
- **Success:** HTTP 200 `{success:true,data:taskOrNull}` even when no task matched. Mongoose update validators are not enabled in this call, so the model's enum constraint is not explicitly run for this update.
- **Errors/effects/frontend:** Query errors go to centralized handling. `updateAITask(id,status)` in `client/src/api/adminAIApi.js` sends `{status}`. This is a persistent task status write.

## `GET /api/admin-ai/pricing-advice`

- **Access/request:** JWT, resolved tenant and `analytics.view` permission; handler calls `requireTenantId()`. No path/query/body fields.
- **Reads:** Fetches tenant Tours with only `title price` selected. It aggregates tenant Bookings by `tour`; `tenantPlugin` inserts the tenant `$match` even though this pipeline starts at `$group`. The aggregation does not exclude soft-deleted bookings.
- **Rules/response:** For each tour, joins booking count by ID (0 when absent), then returns `{tourId,tour,currentPrice,bookings,action,reason}`. `currentPrice` falls back to zero. At 10+ bookings it recommends increasing price; at 2 or fewer it recommends promotion; otherwise maintains price. HTTP 200 `{success:true,data:[recommendation...]}`. This is a fixed threshold rule, not an AI model call.
- **Errors/effects/frontend:** Query failures pass to centralized handling. Read-only. `getTourPricingAdvice()` in `client/src/api/adminAIApi.js` calls the route.

## `GET /api/admin-ai/recommendations/:customerId`

- **Access/request:** JWT, tenant resolution and `analytics.view`; path `customerId` is used directly in `User.findById`; no query/body fields. Handler requires tenant context. Model query hooks scope user, bookings and tours to the active tenant.
- **Behavior/reads:** Loads customer `name email preferences`; missing/cross-tenant user returns 404. Loads that user's tenant bookings and populates tour, builds IDs of tours already booked, then queries tenant tours whose IDs are not in that set, limits to 10 without explicit sorting, and does not exclude soft-deleted tours in this handler.
- **Success:** HTTP 200 `{success:true,data:{customer:{id,name},recommendations:[{tourId,tour,destination,price,reason}]}}`. Destination uses populated `tour.destination.name` or `"Africa"`; price falls back to zero. The same static reason is returned for every tour; the loaded customer preferences are not used in ranking, and no model/AI recommendation algorithm is called.
- **Errors/effects/frontend:** Invalid query/database errors go to centralized handling; read-only. `getTourRecommendations(customerId)` in `client/src/api/adminAIApi.js` calls this endpoint.

## `GET /api/admin-ai/fraud-monitoring`

- **Access/request:** JWT, tenant resolution and `analytics.view`; handler calls `requireTenantId()`. No request fields. Payment model query/aggregation middleware supplies tenant scope.
- **Reads:** Counts tenant Payments in failed/cancelled states, pending Payments, and Payments with `amount >= 100000`; separately aggregates Payments by `transactionId` and counts groups with more than one record. The aggregation has no status, deletion, or date restriction. `Booking` and `mergeTenantFilter` imports are unused.
- **Rules/response:** Failed count >0 emits medium failed-attempt alert; pending >5 emits medium backlog alert; large-payment count >0 emits high review alert; any duplicate groups emits high duplicate alert; otherwise one low clear-status alert. HTTP 200 `{success:true,data:{metrics:{failedPayments,pendingPayments,largePayments,duplicatePayments},alerts}}`, where duplicatePayments is the number of grouped patterns, not number of extra transactions.
- **Failure/effects/frontend:** Database errors pass to centralized handling. Read-only. `getAIFraudMonitoring()` in `client/src/api/adminAIApi.js` calls the endpoint. Because null/missing `transactionId` values are grouped together, multiple such records can count as a duplicate pattern; threshold is raw stored amount with no currency normalization.

## `GET /api/admin-ai/sentiment`

- **Access/request:** JWT, resolved tenant and `analytics.view`; handler calls `requireTenantId()`. No path/query/body. Reads the tenant's 100 newest Reviews via `tenantFilter(req)`.
- **Classification:** Rating >=4 positive; exactly 3 neutral; all other values (including missing/zero) negative. Negative records become complaint snippets, capped at ten in response. The handler accesses `review.user?.name` but does not populate `user`, so ordinary lean query results do not provide that name and the displayed customer generally falls back to `Customer`.
- **Recommendations:** Any negative ratings produce follow-up recommendation; neutral > positive adds experience warning; positive > negative adds maintain-quality message; when none applies, returns no-major-issues fallback. Ties may yield fallback despite nonzero sentiment categories.
- **Success:** HTTP 200 `{success:true,data:{metrics:{totalReviews,positive,neutral,negative},complaints:[{customer,comment}],recommendations}}`.
- **Errors/effects/frontend:** Read failures pass to centralized handling. Read-only; no AI model or external provider call. `getAISentimentAnalysis()` in `client/src/api/adminAIApi.js` calls the route.

## `GET /api/admin-ai/marketing-campaigns`

- **Access/request:** JWT, resolved tenant and `analytics.view`; no path/query/body. Controller does not call `requireTenantId`, but Tour/Booking/User `countDocuments` hooks apply tenant scope and fail closed without tenant context.
- **Reads:** Parallel counts of tenant Tours, tenant Bookings, and tenant Users whose `role` is exactly `customer` (it does not include legacyRole in this predicate). No soft-delete filters are supplied by the controller.
- **Success:** HTTP 200 `{success:true,data:{businessMetrics:{tours,bookings,customers},campaigns:[...]}}`. Returns three hard-coded campaign objects for Africa adventure/new travelers, returning customers, and low-season budget travelers, each with title/audience/objective/offer/message. Metrics do not affect campaign text.
- **Errors/effects/frontend:** Count errors go to centralized handling. Read-only; the name does not correspond to generated AI or an external marketing send. `adminAIApi.js` exports this request wrapper for the marketing-campaigns route.

## `GET /api/admin-ai/financial-forecast`

- **Access/request:** JWT, tenant resolution, `analytics.view`, and handler `requireTenantId()`. No request fields.
- **Reads:** Aggregates tenant completed Payments into monthly/yearly amount sums, and tenant Bookings into monthly/yearly counts. The tenant aggregate hook supplies scope. There is no date window or deleted-record exclusion; only months with matching records appear in each history.
- **Forecast:** Sums each history and rounds its arithmetic mean across returned month buckets (not across calendar months) to produce `nextMonthRevenue` and `nextMonthBookings`. `growthPotential` is Positive when average revenue >0, otherwise Insufficient data. Recommendations ask for resource preparation when average bookings >0 and marketing when average revenue <100000; otherwise a monitor-performance fallback. This is fixed arithmetic, not a predictive model.
- **Success:** HTTP 200 `{success:true,data:{history:{revenueHistory,bookingHistory},forecast,recommendations}}`.
- **Errors/effects/frontend:** Aggregation failures pass to centralized handling. Read-only. `getAIFinancialForecast()` in `client/src/api/adminAIApi.js` calls this route. Revenue threshold is applied to raw amount without currency normalization.

## `GET /api/admin-ai/operations-center`

- **Access/request:** JWT, tenant resolution, `analytics.view`, and handler `requireTenantId()`; no request fields. Mongoose query/aggregate middleware scopes each metric to tenant.
- **Reads:** Parallel counts of bookings, pending bookings, confirmed bookings, vehicles with `availability:"available"`, and tours; aggregates completed Payment amount and average Review rating. No soft-delete filters or date bounds are supplied in these expressions.
- **Derived output:** Rating is rounded to one decimal or defaults to zero. Alerts: pending >10 gives high backlog; vehicles <3 gives medium availability; rating <4 gives medium satisfaction; otherwise low healthy. Health score is `max(0,100 - pendingBookings*2 - (5-rating)*10)`, with no upper cap needed for the normal 0–5 rating range. Recommended actions are three fixed strings unrelated to the computed metrics.
- **Success:** HTTP 200 `{success:true,data:{healthScore,metrics:{totalBookings,pendingBookings,confirmedBookings,revenue,availableVehicles,totalTours,customerRating},alerts,recommendedActions}}`.
- **Errors/effects/frontend:** Query errors pass to centralized handling; read-only, no AI service or writes. `getAIOperationsCenter()` in `client/src/api/adminAIApi.js` calls the route.

## `GET /api/admin-ai/sales-assistant`

- **Access/request:** JWT, tenant resolution, `analytics.view`, and handler `requireTenantId()`; no request fields. Booking/User counts use tenant query middleware; tours use explicit `tenantFilter(req)`.
- **Reads:** Counts all tenant bookings, counts tenant bookings with status `confirmed` (the internal variable is named completedBookings), counts Users with role exactly `customer`, and fetches up to ten tenant Tours selecting title/price/destination. No explicit soft-delete filters or tour sorting.
- **Derived output:** Conversion is confirmed bookings divided by all bookings, as a percentage rounded to one decimal (or zero). Recommends faster enquiry follow-up below 30%, loyalty offers when customers >0, and always adds a high-value safari promotion recommendation. Returns three fixed sales script strings.
- **Success:** HTTP 200 `{success:true,data:{metrics:{totalBookings,confirmedBookings,customers,conversionRate},recommendedTours,recommendations,salesScripts}}`.
- **Errors/effects/frontend:** Query errors pass to centralized handling. Read-only and deterministic; despite the assistant label, no AI/provider call occurs. `getAISalesAssistant()` in `client/src/api/adminAIApi.js` calls the route.
