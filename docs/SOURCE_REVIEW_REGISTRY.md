# Source review registry

This is an explicit evidence list for implementation-focused explanations. `SOURCE-VERIFIED` means the cited behavior was compared with the current implementation for the named critical path; it does not certify every line or every possible branch in the whole file. Files outside this list remain classified by navigation type in [SOURCE_FILE_INDEX.md](SOURCE_FILE_INDEX.md), not as deeply reviewed. No file is certified exhaustively reviewed line by line.

| Source file | Classification | Explanation | Review scope |
|---|---|---|---|
| `client/src/context/AuthContext.jsx` | SOURCE-VERIFIED | [Auth context](code-explanations/frontend/auth-context.md) | Auth state, token/session handling and downstream API context |
| `client/src/pages/Checkout.jsx` | SOURCE-VERIFIED | [Checkout state](code-explanations/frontend/checkout-state.md) | Query/mutation state, checkout actions and payment UI flow |
| `server/controllers/authController.js` | SOURCE-VERIFIED | [Auth controller](code-explanations/backend/auth-controller.md) | Registration/login/password reset and session response behavior |
| `server/controllers/customerBookingController.js` | SOURCE-VERIFIED | [Customer booking controller](code-explanations/backend/customer-booking-controller.md) | Booking creation, price inputs, capacity and compensation ordering |
| `server/services/customerBookingReservation.js` | SOURCE-VERIFIED | [Customer booking reservation helper](code-explanations/backend/customer-booking-reservation.md) | Capacity-first ordering and compensating writes; excludes crash recovery and datastore concurrency proof |
| `server/tests/customerBookingReservation.test.js` | SOURCE-VERIFIED | [Reservation regression tests](code-explanations/backend/customer-booking-reservation-test.md) | Six focused helper tests cover reservation, update, booking, compensation and success control flow |
| `server/controllers/adminHeroController.js` | SOURCE-VERIFIED | [Admin hero slide contracts](API_DOMAIN_CONTRACTS/admin-hero.md) | Four tenant-scoped hero CRUD handlers and payload mapping |
| `server/controllers/adminPackageController.js` | SOURCE-VERIFIED | [Admin tour package contracts](API_DOMAIN_CONTRACTS/admin-packages.md) | Package field allowlist, normalization, validation and CRUD side effects |
| `server/controllers/adminReviewController.js` | SOURCE-VERIFIED | [Admin review moderation contracts](API_DOMAIN_CONTRACTS/admin-reviews.md) | Moderation writes and separate tour rating recalculation |
| `server/controllers/adminRoleController.js` | SOURCE-VERIFIED | [Admin role and permission contracts](API_DOMAIN_CONTRACTS/admin-roles.md) | Role CRUD, permission hydration, defaults bootstrap and alias migration scope |
| `server/controllers/adminDashboardTenantController.js` | SOURCE-VERIFIED | [Admin booking and revenue analytics](API_DOMAIN_CONTRACTS/admin-analytics.md) | Booking status aggregation and posted-journal revenue response |
| `server/controllers/adminTourController.js` | SOURCE-VERIFIED | [Admin tour contracts](API_DOMAIN_CONTRACTS/admin-tours.md) | `getAllTours`, `getTour`, and `restoreTour` request, tenant, response and side-effect paths |
| `server/controllers/agentBookingController.js` | SOURCE-VERIFIED | [Agent booking API contracts](API_DOMAIN_CONTRACTS/agent-bookings.md) | Five list/detail/create/status/cancel handlers, tenant/agent ownership, lifecycle and consistency gaps |
| `server/middleware/agentMiddleware.js` | SOURCE-VERIFIED | [Agent booking API contracts](API_DOMAIN_CONTRACTS/agent-bookings.md) | Authenticated agent profile lookup, status gates, email-link repair, and pending approval behavior |
| `server/services/commissionService.js` | SOURCE-VERIFIED | [Agent booking API contracts](API_DOMAIN_CONTRACTS/agent-bookings.md) | Commission amount/source, idempotent lookup, tenant checks, and session argument mismatch |
| `server/controllers/tourCrudController.js` | SOURCE-VERIFIED | [Admin tour management](API_DOMAIN_CONTRACTS/admin-tour-management.md) | Tour create/update/delete/publication normalization, transaction and booking-cancellation handoffs |
| `server/controllers/tourResourceAssignmentController.js` | SOURCE-VERIFIED | [Admin tour management](API_DOMAIN_CONTRACTS/admin-tour-management.md) | Shared guide/driver/vehicle assignment validation, overlap checks, transaction and webhook queue |
| `server/services/tourCancellationService.js` | SOURCE-VERIFIED | [Admin tour management](API_DOMAIN_CONTRACTS/admin-tour-management.md) | Tour cancellation/delete transaction across bookings, capacity, resources and notifications |
| `server/controllers/adminUserController.js` | SOURCE-VERIFIED | [Admin user and staff management](API_DOMAIN_CONTRACTS/admin-users.md) | User listing/canonicalization, staff creation compensation, status and deletion handlers |
| `server/controllers/adminUserProfileController.js` | SOURCE-VERIFIED | [Admin user and staff management](API_DOMAIN_CONTRACTS/admin-users.md) | Profile validation, customer-only role restriction and linked staff synchronization |
| `server/controllers/bookingReportController.js` | SOURCE-VERIFIED | [Admin booking reports](API_DOMAIN_CONTRACTS/admin-booking-reports.md) | Date bounds and tour/agent aggregation contract; includes observed cross-tenant join gap |
| `server/routes/adminRoutes.js` | SOURCE-VERIFIED | [Admin booking reports](API_DOMAIN_CONTRACTS/admin-booking-reports.md) | Shared authentication and role gate plus route ordering/permission subgroup boundary |
| `server/controllers/mpesaController.js` | SOURCE-VERIFIED | [M-Pesa controller](code-explanations/backend/mpesa-controller.md) | STK initiation and payment status/controller callback handoff |
| `server/controllers/subscriptionMpesaCallbackController.js` | SOURCE-VERIFIED | [Subscription callback](code-explanations/backend/subscription-mpesa-callback.md) | Subscription callback routing, amount/reference checks and acknowledgment |
| `server/middleware/mpesaCallbackIntegrity.js` | SOURCE-VERIFIED | [Callback integrity](code-explanations/backend/mpesa-callback-integrity.md) | Payload validation and provider-side verification boundary |
| `server/middleware/resolveMpesaCallbackTenant.js` | SOURCE-VERIFIED | [Callback tenant resolution](code-explanations/backend/resolve-mpesa-callback-tenant.md) | Tenant restoration from persisted checkout/payment context |
| `server/middleware/tenantMiddleware.js` | SOURCE-VERIFIED | [Tenant middleware](code-explanations/backend/tenant-middleware.md) | Tenant selection and request-context setup |
| `server/services/paymentLifecycleService.js` | SOURCE-VERIFIED | [Payment lifecycle](code-explanations/backend/payment-lifecycle-service.md) | Verified completion/refund persistence and related side effects |
| `server/controllers/tenantBookingAdminController.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Scoped booking list/detail filtering and cross-record tenant ownership checks |
| `server/controllers/bookingAdminController.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Status transitions, resource assignment, timeline, invoice and notification handlers |
| `server/controllers/adminPaymentController.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Manual payment completion and payment/refund handler paths |
| `server/middleware/resourceTenantGuard.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Tenant/resource assignment and refund amount guard behavior |
| `server/controllers/reconciliationController.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Tenant financial comparison and exception classification algorithm |
| `server/controllers/financeExportController.js` | SOURCE-VERIFIED | [Admin booking/payment operations](code-explanations/backend/admin-booking-payment-operations.md) | Payment CSV/PDF output fields and file response behavior |
| `server/controllers/adminAgentController.js` | SOURCE-VERIFIED | [Admin agent contracts](API_DOMAIN_CONTRACTS/admin-agents.md) | Tenant-scoped list/detail, linked-user activation/approval/status mutations and partial-failure behavior |
| `server/controllers/adminAuthController.js` | SOURCE-VERIFIED | [Admin login contract](API_DOMAIN_CONTRACTS/admin-auth.md) | Tenant/platform account lookup, role gate, token claims and response behavior |
| `server/controllers/adminAIController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Dashboard query and AI query prompt/draft side effects |
| `server/controllers/adminAIAnalyticsController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant analytics aggregation and joined references |
| `server/controllers/adminAIBriefingController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Operational metrics and deterministic recommendations |
| `server/controllers/adminAIIntelligenceController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Conversion/revenue/rating metrics and top-tour aggregation |
| `server/controllers/adminAIAlertsController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Alert thresholds and model-middleware tenant scoping |
| `server/controllers/adminAICustomerSupportController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Customer prompt validation and delegation to AI/draft service |
| `server/controllers/adminAIRevenueController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Revenue metrics, top tours and deterministic recommendations |
| `server/controllers/adminAIBookingRiskController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Risk thresholds and model-middleware tenant scoping |
| `server/controllers/adminAITaskController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant-scoped task upserts, status writes, stale task behavior and update validation boundary |
| `server/controllers/adminAITourPricingController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant booking aggregate, pricing thresholds, and non-deleted-booking filter gap |
| `server/controllers/adminAITourRecommendationController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Customer history lookup, tour exclusion, static recommendation output and deleted-tour inclusion |
| `server/controllers/adminAIFraudController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant payment metrics, threshold alerts and duplicate transaction grouping |
| `server/controllers/adminAISentimentController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant review sample, rating classification and response limitations |
| `server/controllers/adminAIMarketingController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant counts and static campaign response behavior |
| `server/controllers/adminAIFinanceForecastController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant monthly histories, arithmetic averaging and raw threshold behavior |
| `server/controllers/adminAIOperationsController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant metric counts, health formula and operational alert thresholds |
| `server/controllers/adminAISalesController.js` | SOURCE-VERIFIED | [Admin AI contracts](API_DOMAIN_CONTRACTS/admin-ai.md) | Tenant sales metrics, conversion calculation and static sales content |
| `server/controllers/categoryController.js` | SOURCE-VERIFIED | [Admin experience/category contracts](API_DOMAIN_CONTRACTS/admin-experiences.md) | Tenant category seeding, validation, slug normalization and CRUD behavior |
| `server/controllers/adminCouponController.js` | SOURCE-VERIFIED | [Admin coupon contracts](API_DOMAIN_CONTRACTS/admin-coupons.md) | Tenant coupon CRUD, shared normalization/validation and display status serialization |
| `server/controllers/adminDashboardMetricsController.js` | SOURCE-VERIFIED | [Canonical admin dashboard metrics](API_DOMAIN_CONTRACTS/admin-dashboard.md) | Dashboard queries, normalization, financial basis and metric labeling |
| `server/services/bookingRevenueService.js` | SOURCE-VERIFIED | [Canonical admin dashboard metrics](API_DOMAIN_CONTRACTS/admin-dashboard.md) | Posted-journal revenue total plus separate qualifying paid-booking count |
| `server/controllers/adminDestinationController.js` | SOURCE-VERIFIED | [Admin destination contracts](API_DOMAIN_CONTRACTS/admin-destinations.md) | Tenant destination CRUD, image uploads, Cloudinary cleanup and failure boundaries |
| `server/controllers/adminGalleryController.js` | SOURCE-VERIFIED | [Admin gallery contracts](API_DOMAIN_CONTRACTS/admin-gallery.md) | Gallery CRUD, media upload separation, tenant scope and Cloudinary cleanup gaps |
| `server/routes/tourManagerRoutes.js` | SOURCE-VERIFIED | [Tour manager dashboard contract](API_DOMAIN_CONTRACTS/tour-manager-dashboard.md) | Dashboard declaration, protect/tenant/manager middleware and `/tourmanager` plus `/tour-manager` mount aliases |
| `server/controllers/operationsCopilotController.js` | SOURCE-VERIFIED | [Operations Copilot contracts](API_DOMAIN_CONTRACTS/operations-copilot.md) | Tenant-scoped summary reads, bounded aggregation, quote validation and non-persistence |
| `server/services/operationsCopilotCalculations.js` | SOURCE-VERIFIED | [Operations Copilot contracts](API_DOMAIN_CONTRACTS/operations-copilot.md) | Pure money, trip alert, payment follow-up, asset alert and quote calculations |
| `server/models/TourCost.js` | SOURCE-VERIFIED | [Operations Copilot contracts](API_DOMAIN_CONTRACTS/operations-copilot.md) | Tenant/tour cost schema and estimated/committed/actual/cancelled status semantics used by Copilot |
| `server/tests/operationsCopilotAccess.test.js` | SOURCE-VERIFIED | [Operations Copilot contracts](API_DOMAIN_CONTRACTS/operations-copilot.md) | Static route middleware order, tenant-scoped reads and quote non-persistence assertions |
| `server/tests/operationsCopilotCalculations.test.js` | SOURCE-VERIFIED | [Operations Copilot contracts](API_DOMAIN_CONTRACTS/operations-copilot.md) | Pure unit coverage for margins, alerts, follow-up priority, money rounding and quote validation |
| `server/controllers/tourManagerController.js` | SOURCE-VERIFIED | [Tour manager dashboard contract](API_DOMAIN_CONTRACTS/tour-manager-dashboard.md) | Dashboard aggregation, tenant filters, result formatting and revenue service use |

| `server/controllers/agentCustomerController.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | Six customer handlers: allowlist normalization, Agent ownership, tenant assumptions, pagination, CRUD and soft-delete behavior |
| `server/routes/agentCustomerRoutes.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | Plural/singular mounts, shared middleware order, and route-to-handler mapping |
| `server/middleware/agentMiddleware.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | User status/role checks, tenant-scoped Agent lookup, email-link repair, approval not enforced by this router |
| `server/models/Customer.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | Fields and validators exercised by agent customer create/update; not an exhaustive review of all model behavior |

| `server/controllers/agentCustomerController.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | Six dedicated customer handlers, including the list-path shadowing by the earlier broad agent router |
| `server/routes/agentCustomerRoutes.js` | SOURCE-VERIFIED | [Agent customer API contracts](API_DOMAIN_CONTRACTS/agent-customers.md) | Dedicated customer route declarations and shared guards, with effective mount precedence noted |
| `server/controllers/agentPackageController.js` | SOURCE-VERIFIED | [Agent tour package API contracts](API_DOMAIN_CONTRACTS/agent-packages.md) | Agent package listing filters, pagination/sorting, active detail lookup and view increment |
| `server/routes/agentPackageRoutes.js` | SOURCE-VERIFIED | [Agent tour package API contracts](API_DOMAIN_CONTRACTS/agent-packages.md) | Package aliases, middleware order and handler mapping |
| `server/controllers/agentController.js` | SOURCE-VERIFIED | [Agent dashboard API contract](API_DOMAIN_CONTRACTS/agent-dashboard.md) | Dashboard metrics/write behavior and effective list/customer handlers mounted before dedicated routers |
| `server/routes/agentRoutes.js` | SOURCE-VERIFIED | [Agent dashboard API contract](API_DOMAIN_CONTRACTS/agent-dashboard.md) | Dashboard-before-approval order, approval boundary and overlapping nested paths |

| `server/controllers/quotationController.js` | SOURCE-VERIFIED | [Agent quotation API contracts](API_DOMAIN_CONTRACTS/agent-quotations.md) | Quotation create/list/detail/status handlers, ownership filters, calculator and schema interactions |
| `server/services/quotationCalculator.js` | SOURCE-VERIFIED | [Agent quotation API contracts](API_DOMAIN_CONTRACTS/agent-quotations.md) | Item quantity/pricing calculation, rounding, tax and discount behavior |
| `server/models/Quotation.js` | SOURCE-VERIFIED | [Agent quotation API contracts](API_DOMAIN_CONTRACTS/agent-quotations.md) | Fields, validation, status constraints, generated quotation number and tenant scoping relevant to API |
| `server/controllers/agentTourController.js` | SOURCE-VERIFIED | [Agent-created tour API contracts](API_DOMAIN_CONTRACTS/agent-tours.md) | Agent-owned tour CRUD, multipart mapping, slug normalization and soft delete behavior |

| `server/routes/aiRoutes.js` | SOURCE-VERIFIED | [AI admin alias contracts](API_DOMAIN_CONTRACTS/ai-admin-aliases.md) | Tenant/auth middleware sequence, handler aliases, and missing admin permission gate for `/admin/*` paths |

| `server/controllers/aiController.js` | SOURCE-VERIFIED | [AI assistant and booking contracts](API_DOMAIN_CONTRACTS/ai-assistant-booking.md) | Message validation, rate-limited AI delegation and response behavior; excludes live provider verification |
| `server/controllers/aiBookingController.js` | SOURCE-VERIFIED | [AI assistant and booking contracts](API_DOMAIN_CONTRACTS/ai-assistant-booking.md) | Booking completion request pass-through and response envelope |
| `server/services/aiBookingCompleteService.js` | SOURCE-VERIFIED | [AI assistant and booking contracts](API_DOMAIN_CONTRACTS/ai-assistant-booking.md) | Tour lookup, amount/guest transformation, Booking persistence and missing capacity/idempotency checks |

| `server/controllers/airportTransferController.js` | SOURCE-VERIFIED | [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md) | Public/admin catalog CRUD, legacy transfer booking helper and status/resource transition behavior |
| `server/controllers/enhancedAirportTransferBookingController.js` | SOURCE-VERIFIED | [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md) | Passenger/time validation, price calculation, customer resolution, booking and invoice handoff |
| `server/controllers/hospitalityAdminController.js` | SOURCE-VERIFIED | [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md) | Safe transfer and booking lists, tenant-reference hydration and record filtering |
| `server/routes/airportTransferRoutes.js` | SOURCE-VERIFIED | [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md) | Public vs guarded catalog/booking route chains and payment mutation guard placement |
| `server/middleware/paymentMutationGuard.js` | SOURCE-VERIFIED | [Airport transfer API contracts](API_DOMAIN_CONTRACTS/airport-transfers.md) | Blocks direct paymentStatus writes on transfer booking update requests |

| `server/controllers/analyticsController.js` | SOURCE-VERIFIED | [Tenant analytics contracts](API_DOMAIN_CONTRACTS/analytics.md) | Three aggregate endpoints, revenue bases, filters and derived profitability metrics |
| `server/services/analyticsService.js` | SOURCE-VERIFIED | [Tenant analytics contracts](API_DOMAIN_CONTRACTS/analytics.md) | Monthly booking grouping, payment net-of-refund and tenant-scoped popular tour pipeline |

| `server/controllers/apiMonitorController.js` | SOURCE-VERIFIED | [SuperAdmin API monitor](API_DOMAIN_CONTRACTS/superadmin-api-monitor.md) | Fixed endpoint status data, live Mongo connection state, process metrics and failure response |
| `server/routes/apiMonitorRoutes.js` | SOURCE-VERIFIED | [SuperAdmin API monitor](API_DOMAIN_CONTRACTS/superadmin-api-monitor.md) | Platform guard and duplicate mounted path; effective route order checked against superAdminRoutes |
| `server/controllers/customerDashboardController.js` | SOURCE-VERIFIED | [Customer booking management](API_DOMAIN_CONTRACTS/customer-booking-management.md) | Customer ownership feed, pagination, populated response and dashboard KPI calculation |
| `server/controllers/bookingController.js` | SOURCE-VERIFIED | [Customer booking management](API_DOMAIN_CONTRACTS/customer-booking-management.md) | Scoped `cancelBooking` and `rescheduleBooking` paths only; other exports not certified by this entry |
| `server/controllers/bookingTravelDateController.js` | SOURCE-VERIFIED | [Customer booking management](API_DOMAIN_CONTRACTS/customer-booking-management.md) | Tenant/owner lookup, tour/custom-tour range calculation and travel-date persistence |
| `server/routes/bookingRoutes.js` | SOURCE-VERIFIED | [Customer booking management](API_DOMAIN_CONTRACTS/customer-booking-management.md) | Router authentication and role middleware for probe/create/customer/admin operations |

`SOURCE-VERIFIED` refers to source-checking the documented scope. It is narrower than a full-file review; the count of exhaustively line-reviewed files remains zero.

| `server/routes/crmRoutes.js` | SOURCE-VERIFIED | [CRM and custom-tour contracts](API_DOMAIN_CONTRACTS/crm-stats.md) | Tenant/auth/permission middleware chain and sole CRM stats route |
| `server/controllers/crmController.js` | SOURCE-VERIFIED | [CRM and custom-tour contracts](API_DOMAIN_CONTRACTS/crm-stats.md) | Parallel unscoped model counts, response, error path, and unused tenant filter import |
| `server/controllers/customTourRequestController.js` | SOURCE-VERIFIED | [CRM and custom-tour contracts](API_DOMAIN_CONTRACTS/crm-stats.md) | Create/list/quote/assign/convert paths, coercions, tenant ownership, notifications and non-transactional conversion limits |
| `server/routes/customTourRequestRoutes.js` | SOURCE-VERIFIED | [CRM and custom-tour contracts](API_DOMAIN_CONTRACTS/crm-stats.md) | Optional/customer/admin guards and route ordering for custom-tour workflow |

| `server/controllers/customerController.js` | SOURCE-VERIFIED | [Customer and destination contracts](API_DOMAIN_CONTRACTS/customer-directory.md) | Customer list/profile scoped reads, pagination, legacy profile joins and spend summary calculations |
| `server/routes/customerRoutes.js` | SOURCE-VERIFIED | [Customer and destination contracts](API_DOMAIN_CONTRACTS/customer-directory.md) | Customer directory tenant, authentication, admin and permission guards |
| `server/controllers/destinationController.js` | SOURCE-VERIFIED | [Customer and destination contracts](API_DOMAIN_CONTRACTS/customer-directory.md) | Public filters, pagination, escaped search, canonical slug fallback, relation queries and payload limits |
| `server/routes/destinationRoutes.js` | SOURCE-VERIFIED | [Customer and destination contracts](API_DOMAIN_CONTRACTS/customer-directory.md) | Featured/list/detail routes and same-handler slug alias |
| `server/routes/databaseRoutes.js` | SOURCE-VERIFIED | [Customer and destination contracts](API_DOMAIN_CONTRACTS/customer-directory.md) | System database permission and readiness-state-only response |

| `server/controllers/documentController.js` | SOURCE-VERIFIED | [Booking document upload](API_DOMAIN_CONTRACTS/document-upload.md) | Tenant-scoped booking lookup, file metadata persistence, response and orphaned-upload failure boundary |
| `server/routes/documentRoutes.js` | SOURCE-VERIFIED | [Booking document upload](API_DOMAIN_CONTRACTS/document-upload.md) | Authentication, single multipart field and controller pipeline |
| `server/middleware/uploadMiddleware.js` | SOURCE-VERIFIED | [Booking document upload](API_DOMAIN_CONTRACTS/document-upload.md) | Cloudinary storage, MIME/extension checks, filename checks, limits, and unconfigured behavior |

| `server/controllers/driverController.js` | SOURCE-VERIFIED | [Driver operations contracts](API_DOMAIN_CONTRACTS/driver-operations.md) | Driver profile resolution/self-repair, dashboard aggregation and duplicate response aliases |
| `server/controllers/driverTourController.js` | SOURCE-VERIFIED | [Driver operations contracts](API_DOMAIN_CONTRACTS/driver-operations.md) | Assignment-scoped tour reads, guest visibility and date/status transition guards |
| `server/routes/driverRoutes.js` | SOURCE-VERIFIED | [Driver operations contracts](API_DOMAIN_CONTRACTS/driver-operations.md) | JWT, tenant resolution and driverOnly middleware on all five operations |

| `server/controllers/galleryController.js` | SOURCE-VERIFIED | [Public featured gallery](API_DOMAIN_CONTRACTS/gallery-public.md) | Tenant gallery read, placeholder filtering, tour media fallback and response shape |
| `server/routes/galleryRoutes.js` | SOURCE-VERIFIED | [Public featured gallery](API_DOMAIN_CONTRACTS/gallery-public.md) | Public route with tenant-context middleware and no JWT guard |

| `server/controllers/guideController.js` | SOURCE-VERIFIED | [Guide operations](API_DOMAIN_CONTRACTS/guide-operations.md) | Profile recovery/self-provisioning, dashboard lifecycle writes, assignment reads, status rules and report persistence mismatch |
| `server/routes/guideRoutes.js` | SOURCE-VERIFIED | [Guide operations](API_DOMAIN_CONTRACTS/guide-operations.md) | Authentication, tenant resolution and guideOnly gate for six operations |
| `server/models/TourReport.js` | SOURCE-VERIFIED | [Guide operations](API_DOMAIN_CONTRACTS/guide-operations.md) | TourReport required summary, images field, defaults, references and schema relationship to controller photos input |

| `server/controllers/heroController.js` | SOURCE-VERIFIED | [Public hero slides](API_DOMAIN_CONTRACTS/hero-slides.md) | Tenant-required active slide query, ordering, success and caught-error response |
| `server/routes/heroRoutes.js` | SOURCE-VERIFIED | [Public hero slides](API_DOMAIN_CONTRACTS/hero-slides.md) | Public route tenant resolution without user JWT guard |

| `server/controllers/hospitalityPaymentController.js` | SOURCE-VERIFIED | [Hospitality payment contracts](API_DOMAIN_CONTRACTS/hospitality-payments.md) | Payment initiation, Stripe session verification, bank confirmation roles and history aggregation |
| `server/routes/hospitalityPaymentRoutes.js` | SOURCE-VERIFIED | [Hospitality payment contracts](API_DOMAIN_CONTRACTS/hospitality-payments.md) | Six authenticated hospitality payment endpoints |
| `server/services/hospitalityPaymentLifecycleService.js` | SOURCE-VERIFIED | [Hospitality payment contracts](API_DOMAIN_CONTRACTS/hospitality-payments.md) | Tenant booking access, transaction-based completion/failure, overpayment guard, invoice/ledger/notification synchronization |

| `server/controllers/hotelController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Public catalog and booking reads, admin mutations, room validation and booking update transition checks |
| `server/controllers/hotelAvailabilityController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Stay overlap, block, rate plan, stop-sell and availability calculations |
| `server/controllers/adminHotelCreationController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Tenant hotel creation, validation, slug collision handling and duplicate-key error |
| `server/controllers/hospitalityInventoryConcurrencyController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Hotel booking availability path and optimistic version CAS limitation |
| `server/controllers/hospitalityAdminController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Manager hotel catalog and owner/staff booking list access/hydration |
| `server/controllers/hospitalityInventorySyncController.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Legacy accommodation inventory migration and partial-write boundary |
| `server/routes/hotelRoutes.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Static route ordering, middleware differences and effective mounted handlers |
| `server/middleware/paymentMutationGuard.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Blocks caller-controlled paymentStatus in hotel booking update |
| `server/services/hospitalityInventoryConcurrencyService.js` | SOURCE-VERIFIED | [Hotel operations contracts](API_DOMAIN_CONTRACTS/hotel-operations.md) | Atomic version compare-and-increment; no held lock across booking persistence |

| `server/controllers/integrationController.js` | SOURCE-VERIFIED | [Website integration contracts](API_DOMAIN_CONTRACTS/website-integrations.md) | Key lifecycle, public catalog/widget, external booking idempotency/compensation and integration event records |
| `server/controllers/websiteLeadController.js` | SOURCE-VERIFIED | [Website integration contracts](API_DOMAIN_CONTRACTS/website-integrations.md) | Lead creation sanitization, tenant listing filters and allowlisted updates |
| `server/routes/integrationRoutes.js` | SOURCE-VERIFIED | [Website integration contracts](API_DOMAIN_CONTRACTS/website-integrations.md) | Key, public/private v1, permission middleware and rate limit route graph |
| `server/middleware/integrationAuth.js` | SOURCE-VERIFIED | [Website integration contracts](API_DOMAIN_CONTRACTS/website-integrations.md) | Hashed key lookup, origin binding, tenant context and exact permission gates |

| `server/routes/internal/stagingSuperAdminBootstrapRoutes.js` | SOURCE-VERIFIED | [Restricted staging maintenance](API_DOMAIN_CONTRACTS/staging-maintenance.md) | Environment/token gates, per-process one-shot state, request limits and fixed staging target |
| `server/scripts/stagingQaSeedCore.js` | SOURCE-VERIFIED | [Restricted staging maintenance](API_DOMAIN_CONTRACTS/staging-maintenance.md) | URI target validation, deterministic fixtures, durable marker, tenant/reference/payment verification |

| `server/routes/invoiceRoutes.js` | SOURCE-VERIFIED | [Booking invoice PDF download](API_DOMAIN_CONTRACTS/invoice-download.md) | Tenant/JWT gates, booking-owner authorization and file handler route path |
| `server/controllers/invoiceController.js` | SOURCE-VERIFIED | [Booking invoice PDF download](API_DOMAIN_CONTRACTS/invoice-download.md) | Download handler only: tenant booking lookup, expected local PDF path and missing-file behavior |
| `server/controllers/phase3InvoiceAccess.js` | SOURCE-VERIFIED | [Booking invoice PDF download](API_DOMAIN_CONTRACTS/invoice-download.md) | Invoice booking owner/privileged-access decision used by route middleware |

| `server/controllers/mfaController.js` | SOURCE-VERIFIED | [Customer login PIN contracts](API_DOMAIN_CONTRACTS/customer-mfa.md) | Challenge persistence/SMS failure cleanup, expiry, attempt lock, token/cookie issuance and audit side effects |
| `server/routes/mfaRoutes.js` | SOURCE-VERIFIED | [Customer login PIN contracts](API_DOMAIN_CONTRACTS/customer-mfa.md) | Unauthenticated login flow, tenant middleware and dedicated send/verify throttles |
| `server/services/mfaService.js` | SOURCE-VERIFIED | [Customer login PIN contracts](API_DOMAIN_CONTRACTS/customer-mfa.md) | Secure random PIN, bcrypt hash/compare and Kenyan phone normalization |

| `server/controllers/mpesaStatusController.js` | SOURCE-VERIFIED | [M-Pesa status and refund contracts](API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) | Provider query result classification, terminal-state behavior, pending receipt requirement and payment failure transition |
| `server/controllers/mpesaRefundController.js` | SOURCE-VERIFIED | [M-Pesa status and refund contracts](API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) | Refund result/timeout acknowledgement, duplicate handling and failure persistence |
| `server/middleware/resolveMpesaRefundTenant.js` | SOURCE-VERIFIED | [M-Pesa status and refund contracts](API_DOMAIN_CONTRACTS/mpesa-status-refunds.md) | Tenant correlation from stored refund conversation reference; missing reference behavior |

| `server/controllers/notificationController.js` | SOURCE-VERIFIED | [Notification contracts](API_DOMAIN_CONTRACTS/notifications.md) | Staff recipient selection, internal notification persistence, user-owned inbox filtering and mark-as-read path |
| `server/routes/notificationRoutes.js` | SOURCE-VERIFIED | [Notification contracts](API_DOMAIN_CONTRACTS/notifications.md) | Authenticated router and elevated-role recipient/send routes |

| `server/controllers/operationalAssetController.js` | SOURCE-VERIFIED | [Operational asset contracts](API_DOMAIN_CONTRACTS/operational-assets.md) | Tenant CRUD, allowed types, validation, hard delete and lack of role/reference integrity checks |
| `server/routes/operationalAssetRoutes.js` | SOURCE-VERIFIED | [Operational asset contracts](API_DOMAIN_CONTRACTS/operational-assets.md) | Authenticated-only route guard across asset CRUD |
| `server/models/OperationalAsset.js` | SOURCE-VERIFIED | [Operational asset contracts](API_DOMAIN_CONTRACTS/operational-assets.md) | Asset enum, indexed tenant references and sparse unique code index |

| `server/controllers/paymentLinkController.js` | SOURCE-VERIFIED | [Payment link contracts](API_DOMAIN_CONTRACTS/payment-links.md) | Public bearer-token lookup/expiry mutation, outstanding balance cap and finance-protected create/cancel |
| `server/routes/paymentLinkRoutes.js` | SOURCE-VERIFIED | [Payment link contracts](API_DOMAIN_CONTRACTS/payment-links.md) | Public token route order vs finance-protected management routes |
| `server/models/PaymentLink.js` | SOURCE-VERIFIED | [Payment link contracts](API_DOMAIN_CONTRACTS/payment-links.md) | Random token generation, unique token and lifecycle/index fields |

| `server/controllers/paypalController.js` | SOURCE-VERIFIED | [PayPal booking payment contracts](API_DOMAIN_CONTRACTS/paypal-payments.md) | Tenant booking validation, order/capture amount checks, uncertain provider outcomes and webhook state machine |
| `server/routes/paypalRoutes.js` | SOURCE-VERIFIED | [PayPal booking payment contracts](API_DOMAIN_CONTRACTS/paypal-payments.md) | Authenticated initiation/capture throttles and separate webhook route |
| `server/services/paypalService.js` | SOURCE-VERIFIED | [PayPal booking payment contracts](API_DOMAIN_CONTRACTS/paypal-payments.md) | Environment URL selection, encrypted config use, bounded provider calls and webhook signature verification API |

| `server/controllers/privacyController.js` | SOURCE-VERIFIED | [Privacy request contracts](API_DOMAIN_CONTRACTS/privacy-requests.md) | Public request intake, admin list, transition rules, assignment and update-hook limitation |
| `server/controllers/privacyComplianceController.js` | SOURCE-VERIFIED | [Privacy request contracts](API_DOMAIN_CONTRACTS/privacy-requests.md) | Tenant request counts, deadlines and by-type aggregate |
| `server/routes/privacyRoutes.js` | SOURCE-VERIFIED | [Privacy request contracts](API_DOMAIN_CONTRACTS/privacy-requests.md) | Public intake throttle and distinct finance view/manage permissions |
| `server/models/PrivacyRequest.js` | SOURCE-VERIFIED | [Privacy request contracts](API_DOMAIN_CONTRACTS/privacy-requests.md) | Request enums, default due date, generated number, indexes and save hook |

| `server/routes/publicPackageRoutes.js` | SOURCE-VERIFIED | [Public package listing](API_DOMAIN_CONTRACTS/public-packages.md) | Public tenant-resolved package listing route |
| `server/controllers/adminPackageController.js` | SOURCE-VERIFIED | [Public package listing](API_DOMAIN_CONTRACTS/public-packages.md) | `listPublicPackages` scope only: published/active tenant filter and safe media projection; other exports not reviewed by this entry |

| `server/controllers/recommendationController.js` | SOURCE-VERIFIED | [Personalized recommendations](API_DOMAIN_CONTRACTS/recommendations.md) | Nonempty-body gate, response shape and service delegation |
| `server/services/recommendationService.js` | SOURCE-VERIFIED | [Personalized recommendations](API_DOMAIN_CONTRACTS/recommendations.md) | Preference predicates, unfiltered fallback behavior, tenant-plugin reliance and unbounded limit |
| `server/routes/recommendationRoutes.js` | SOURCE-VERIFIED | [Personalized recommendations](API_DOMAIN_CONTRACTS/recommendations.md) | Authenticated tenant-resolved POST route |

| `server/controllers/reviewController.js` | SOURCE-VERIFIED | [Tour review contracts](API_DOMAIN_CONTRACTS/reviews.md) | Public approved review read, completed-booking eligibility and repeatable helpful vote behavior |
| `server/routes/reviewRoutes.js` | SOURCE-VERIFIED | [Tour review contracts](API_DOMAIN_CONTRACTS/reviews.md) | Public read and JWT-protected create/vote routes |
| `server/models/Review.js` | SOURCE-VERIFIED | [Tour review contracts](API_DOMAIN_CONTRACTS/reviews.md) | Rating/comment constraints, unique booking reference, moderation and vote fields |

| `server/controllers/securityController.js` | SOURCE-VERIFIED | [Security status and event APIs](API_DOMAIN_CONTRACTS/security-status.md) | Security endpoints response/error envelopes and service delegation |
| `server/services/securityService.js` | SOURCE-VERIFIED | [Security status and event APIs](API_DOMAIN_CONTRACTS/security-status.md) | Heuristic metrics, 24-hour counts and unscoped cross-tenant queries |
| `server/routes/securityRoutes.js` | SOURCE-VERIFIED | [Security status and event APIs](API_DOMAIN_CONTRACTS/security-status.md) | Tenant/JWT/system.security gates for status and event listing |

| `server/routes/seoRoutes.js` | SOURCE-VERIFIED | [Tenant sitemap contract](API_ENDPOINT_GUIDE/sitemap-xml.md) | Tenant-resolution middleware, public route, XML response and delegated error path |
| `server/services/sitemapService.js` | SOURCE-VERIFIED | [Tenant sitemap contract](API_ENDPOINT_GUIDE/sitemap-xml.md) | Tenant requirement, static sitemap entries, filtered Tour/Destination reads and XML stream/error behavior |
| `server/routes/settingsRoutes.js` | SOURCE-VERIFIED | [Tenant settings contracts](API_ENDPOINT_GUIDE/settings.md) | Shared admin/settings mounts, resolveTenant/protect/settings.manage middleware and handler mapping |
| `server/controllers/settingsController.js` | SOURCE-VERIFIED | [Tenant settings contracts](API_ENDPOINT_GUIDE/settings.md) | `getSettings` and `updateSettings` scope: allowlist, coercion, validation, response/error paths, settings/organization writes; public settings handler excluded |
| `server/routes/staffRoutes.js` | SOURCE-VERIFIED | [Staff management contracts](API_DOMAIN_CONTRACTS/staff-management.md) | Eight mounted route declarations, tenant/auth middleware order and manager/admin role boundaries |
| `server/controllers/staffController.js` | SOURCE-VERIFIED | [Staff management contracts](API_DOMAIN_CONTRACTS/staff-management.md) | Eight mounted handler paths: tenant reads, profile synchronization, staff writes, response/error paths; unmounted exports excluded |
| `server/models/Staff.js` | SOURCE-VERIFIED | [Staff management contracts](API_DOMAIN_CONTRACTS/staff-management.md) | Staff fields used by mounted handlers, tenant/email index, references, identity virtuals and assignment methods; not all lifecycle semantics |


| `server/routes/stripeRoutes.js` | SOURCE-VERIFIED | [Stripe payment contracts](API_DOMAIN_CONTRACTS/stripe-payments.md) | Four mounted Stripe endpoints, webhook-before-child-auth ordering, shared initiation limiter and handler mapping |
| `server/controllers/stripeController.js` | SOURCE-VERIFIED | [Stripe payment contracts](API_DOMAIN_CONTRACTS/stripe-payments.md) | Checkout/session verification, bank-transfer pending state, signed webhook event processing, provider correlation and response/error branches |
| `server/services/stripeWebhookSecurity.js` | SOURCE-VERIFIED | [Stripe payment contracts](API_DOMAIN_CONTRACTS/stripe-payments.md) | Raw-body HMAC-SHA256 verification, timestamp tolerance and constant-time comparison |
| `server/models/StripeWebhookEvent.js` | SOURCE-VERIFIED | [Stripe payment contracts](API_DOMAIN_CONTRACTS/stripe-payments.md) | Tenant/event uniqueness and webhook processing state fields used by Stripe handler |
| `server/tests/stripeWebhookSecurity.test.js` | SOURCE-VERIFIED | [Stripe payment contracts](API_DOMAIN_CONTRACTS/stripe-payments.md) | Valid signature, raw-body tampering, stale timestamp and wrong-secret cases; no controller integration coverage |


| `server/routes/superAdminMaintenanceRoutes.js` | SOURCE-VERIFIED | [Super Admin maintenance contracts](API_DOMAIN_CONTRACTS/superadmin-maintenance.md) | Nine mounted aliases, tenant resolution, JWT protection and super-admin-only boundary |
| `server/controllers/superAdminOperationsController.js` | SOURCE-VERIFIED | [Super Admin maintenance contracts](API_DOMAIN_CONTRACTS/superadmin-maintenance.md) | Backup list/create/download/delete and process-wide cache clearing; file/database/audit failure boundaries |
| `server/models/DatabaseBackup.js` | SOURCE-VERIFIED | [Super Admin maintenance contracts](API_DOMAIN_CONTRACTS/superadmin-maintenance.md) | Backup metadata fields and tenant plugin used by maintenance handlers |


| `server/routes/superAdminOperationsRoutes.js` | SOURCE-VERIFIED | [Super Admin operational contracts](API_DOMAIN_CONTRACTS/superadmin-operations.md) | Tenant resolution, JWT, roles.manage permission, audit middleware and three mounted route declarations |
| `server/controllers/superAdminOperationsController.js` | SOURCE-VERIFIED | [Super Admin operational contracts](API_DOMAIN_CONTRACTS/superadmin-operations.md) | Audit query/filter/count behavior and database/system health response fields; maintenance handlers scoped separately |
| `server/middleware/auditMiddleware.js` | SOURCE-VERIFIED | [Super Admin operational contracts](API_DOMAIN_CONTRACTS/superadmin-operations.md) | Response-finish audit logging, resource mapping, action/status/severity derivation |
| `server/models/AuditLog.js` | SOURCE-VERIFIED | [Super Admin operational contracts](API_DOMAIN_CONTRACTS/superadmin-operations.md) | Tenant ID, audit event fields, enums and indexes relevant to audit listing |


| `server/routes/superAdminRevenueRoutes.js` | SOURCE-VERIFIED | [Super Admin revenue contract](API_DOMAIN_CONTRACTS/superadmin-revenue.md) | Revenue route uses authorize(admin.dashboard) without a local superAdminOnly guard |
| `server/controllers/superAdminRevenueController.js` | SOURCE-VERIFIED | [Super Admin revenue contract](API_DOMAIN_CONTRACTS/superadmin-revenue.md) | Platform-bypass payment aggregation, refund qualification and multi-currency response |
| `server/middleware/permissionMiddleware.js` | SOURCE-VERIFIED | [Super Admin revenue contract](API_DOMAIN_CONTRACTS/superadmin-revenue.md) | admin.dashboard compatibility permission granted to normalized admin role and wildcard platform role behavior |


| `server/routes/superAdminRoleRoutes.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | Four role/permission endpoints and router-wide protect plus roles.manage authorization |
| `server/controllers/superAdminRoleController.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | Role canonicalization, permission hydration, ObjectId validation and permission replacement edge cases |
| `server/models/Role.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | Tenant-scoped role fields, unique tenant/name index and tenant plugin behavior |
| `server/models/Permission.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | Global permission schema, active flag, field limits and indexes |
| `server/tenancy/tenantPlugin.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | Tenant query filtering and write enforcement applied to Role; global model bypass for Permission |
| `server/tenancy/context.js` | SOURCE-VERIFIED | [Super Admin role contracts](API_DOMAIN_CONTRACTS/superadmin-roles.md) | AsyncLocalStorage tenant/bypass context and platform-role handling |
| `server/routes/superAdminRoutes.js` | SOURCE-VERIFIED | [Super Admin dashboard contracts](API_DOMAIN_CONTRACTS/superadmin-dashboard.md) | Dashboard route aliases and router-wide protect/superAdminOnly boundary |
| `server/controllers/superAdminDashboardMetricsController.js` | SOURCE-VERIFIED | [Super Admin dashboard contracts](API_DOMAIN_CONTRACTS/superadmin-dashboard.md) | Platform user counts, tenant-filtered operational counts, currency revenue aggregation and consistency response |
| `server/middleware/superAdminOnly.js` | SOURCE-VERIFIED | [Super Admin dashboard contracts](API_DOMAIN_CONTRACTS/superadmin-dashboard.md) | Explicit authenticated platform-super-admin check |
| `server/services/superAdminDataConsistency.js` | SOURCE-VERIFIED | [Super Admin dashboard contracts](API_DOMAIN_CONTRACTS/superadmin-dashboard.md) | Canonical customer account/profile/admin metric aggregation and legacy tenant reconciliation |


| `server/controllers/superAdminTenantController.js` | SOURCE-VERIFIED | [Super Admin tenant contracts](API_DOMAIN_CONTRACTS/superadmin-tenants.md) | Static plan catalogue, tenant list/detail queries, per-tenant counts, transaction-based tenant/admin/settings creation and validation |
| `server/models/Organization.js` | SOURCE-VERIFIED | [Super Admin tenant contracts](API_DOMAIN_CONTRACTS/superadmin-tenants.md) | Global organization schema, status/subscription/features and domain uniqueness |


| `server/controllers/superAdminMpesaGatewayController.js` | SOURCE-VERIFIED | [Super Admin tenant gateway contracts](API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) | Tenant resolution, platform-tenant exclusion, environment-scoped credential persistence, encryption and Daraja OAuth validation |
| `server/models/PaymentGatewayConfig.js` | SOURCE-VERIFIED | [Super Admin tenant gateway contracts](API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) | Tenant/provider unique config, AES-256-GCM credential encryption and environment-specific M-Pesa fields |
| `server/services/mpesaGatewaySettings.js` | SOURCE-VERIFIED | [Super Admin tenant gateway contracts](API_DOMAIN_CONTRACTS/superadmin-tenant-gateways.md) | Public HTTPS callback URL constraints, sandbox origin matching and safe redacted gateway view |


| `server/controllers/tenantSubscriptionController.js` | SOURCE-VERIFIED | [Super Admin subscription contracts](API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) | Manual activation reference checks, plan switching and global subscription payment listing |
| `server/services/tenantSubscriptionService.js` | SOURCE-VERIFIED | [Super Admin subscription contracts](API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) | Subscription activation, plan seat constants, payment completion behavior and plan switching |
| `server/models/SubscriptionPayment.js` | SOURCE-VERIFIED | [Super Admin subscription contracts](API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) | Payment evidence fields, provider/status enums and unique transaction reference index |
| `server/models/Subscription.js` | SOURCE-VERIFIED | [Super Admin subscription contracts](API_DOMAIN_CONTRACTS/superadmin-subscriptions.md) | Per-tenant subscription schema, period fields and unique tenant index |


| `server/controllers/platformBillingController.js` | SOURCE-VERIFIED | [Super Admin billing contracts](API_DOMAIN_CONTRACTS/superadmin-billing.md) | Platform price fallback, billing config validation/write and feature catalog responses |
| `server/services/planFeatureService.js` | SOURCE-VERIFIED | [Super Admin billing contracts](API_DOMAIN_CONTRACTS/superadmin-billing.md) | Feature catalogue, plan defaults, normalization and strict feature validation |


| `server/controllers/superAdminUserController.js` | SOURCE-VERIFIED | [Super Admin user contracts](API_DOMAIN_CONTRACTS/superadmin-users.md) | User search, role normalization, account creation, status mutation and linked Staff/Agent deletion |
| `server/models/User.js` | SOURCE-VERIFIED | [Super Admin user contracts](API_DOMAIN_CONTRACTS/superadmin-users.md) | Tenant-scoped email index, role/status fields, password hashing and authentication metadata |


| `server/controllers/superAdminBackupController.js` | SOURCE-VERIFIED | [Super Admin operations and backup contracts](API_DOMAIN_CONTRACTS/superadmin-operations-and-backups.md) | Full platform database backup creation, platform-only listing, safe download/delete file paths |


| `server/routes/superAdminToolsRoutes.js` | SOURCE-VERIFIED | [Super Admin tools contracts](API_DOMAIN_CONTRACTS/superadmin-tools.md) | Tenant resolution, authentication, system.security permission and two mounted tool routes |
| `server/controllers/superAdminToolsController.js` | SOURCE-VERIFIED | [Super Admin tools contracts](API_DOMAIN_CONTRACTS/superadmin-tools.md) | Database metadata response and placeholder settings response; unused monitor/system handlers are not mounted |

| `server/routes/superAdminUserRoutes.js` | SOURCE-VERIFIED | [Super Admin user contracts](API_DOMAIN_CONTRACTS/superadmin-users.md) | Duplicate account-creation route declaration; effective earlier superAdminRoutes gate is superAdminOnly |


| `server/routes/systemHealthRoutes.js` | SOURCE-VERIFIED | [Tenant system health contracts](API_DOMAIN_CONTRACTS/system-health.md) | Tenant resolution, authentication, admin role and system.security middleware for both health aliases |
| `server/controllers/systemHealthController.js` | SOURCE-VERIFIED | [Tenant system health contracts](API_DOMAIN_CONTRACTS/system-health.md) | Database, Cloudinary ping and tenant Daraja OAuth health response |
| `server/middleware/adminMiddleware.js` | SOURCE-VERIFIED | [Tenant system health contracts](API_DOMAIN_CONTRACTS/system-health.md) | Reloaded active-user and admin/super-admin role gate |


| `server/routes/tenantBrandingRoutes.js` | SOURCE-VERIFIED | [Tenant branding contracts](API_DOMAIN_CONTRACTS/tenant-branding.md) | Tenant resolution and root GET/PUT declarations; no /branding child route |
| `server/app.js` | SOURCE-VERIFIED | [Tenant branding API contracts](API_DOMAIN_CONTRACTS/tenant-branding.md) | Direct `/api/tenant/branding` mount precedes the consolidated `/api` router; global tenant resolution order |
| `server/controllers/tenantBrandingController.js` | SOURCE-VERIFIED | [Tenant branding contracts](API_DOMAIN_CONTRACTS/tenant-branding.md) | Public branding projection, admin/manager update allowlist and Organization write behavior |


| `server/routes/tenantRoutes.js` | SOURCE-VERIFIED | [Platform tenant contracts](API_DOMAIN_CONTRACTS/platform-tenants.md) | Tenant resolution, authentication and Super Admin-only route boundary |
| `server/controllers/tenantController.js` | SOURCE-VERIFIED | [Platform tenant contracts](API_DOMAIN_CONTRACTS/platform-tenants.md) | Tenant list context bug, creation validation/cleanup, tenant read and allowlisted update |


| `server/routes/tenantSubscriptionRoutes.js` | SOURCE-VERIFIED | [Tenant subscription contracts](API_DOMAIN_CONTRACTS/tenant-subscriptions.md) | Authenticated tenant context and subscription/read/payment route declarations |


| `server/routes/tourAssignmentRoutes.js` | SOURCE-VERIFIED | [Tour resource assignment contract](API_DOMAIN_CONTRACTS/tour-resource-assignment.md) | Tenant resolution, JWT, manager-only gate and assignment route declaration |
| `server/middleware/validateTourAssignmentTenant.js` | SOURCE-VERIFIED | [Tour resource assignment contract](API_DOMAIN_CONTRACTS/tour-resource-assignment.md) | Tenant ownership and ObjectId validation for tour, guide, driver and vehicle inputs |


| `server/controllers/calendarReminderController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant reminder date validation, duplicate protection, list cap and deletion |
| `server/models/CalendarReminder.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant/date/normalized-title unique index and reminder schema |
| `server/controllers/tourLifecycleController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tour completion and booking completion/cancellation transaction paths |
| `server/services/tourResourceLifecycleService.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Staff/vehicle release, assignment reset and booked-slot reset |
| `server/controllers/itineraryController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant itinerary create/list/read/update/soft-delete and one-per-tour checks |
| `server/models/Itinerary.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Itinerary days, status, creator and soft-delete fields plus unique tour index |
| `server/controllers/tourAvailabilityController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant availability reads, booking aggregation and capacity updates |
| `server/controllers/tourReportController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant booking/revenue/status/popular-tour/monthly-journal report aggregation |
| `server/controllers/tenantDirectoryController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant customer/guide/driver/vehicle directory and derived customer metrics |
| `server/controllers/tourManagerBookingController.js` | SOURCE-VERIFIED | [Tour Manager API contracts](API_DOMAIN_CONTRACTS/tour-manager.md) | Tenant booking filters, pagination, populated customer fallback and booking summaries |


| `server/routes/tourReportRoutes.js` | SOURCE-VERIFIED | [Tour catalogue contracts](API_DOMAIN_CONTRACTS/tour-catalogue.md) | Tenant-resolved, authenticated admin/manager report route |
| `server/routes/tourRoutes.js` | SOURCE-VERIFIED | [Tour catalogue contracts](API_DOMAIN_CONTRACTS/tour-catalogue.md) | Public tour reads followed by protected manager CRUD, availability and assignment routes |
| `server/controllers/tourController.js` | SOURCE-VERIFIED | [Tour catalogue contracts](API_DOMAIN_CONTRACTS/tour-catalogue.md) | Public visibility filters, search/category/pagination, tenant-aware reads and manager-owned tour list |
| `server/middleware/tourManagerMiddleware.js` | SOURCE-VERIFIED | [Tour catalogue contracts](API_DOMAIN_CONTRACTS/tour-catalogue.md) | Role allowlist for tour_manager/manager/admin/super_admin |
