# API route inventory (source-derived)

This inventory extracts literal Express `router.get/post/put/patch/delete/all` declarations and applies router mounts found in `server/routes/index.js` and direct mounts in `server/app.js`. It includes only routers observed mounted by these entry points. It is a route index, not an OpenAPI contract: request schemas, response bodies and middleware semantics remain in the linked source. Duplicate aliases are retained.

Mounted method/path inventory rows: **629**. The route guide comparison finds **588 unique route-module/method/path declarations** and **41 additional rows caused by repeated router mounts/aliases**. The table preserves repeated mounts rather than collapsing them, because the same module may be reachable through more than one mounted prefix. **81 route declarations in unmounted modules** are listed separately and are not live paths through the observed application mounts.

| Method | Path | Route source |
|---|---|---|
| `GET` | `/api/admin-ai/dashboard` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `POST` | `/api/admin-ai/query` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/analytics` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/briefing` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/intelligence` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/alerts` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `POST` | `/api/admin-ai/customer-support` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/revenue-advice` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/booking-risks` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/tasks` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `PATCH` | `/api/admin-ai/tasks/:id` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/pricing-advice` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/recommendations/:customerId` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/fraud-monitoring` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/sentiment` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/marketing-campaigns` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/financial-forecast` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/operations-center` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin-ai/sales-assistant` | [`adminAIRoutes.js`](../server/routes/adminAIRoutes.js) |
| `GET` | `/api/admin/agents` | [`adminAgentRoutes.js`](../server/routes/adminAgentRoutes.js) |
| `GET` | `/api/admin/agents/:id` | [`adminAgentRoutes.js`](../server/routes/adminAgentRoutes.js) |
| `PUT` | `/api/admin/agents/:id/approve` | [`adminAgentRoutes.js`](../server/routes/adminAgentRoutes.js) |
| `PUT` | `/api/admin/agents/:id/status` | [`adminAgentRoutes.js`](../server/routes/adminAgentRoutes.js) |
| `POST` | `/api/admin/auth/login` | [`adminAuthRoutes.js`](../server/routes/adminAuthRoutes.js) |
| `GET` | `/api/admin/bookings` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `GET` | `/api/admin/bookings/:id` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `PUT` | `/api/admin/bookings/:id/status` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `PUT` | `/api/admin/bookings/:id/assign` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `PUT` | `/api/admin/bookings/:id/payment` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `GET` | `/api/admin/bookings/:id/timeline` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `GET` | `/api/admin/bookings/:id/invoice` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `POST` | `/api/admin/bookings/:id/notify` | [`adminBookingRoutes.js`](../server/routes/adminBookingRoutes.js) |
| `GET` | `/api/admin/experiences` | [`adminCategoryRoutes.js`](../server/routes/adminCategoryRoutes.js) |
| `POST` | `/api/admin/experiences` | [`adminCategoryRoutes.js`](../server/routes/adminCategoryRoutes.js) |
| `PUT` | `/api/admin/experiences/:id` | [`adminCategoryRoutes.js`](../server/routes/adminCategoryRoutes.js) |
| `DELETE` | `/api/admin/experiences/:id` | [`adminCategoryRoutes.js`](../server/routes/adminCategoryRoutes.js) |
| `GET` | `/api/admin/coupons` | [`adminCouponRoutes.js`](../server/routes/adminCouponRoutes.js) |
| `POST` | `/api/admin/coupons` | [`adminCouponRoutes.js`](../server/routes/adminCouponRoutes.js) |
| `PUT` | `/api/admin/coupons/:id` | [`adminCouponRoutes.js`](../server/routes/adminCouponRoutes.js) |
| `DELETE` | `/api/admin/coupons/:id` | [`adminCouponRoutes.js`](../server/routes/adminCouponRoutes.js) |
| `GET` | `/api/admin/dashboard/metrics` | [`adminDashboardRoutes.js`](../server/routes/adminDashboardRoutes.js) |
| `GET` | `/api/admin/dashboard` | [`adminDashboardRoutes.js`](../server/routes/adminDashboardRoutes.js) |
| `GET` | `/api/admin/destinations` | [`adminDestinationRoutes.js`](../server/routes/adminDestinationRoutes.js) |
| `GET` | `/api/admin/destinations/:id` | [`adminDestinationRoutes.js`](../server/routes/adminDestinationRoutes.js) |
| `POST` | `/api/admin/destinations` | [`adminDestinationRoutes.js`](../server/routes/adminDestinationRoutes.js) |
| `PUT` | `/api/admin/destinations/:id` | [`adminDestinationRoutes.js`](../server/routes/adminDestinationRoutes.js) |
| `DELETE` | `/api/admin/destinations/:id` | [`adminDestinationRoutes.js`](../server/routes/adminDestinationRoutes.js) |
| `POST` | `/api/admin/gallery/upload` | [`adminGalleryRoutes.js`](../server/routes/adminGalleryRoutes.js) |
| `GET` | `/api/admin/gallery` | [`adminGalleryRoutes.js`](../server/routes/adminGalleryRoutes.js) |
| `POST` | `/api/admin/gallery` | [`adminGalleryRoutes.js`](../server/routes/adminGalleryRoutes.js) |
| `PUT` | `/api/admin/gallery/:id` | [`adminGalleryRoutes.js`](../server/routes/adminGalleryRoutes.js) |
| `DELETE` | `/api/admin/gallery/:id` | [`adminGalleryRoutes.js`](../server/routes/adminGalleryRoutes.js) |
| `GET` | `/api/admin/hero` | [`adminHeroRoutes.js`](../server/routes/adminHeroRoutes.js) |
| `POST` | `/api/admin/hero` | [`adminHeroRoutes.js`](../server/routes/adminHeroRoutes.js) |
| `PUT` | `/api/admin/hero/:id` | [`adminHeroRoutes.js`](../server/routes/adminHeroRoutes.js) |
| `DELETE` | `/api/admin/hero/:id` | [`adminHeroRoutes.js`](../server/routes/adminHeroRoutes.js) |
| `GET` | `/api/admin/packages` | [`adminPackageRoutes.js`](../server/routes/adminPackageRoutes.js) |
| `POST` | `/api/admin/packages` | [`adminPackageRoutes.js`](../server/routes/adminPackageRoutes.js) |
| `PUT` | `/api/admin/packages/:id` | [`adminPackageRoutes.js`](../server/routes/adminPackageRoutes.js) |
| `DELETE` | `/api/admin/packages/:id` | [`adminPackageRoutes.js`](../server/routes/adminPackageRoutes.js) |
| `GET` | `/api/admin/payments` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/reconciliation` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/stats` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/analytics` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/export/csv` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/export/pdf` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/payments/:id` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `PATCH` | `/api/admin/payments/:id/status` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `PATCH` | `/api/admin/payments/:id` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `PATCH` | `/api/admin/payments/:id/refund` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `PUT` | `/api/admin/payments/:id/refund` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `POST` | `/api/admin/payments/:id/refund` | [`adminPaymentRoutes.js`](../server/routes/adminPaymentRoutes.js) |
| `GET` | `/api/admin/reviews` | [`adminReviewRoutes.js`](../server/routes/adminReviewRoutes.js) |
| `PATCH` | `/api/admin/reviews/:id/approve` | [`adminReviewRoutes.js`](../server/routes/adminReviewRoutes.js) |
| `PATCH` | `/api/admin/reviews/:id/reject` | [`adminReviewRoutes.js`](../server/routes/adminReviewRoutes.js) |
| `DELETE` | `/api/admin/reviews/:id` | [`adminReviewRoutes.js`](../server/routes/adminReviewRoutes.js) |
| `GET` | `/api/admin/roles` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `GET` | `/api/admin/roles/permissions/all` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `GET` | `/api/admin/roles/:id` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `POST` | `/api/admin/roles` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `PUT` | `/api/admin/roles/:id` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `PATCH` | `/api/admin/roles/:id` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `DELETE` | `/api/admin/roles/:id` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `PUT` | `/api/admin/roles/:id/permissions` | [`adminRoleRoutes.js`](../server/routes/adminRoleRoutes.js) |
| `GET` | `/api/admin/bookings/analytics` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/revenue/analytics` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `PUT` | `/api/admin/bookings/:id/refund` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `POST` | `/api/admin/bookings/:id/refund` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `PUT` | `/api/admin/refunds/:id/process` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/users` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `POST` | `/api/admin/users/staff` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/users/analytics` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `PATCH` | `/api/admin/users/:id/status` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `PUT` | `/api/admin/users/:id/status` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `PUT` | `/api/admin/users/:id` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `DELETE` | `/api/admin/users/:id` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/reports/daily` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/reports/monthly` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/reports/tours` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/reports/agents` | [`adminRoutes.js`](../server/routes/adminRoutes.js) |
| `GET` | `/api/admin/tours` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `GET` | `/api/admin/tours/:id` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `POST` | `/api/admin/tours` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PUT` | `/api/admin/tours/:id` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `DELETE` | `/api/admin/tours/:id` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PATCH` | `/api/admin/tours/:id/publication` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PATCH` | `/api/admin/tours/:id/restore` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PATCH` | `/api/admin/tours/:id/guide` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PATCH` | `/api/admin/tours/:id/driver` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `PATCH` | `/api/admin/tours/:id/vehicle` | [`adminTourRoutes.js`](../server/routes/adminTourRoutes.js) |
| `GET` | `/api/agents/bookings` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `GET` | `/api/agent/bookings` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `GET` | `/api/agents/bookings/:id` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `GET` | `/api/agent/bookings/:id` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `POST` | `/api/agents/bookings` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `POST` | `/api/agent/bookings` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `PATCH` | `/api/agents/bookings/:id/status` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `PATCH` | `/api/agent/bookings/:id/status` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `PATCH` | `/api/agents/bookings/:id/cancel` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `PATCH` | `/api/agent/bookings/:id/cancel` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `DELETE` | `/api/agents/bookings/:id` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `DELETE` | `/api/agent/bookings/:id` | [`agentBookingRoutes.js`](../server/routes/agentBookingRoutes.js) |
| `GET` | `/api/agents/customers` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agent/customers` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agents/customers/stats` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agent/customers/stats` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agents/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agent/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `POST` | `/api/agents/customers` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `POST` | `/api/agent/customers` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `PUT` | `/api/agents/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `PUT` | `/api/agent/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `DELETE` | `/api/agents/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `DELETE` | `/api/agent/customers/:id` | [`agentCustomerRoutes.js`](../server/routes/agentCustomerRoutes.js) |
| `GET` | `/api/agents/packages` | [`agentPackageRoutes.js`](../server/routes/agentPackageRoutes.js) |
| `GET` | `/api/agent/packages` | [`agentPackageRoutes.js`](../server/routes/agentPackageRoutes.js) |
| `GET` | `/api/agents/packages/:id` | [`agentPackageRoutes.js`](../server/routes/agentPackageRoutes.js) |
| `GET` | `/api/agent/packages/:id` | [`agentPackageRoutes.js`](../server/routes/agentPackageRoutes.js) |
| `GET` | `/api/agents/dashboard` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/dashboard` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/bookings` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/bookings` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/customers` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/customers` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/quotes` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/quotes` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/commission` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/commission` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/tours` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/tours` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agents/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/agent/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `POST` | `/api/agents/tours` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `POST` | `/api/agent/tours` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `PUT` | `/api/agents/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `PUT` | `/api/agent/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `DELETE` | `/api/agents/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `DELETE` | `/api/agent/tours/:id` | [`agentRoutes.js`](../server/routes/agentRoutes.js) |
| `GET` | `/api/ai/admin/dashboard` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `POST` | `/api/ai/admin/query` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `GET` | `/api/ai/admin/analytics` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `GET` | `/api/ai/admin/briefing` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `POST` | `/api/ai/assistant` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `POST` | `/api/ai/chat` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `POST` | `/api/ai/booking/complete` | [`aiRoutes.js`](../server/routes/aiRoutes.js) |
| `GET` | `/api/airport-transfers` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `GET` | `/api/airport-transfers/admin/catalog` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `POST` | `/api/airport-transfers/admin/catalog` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `PATCH` | `/api/airport-transfers/admin/catalog/:id` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `POST` | `/api/airport-transfers/bookings` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `GET` | `/api/airport-transfers/bookings` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `PATCH` | `/api/airport-transfers/bookings/:id` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `GET` | `/api/airport-transfers/:id` | [`airportTransferRoutes.js`](../server/routes/airportTransferRoutes.js) |
| `GET` | `/api/analytics` | [`analyticsRoutes.js`](../server/routes/analyticsRoutes.js) |
| `GET` | `/api/analytics/dashboard` | [`analyticsRoutes.js`](../server/routes/analyticsRoutes.js) |
| `GET` | `/api/analytics/revenue` | [`analyticsRoutes.js`](../server/routes/analyticsRoutes.js) |
| `GET` | `/api/superadmin/api-monitor` | [`apiMonitorRoutes.js`](../server/routes/apiMonitorRoutes.js) |
| `POST` | `/api/auth/register` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/login` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/password-reset/request` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/password-reset/confirm` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/email-change/request` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/email-change/confirm` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `POST` | `/api/auth/logout` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `GET` | `/api/auth/me` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `PUT` | `/api/auth/change-password` | [`authRoutes.js`](../server/routes/authRoutes.js) |
| `GET` | `/api/bookings/test` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `POST` | `/api/bookings` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET` | `/api/bookings/my-bookings` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `PUT` | `/api/bookings/cancel/:id` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `PUT` | `/api/bookings/reschedule/:id` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `PUT` | `/api/bookings/:id/travel-date` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET` | `/api/bookings/confirmed` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET` | `/api/bookings/admin` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET` | `/api/bookings/admin/all` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `PUT` | `/api/bookings/:id/status` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `GET` | `/api/bookings/:id` | [`bookingRoutes.js`](../server/routes/bookingRoutes.js) |
| `POST` | `/api/payments/cash` | [`cashPaymentRoutes.js`](../server/routes/cashPaymentRoutes.js) |
| `GET` | `/api/categories` | [`categoryRoutes.js`](../server/routes/categoryRoutes.js) |
| `GET` | `/api/commissions` | [`commissionRoutes.js`](../server/routes/commissionRoutes.js) |
| `GET` | `/api/commissions/agent/:agentId` | [`commissionRoutes.js`](../server/routes/commissionRoutes.js) |
| `PATCH` | `/api/commissions/:id/approve` | [`commissionRoutes.js`](../server/routes/commissionRoutes.js) |
| `POST` | `/api/commissions/:id/pay` | [`commissionRoutes.js`](../server/routes/commissionRoutes.js) |
| `GET` | `/api/admin/compliance` | [`complianceRoutes.js`](../server/routes/complianceRoutes.js) |
| `GET` | `/api/admin/compliance/summary` | [`complianceRoutes.js`](../server/routes/complianceRoutes.js) |
| `PUT` | `/api/admin/compliance/:type` | [`complianceRoutes.js`](../server/routes/complianceRoutes.js) |
| `POST` | `/api/admin/compliance/etims/invoices/:id/queue` | [`complianceRoutes.js`](../server/routes/complianceRoutes.js) |
| `GET` | `/api/admin/compliance/etims/invoices/:id/status` | [`complianceRoutes.js`](../server/routes/complianceRoutes.js) |
| `POST` | `/api/coupons/validate` | [`couponRoutes.js`](../server/routes/couponRoutes.js) |
| `GET` | `/api/admin/credit-debit-notes` | [`creditDebitNoteRoutes.js`](../server/routes/creditDebitNoteRoutes.js) |
| `POST` | `/api/admin/credit-debit-notes` | [`creditDebitNoteRoutes.js`](../server/routes/creditDebitNoteRoutes.js) |
| `POST` | `/api/admin/credit-debit-notes/:id/issue` | [`creditDebitNoteRoutes.js`](../server/routes/creditDebitNoteRoutes.js) |
| `POST` | `/api/admin/credit-debit-notes/:id/cancel` | [`creditDebitNoteRoutes.js`](../server/routes/creditDebitNoteRoutes.js) |
| `GET` | `/api/crm/stats` | [`crmRoutes.js`](../server/routes/crmRoutes.js) |
| `POST` | `/api/custom-tour-requests` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `GET` | `/api/custom-tour-requests/mine` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `GET` | `/api/custom-tour-requests/admin` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `PATCH` | `/api/custom-tour-requests/admin/:id/quote` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `PATCH` | `/api/custom-tour-requests/admin/:id/assign` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `POST` | `/api/custom-tour-requests/:id/convert` | [`customTourRequestRoutes.js`](../server/routes/customTourRequestRoutes.js) |
| `GET` | `/api/admin/customers` | [`customerRoutes.js`](../server/routes/customerRoutes.js) |
| `GET` | `/api/customers` | [`customerRoutes.js`](../server/routes/customerRoutes.js) |
| `GET` | `/api/admin/customers/:id` | [`customerRoutes.js`](../server/routes/customerRoutes.js) |
| `GET` | `/api/customers/:id` | [`customerRoutes.js`](../server/routes/customerRoutes.js) |
| `GET` | `/api/database` | [`databaseRoutes.js`](../server/routes/databaseRoutes.js) |
| `GET` | `/api/destinations/featured` | [`destinationRoutes.js`](../server/routes/destinationRoutes.js) |
| `GET` | `/api/destinations` | [`destinationRoutes.js`](../server/routes/destinationRoutes.js) |
| `GET` | `/api/destinations/:slug` | [`destinationRoutes.js`](../server/routes/destinationRoutes.js) |
| `GET` | `/api/destinations/slug/:slug` | [`destinationRoutes.js`](../server/routes/destinationRoutes.js) |
| `GET` | `/api/admin/developer/api-keys` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `POST` | `/api/admin/developer/api-keys` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `POST` | `/api/admin/developer/api-keys/:id/revoke` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `GET` | `/api/admin/developer/webhooks` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `POST` | `/api/admin/developer/webhooks` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `PATCH` | `/api/admin/developer/webhooks/:id` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `POST` | `/api/admin/developer/webhooks/:id/test` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `DELETE` | `/api/admin/developer/webhooks/:id` | [`developerIntegrationRoutes.js`](../server/routes/developerIntegrationRoutes.js) |
| `POST` | `/api/documents/:id` | [`documentRoutes.js`](../server/routes/documentRoutes.js) |
| `GET` | `/api/driver/dashboard` | [`driverRoutes.js`](../server/routes/driverRoutes.js) |
| `GET` | `/api/driver/assigned-tours` | [`driverRoutes.js`](../server/routes/driverRoutes.js) |
| `GET` | `/api/driver/tours/:id` | [`driverRoutes.js`](../server/routes/driverRoutes.js) |
| `GET` | `/api/driver/tours/:id/guests` | [`driverRoutes.js`](../server/routes/driverRoutes.js) |
| `PUT` | `/api/driver/tours/:id/status` | [`driverRoutes.js`](../server/routes/driverRoutes.js) |
| `GET` | `/api/admin/finance` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `GET` | `/api/admin/finance/stats` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `GET` | `/api/admin/finance/transactions` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `GET` | `/api/admin/finance/reports` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `GET` | `/api/admin/finance/withholding-tax` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `POST` | `/api/admin/finance/withholding-tax` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `POST` | `/api/admin/finance/withholding-tax/:id/remit` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `POST` | `/api/admin/finance/withholding-tax/:id/cancel` | [`financeRoutes.js`](../server/routes/financeRoutes.js) |
| `GET` | `/api/gallery/featured` | [`galleryRoutes.js`](../server/routes/galleryRoutes.js) |
| `GET` | `/api/guide/dashboard` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `GET` | `/api/guide/assigned-tours` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `GET` | `/api/guide/tours/:id` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `GET` | `/api/guide/tours/:id/guests` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `PUT` | `/api/guide/tours/:id/status` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `POST` | `/api/guide/tours/:id/report` | [`guideRoutes.js`](../server/routes/guideRoutes.js) |
| `GET` | `/api/hero` | [`heroRoutes.js`](../server/routes/heroRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/dashboard` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/hotels/calendar` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/hotels/performance` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/hotels/bookings/:id/amend` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/hotels/bookings/:id/cancel` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/hotels/room-blocks` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `POST` | `/api/admin/hospitality-operations/hotels/room-blocks` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/hotels/room-blocks/:id/release` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/rate-plans` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `POST` | `/api/admin/hospitality-operations/rate-plans` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/rate-plans/:id` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/suppliers/contracts` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `POST` | `/api/admin/hospitality-operations/suppliers/contracts` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/suppliers/contracts/:id` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/deposits` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `POST` | `/api/admin/hospitality-operations/deposits` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/deposits/:id` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/transfers/dispatch` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/transfers/:id/assign` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `PATCH` | `/api/admin/hospitality-operations/transfers/:id/status` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/payments/reconciliation` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/drivers` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `GET` | `/api/admin/hospitality-operations/vehicles` | [`hospitalityOperationsRoutes.js`](../server/routes/hospitalityOperationsRoutes.js) |
| `POST` | `/api/hospitality-payments/mpesa` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `POST` | `/api/hospitality-payments/card` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `GET` | `/api/hospitality-payments/card/verify/:sessionId` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `POST` | `/api/hospitality-payments/bank` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `POST` | `/api/hospitality-payments/bank/:paymentId/confirm` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `GET` | `/api/hospitality-payments/:bookingId` | [`hospitalityPaymentRoutes.js`](../server/routes/hospitalityPaymentRoutes.js) |
| `GET` | `/api/hotels` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `GET` | `/api/hotels/availability` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `GET` | `/api/hotels/admin/catalog` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `POST` | `/api/hotels/admin/catalog` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `PATCH` | `/api/hotels/admin/catalog/:id` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `POST` | `/api/hotels/admin/catalog/:hotelId/rooms` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `PATCH` | `/api/hotels/admin/rooms/:id` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `POST` | `/api/hotels/admin/sync-inventory` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `POST` | `/api/hotels/bookings` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `GET` | `/api/hotels/bookings` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `PATCH` | `/api/hotels/bookings/:id` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `GET` | `/api/hotels/:id` | [`hotelRoutes.js`](../server/routes/hotelRoutes.js) |
| `POST` | `/api/integrations/keys` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `GET` | `/api/integrations/keys` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `DELETE` | `/api/integrations/keys/:id` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `GET` | `/api/integrations/v1/config` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `GET` | `/api/integrations/v1/tours` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `GET` | `/api/integrations/v1/widget.js` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `POST` | `/api/integrations/v1/bookings` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `POST` | `/api/integrations/v1/leads` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `POST` | `/api/integrations/v1/server/bookings` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `GET` | `/api/integrations/leads` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `PATCH` | `/api/integrations/leads/:id` | [`integrationRoutes.js`](../server/routes/integrationRoutes.js) |
| `POST` | `/api/internal/staging/seed-qa` | [`stagingSuperAdminBootstrapRoutes.js`](../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) |
| `GET` | `/api/internal/staging/verify-qa` | [`stagingSuperAdminBootstrapRoutes.js`](../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) |
| `POST` | `/api/internal/staging/reset-tenant-admin-password` | [`stagingSuperAdminBootstrapRoutes.js`](../server/routes/internal/stagingSuperAdminBootstrapRoutes.js) |
| `GET` | `/api/invoices/:id` | [`invoiceRoutes.js`](../server/routes/invoiceRoutes.js) |
| `POST` | `/api/mfa/customer/send-pin` | [`mfaRoutes.js`](../server/routes/mfaRoutes.js) |
| `POST` | `/api/mfa/customer/verify-pin` | [`mfaRoutes.js`](../server/routes/mfaRoutes.js) |
| `POST` | `/api/mpesa/stkpush` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/payments/stkpush` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/mpesa/mpesa` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/payments/mpesa` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/mpesa/callback` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/payments/callback` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/mpesa/status/:checkoutRequestId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/payments/status/:checkoutRequestId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/mpesa/query/:checkoutRequestId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/payments/query/:checkoutRequestId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/mpesa/verify/:bookingId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/payments/verify/:bookingId` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/mpesa/refund/result` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/payments/refund/result` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/mpesa/refund/timeout` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `POST` | `/api/payments/refund/timeout` | [`mpesaRoutes.js`](../server/routes/mpesaRoutes.js) |
| `GET` | `/api/notifications/recipients` | [`notificationRoutes.js`](../server/routes/notificationRoutes.js) |
| `POST` | `/api/notifications/internal` | [`notificationRoutes.js`](../server/routes/notificationRoutes.js) |
| `GET` | `/api/notifications` | [`notificationRoutes.js`](../server/routes/notificationRoutes.js) |
| `GET` | `/api/notifications/mine` | [`notificationRoutes.js`](../server/routes/notificationRoutes.js) |
| `PUT` | `/api/notifications/:id/read` | [`notificationRoutes.js`](../server/routes/notificationRoutes.js) |
| `GET` | `/api/operational-assets` | [`operationalAssetRoutes.js`](../server/routes/operationalAssetRoutes.js) |
| `POST` | `/api/operational-assets` | [`operationalAssetRoutes.js`](../server/routes/operationalAssetRoutes.js) |
| `PATCH` | `/api/operational-assets/:id` | [`operationalAssetRoutes.js`](../server/routes/operationalAssetRoutes.js) |
| `DELETE` | `/api/operational-assets/:id` | [`operationalAssetRoutes.js`](../server/routes/operationalAssetRoutes.js) |
| `GET` | `/api/admin/operations` | [`operationsRoutes.js`](../server/routes/operationsRoutes.js) |
| `GET` | `/api/admin/payment-gateways` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `GET` | `/api/admin/payment-gateways/:provider` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `PUT` | `/api/admin/payment-gateways/:provider` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `POST` | `/api/admin/payment-gateways/MPESA/validate` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `POST` | `/api/admin/payment-gateways/STRIPE/validate` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `POST` | `/api/admin/payment-gateways/PAYPAL/validate` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `DELETE` | `/api/admin/payment-gateways/:provider` | [`paymentGatewayRoutes.js`](../server/routes/paymentGatewayRoutes.js) |
| `GET` | `/api/admin/payment-links/public/:token` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `GET` | `/api/payment-links/public/:token` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `GET` | `/api/admin/payment-links` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `GET` | `/api/payment-links` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `POST` | `/api/admin/payment-links` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `POST` | `/api/payment-links` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `POST` | `/api/admin/payment-links/:id/cancel` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `POST` | `/api/payment-links/:id/cancel` | [`paymentLinkRoutes.js`](../server/routes/paymentLinkRoutes.js) |
| `POST` | `/api/payments/paypal/webhooks/:tenantId/:environment` | [`paypalRoutes.js`](../server/routes/paypalRoutes.js) |
| `POST` | `/api/payments/paypal/orders` | [`paypalRoutes.js`](../server/routes/paypalRoutes.js) |
| `POST` | `/api/payments/paypal/orders/capture` | [`paypalRoutes.js`](../server/routes/paypalRoutes.js) |
| `POST` | `/api/privacy/requests` | [`privacyRoutes.js`](../server/routes/privacyRoutes.js) |
| `GET` | `/api/privacy/admin/requests` | [`privacyRoutes.js`](../server/routes/privacyRoutes.js) |
| `GET` | `/api/privacy/admin/summary` | [`privacyRoutes.js`](../server/routes/privacyRoutes.js) |
| `PATCH` | `/api/privacy/admin/requests/:id` | [`privacyRoutes.js`](../server/routes/privacyRoutes.js) |
| `GET` | `/api/packages` | [`publicPackageRoutes.js`](../server/routes/publicPackageRoutes.js) |
| `POST` | `/api/agents/quotes` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `POST` | `/api/agent/quotes` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `GET` | `/api/agents/quotes` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `GET` | `/api/agent/quotes` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `GET` | `/api/agents/quotes/:id` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `GET` | `/api/agent/quotes/:id` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `PATCH` | `/api/agents/quotes/:id/status` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `PATCH` | `/api/agent/quotes/:id/status` | [`quotationRoutes.js`](../server/routes/quotationRoutes.js) |
| `POST` | `/api/recommendations` | [`recommendationRoutes.js`](../server/routes/recommendationRoutes.js) |
| `GET` | `/api/reviews/tour/:id` | [`reviewRoutes.js`](../server/routes/reviewRoutes.js) |
| `POST` | `/api/reviews` | [`reviewRoutes.js`](../server/routes/reviewRoutes.js) |
| `PUT` | `/api/reviews/:id/helpful` | [`reviewRoutes.js`](../server/routes/reviewRoutes.js) |
| `GET` | `/api/security/status` | [`securityRoutes.js`](../server/routes/securityRoutes.js) |
| `GET` | `/api/security/events` | [`securityRoutes.js`](../server/routes/securityRoutes.js) |
| `GET` | `/api/sitemap.xml` | [`seoRoutes.js`](../server/routes/seoRoutes.js) |
| `GET` | `/api/admin/settings` | [`settingsRoutes.js`](../server/routes/settingsRoutes.js) |
| `GET` | `/api/settings` | [`settingsRoutes.js`](../server/routes/settingsRoutes.js) |
| `PUT` | `/api/admin/settings` | [`settingsRoutes.js`](../server/routes/settingsRoutes.js) |
| `PUT` | `/api/settings` | [`settingsRoutes.js`](../server/routes/settingsRoutes.js) |
| `GET` | `/api/staff/guides` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `GET` | `/api/staff/drivers` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `POST` | `/api/staff` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `GET` | `/api/staff` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `GET` | `/api/staff/:id` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `PUT` | `/api/staff/:id/status` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `PUT` | `/api/staff/:id` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `DELETE` | `/api/staff/:id` | [`staffRoutes.js`](../server/routes/staffRoutes.js) |
| `POST` | `/api/payments/stripe/webhook` | [`stripeRoutes.js`](../server/routes/stripeRoutes.js) |
| `POST` | `/api/payments/stripe/checkout` | [`stripeRoutes.js`](../server/routes/stripeRoutes.js) |
| `GET` | `/api/payments/stripe/verify/:sessionId` | [`stripeRoutes.js`](../server/routes/stripeRoutes.js) |
| `POST` | `/api/payments/stripe/bank-transfer` | [`stripeRoutes.js`](../server/routes/stripeRoutes.js) |
| `GET` | `/api/superadmin/maintenance/backups` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/backup` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/maintenance/backup` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/cache` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/maintenance/cache` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `DELETE` | `/api/superadmin/maintenance/backups/:id` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `GET` | `/api/superadmin/maintenance/database/backup/:id/download` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/database/backup` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `POST` | `/api/superadmin/maintenance/database/cache-clear` | [`superAdminMaintenanceRoutes.js`](../server/routes/superAdminMaintenanceRoutes.js) |
| `GET` | `/api/superadmin/audit` | [`superAdminOperationsRoutes.js`](../server/routes/superAdminOperationsRoutes.js) |
| `GET` | `/api/superadmin/database` | [`superAdminOperationsRoutes.js`](../server/routes/superAdminOperationsRoutes.js) |
| `GET` | `/api/superadmin/system` | [`superAdminOperationsRoutes.js`](../server/routes/superAdminOperationsRoutes.js) |
| `GET` | `/api/superadmin/revenue` | [`superAdminRevenueRoutes.js`](../server/routes/superAdminRevenueRoutes.js) |
| `GET` | `/api/superadmin/roles` | [`superAdminRoleRoutes.js`](../server/routes/superAdminRoleRoutes.js) |
| `GET` | `/api/superadmin/roles/permissions/all` | [`superAdminRoleRoutes.js`](../server/routes/superAdminRoleRoutes.js) |
| `GET` | `/api/superadmin/roles/:id` | [`superAdminRoleRoutes.js`](../server/routes/superAdminRoleRoutes.js) |
| `PUT` | `/api/superadmin/roles/:id/permissions` | [`superAdminRoleRoutes.js`](../server/routes/superAdminRoleRoutes.js) |
| `GET` | `/api/superadmin/dashboard/metrics` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/dashboard/metrics` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/dashboard` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/dashboard` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenant-plans` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenant-plans` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants/:tenantId/mpesa/validate` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants/:tenantId/mpesa/validate` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/tenants/:tenantId/mpesa` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/tenants/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/tenants/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants/:id/subscription/activate` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/tenants/:id/subscription/activate` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/tenants/:id/subscription/plan` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/tenants/:id/subscription/plan` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/tenants/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/tenants/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/subscription-payments` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/subscription-payments` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/billing/config` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/billing/config` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/billing/config` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/billing/config` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/billing/features` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/billing/features` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/users` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/users` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/users/accounts` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/users/accounts` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/users/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PATCH` | `/api/superadmin/users/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/users/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/users/:id/status` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/users/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/users/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/audit` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/audit` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/security` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/security` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/system` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/system` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/api-monitor` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/api-monitor` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/settings` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/settings` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/settings` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `PUT` | `/api/superadmin/settings` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/maintenance/backup` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/maintenance/backup` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/database/backup` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/database/backup` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/maintenance/cache` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/maintenance/cache` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/database/cache-clear` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `POST` | `/api/superadmin/database/cache-clear` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database/backups` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database/backups` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/maintenance/backups` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/maintenance/backups` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/maintenance/backups/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/maintenance/backups/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/database/backups/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `DELETE` | `/api/superadmin/database/backups/:id` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database/backup/:id/download` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin/database/backup/:id/download` | [`superAdminRoutes.js`](../server/routes/superAdminRoutes.js) |
| `GET` | `/api/superadmin-tools/database` | [`superAdminToolsRoutes.js`](../server/routes/superAdminToolsRoutes.js) |
| `GET` | `/api/superadmin-tools/settings` | [`superAdminToolsRoutes.js`](../server/routes/superAdminToolsRoutes.js) |
| `POST` | `/api/superadmin/users/accounts` | [`superAdminUserRoutes.js`](../server/routes/superAdminUserRoutes.js) |
| `GET` | `/api/system/health` | [`systemHealthRoutes.js`](../server/routes/systemHealthRoutes.js) |
| `GET` | `/api/system/health` | [`systemHealthRoutes.js`](../server/routes/systemHealthRoutes.js) |
| `GET` | `/api/system/admin/system-health` | [`systemHealthRoutes.js`](../server/routes/systemHealthRoutes.js) |
| `GET` | `/api/system/admin/system-health` | [`systemHealthRoutes.js`](../server/routes/systemHealthRoutes.js) |
| `GET` | `/api/admin/tax/rules` | [`taxRoutes.js`](../server/routes/taxRoutes.js) |
| `POST` | `/api/admin/tax/rules/initialize` | [`taxRoutes.js`](../server/routes/taxRoutes.js) |
| `PUT` | `/api/admin/tax/rules/:code` | [`taxRoutes.js`](../server/routes/taxRoutes.js) |
| `POST` | `/api/admin/tax/calculate` | [`taxRoutes.js`](../server/routes/taxRoutes.js) |
| `GET` | `/api/tenant` | [`tenantBrandingRoutes.js`](../server/routes/tenantBrandingRoutes.js) |
| `GET` | `/api/tenant/branding` | [`tenantBrandingRoutes.js`](../server/routes/tenantBrandingRoutes.js) |
| `PUT` | `/api/tenant` | [`tenantBrandingRoutes.js`](../server/routes/tenantBrandingRoutes.js) |
| `PUT` | `/api/tenant/branding` | [`tenantBrandingRoutes.js`](../server/routes/tenantBrandingRoutes.js) |
| `GET` | `/api/tenants` | [`tenantRoutes.js`](../server/routes/tenantRoutes.js) |
| `POST` | `/api/tenants` | [`tenantRoutes.js`](../server/routes/tenantRoutes.js) |
| `GET` | `/api/tenants/:id` | [`tenantRoutes.js`](../server/routes/tenantRoutes.js) |
| `PATCH` | `/api/tenants/:id` | [`tenantRoutes.js`](../server/routes/tenantRoutes.js) |
| `GET` | `/api/subscription` | [`tenantSubscriptionRoutes.js`](../server/routes/tenantSubscriptionRoutes.js) |
| `POST` | `/api/subscription/mpesa` | [`tenantSubscriptionRoutes.js`](../server/routes/tenantSubscriptionRoutes.js) |
| `GET` | `/api/subscription/payment/:checkoutRequestId` | [`tenantSubscriptionRoutes.js`](../server/routes/tenantSubscriptionRoutes.js) |
| `PUT` | `/api/tour-assignments/:id/assign` | [`tourAssignmentRoutes.js`](../server/routes/tourAssignmentRoutes.js) |
| `GET` | `/api/tourmanager/dashboard` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/dashboard` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/copilot/summary` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/copilot/summary` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/copilot/quote-draft` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/copilot/quote-draft` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/calendar/reminders` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/calendar/reminders` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/calendar/reminders` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/calendar/reminders` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tourmanager/calendar/reminders/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tour-manager/calendar/reminders/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/tours` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/tours` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/tours` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/tours` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/tours/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/tours/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tourmanager/tours/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tour-manager/tours/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tourmanager/tours/:id/publication` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tour-manager/tours/:id/publication` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/tours/:id/assign` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/tours/:id/assign` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tourmanager/tours/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tour-manager/tours/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tourmanager/tours/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tour-manager/tours/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/assign-resources/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/assign-resources/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/assign-guide` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/assign-guide` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/itineraries` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/itineraries` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/itineraries` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/itineraries` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tourmanager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `DELETE` | `/api/tour-manager/itineraries/:id` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/bookings` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/bookings` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tourmanager/bookings/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tour-manager/bookings/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/bookings/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/bookings/:id/complete` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tourmanager/bookings/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PATCH` | `/api/tour-manager/bookings/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tourmanager/bookings/:id/notify` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `POST` | `/api/tour-manager/bookings/:id/notify` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/bookings/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/bookings/:id/cancel` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/customers` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/customers` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/guides` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/guides` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/drivers` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/drivers` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/vehicles` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/vehicles` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/reports` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/reports` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tourmanager/tours/:id/availability` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-manager/tours/:id/availability` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tourmanager/tours/:id/availability` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `PUT` | `/api/tour-manager/tours/:id/availability` | [`tourManagerRoutes.js`](../server/routes/tourManagerRoutes.js) |
| `GET` | `/api/tour-reports` | [`tourReportRoutes.js`](../server/routes/tourReportRoutes.js) |
| `GET` | `/api/tours` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/featured` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/search` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/slug/:slug` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/:id/availability` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/:id` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `GET` | `/api/tours/manager` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `POST` | `/api/tours` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PATCH` | `/api/tours/:id/availability` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PUT` | `/api/tours/:id` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `DELETE` | `/api/tours/:id` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PATCH` | `/api/tours/:id/publication` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PUT` | `/api/tours/:id/assign` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PATCH` | `/api/tours/:id/assign-vehicle` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `PATCH` | `/api/tours/:id/remove-vehicle` | [`tourRoutes.js`](../server/routes/tourRoutes.js) |
| `POST` | `/api/travel/vouchers` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `POST` | `/api/travel/vouchers/redeem` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `POST` | `/api/travel/pricing/calculate` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `GET` | `/api/travel/loyalty/:customerId` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `POST` | `/api/travel/loyalty/earn` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `POST` | `/api/travel/loyalty/redeem` | [`travelLifecycleRoutes.js`](../server/routes/travelLifecycleRoutes.js) |
| `GET` | `/api/operations` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `POST` | `/api/operations` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `PATCH` | `/api/operations/:id` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `DELETE` | `/api/operations/:id` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `GET` | `/api/operations/rules/list` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `POST` | `/api/operations/rules` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `PATCH` | `/api/operations/rules/:id` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `DELETE` | `/api/operations/rules/:id` | [`travelOperationsRoutes.js`](../server/routes/travelOperationsRoutes.js) |
| `GET` | `/api/users/profile` | [`userRoutes.js`](../server/routes/userRoutes.js) |
| `PUT` | `/api/users/profile` | [`userRoutes.js`](../server/routes/userRoutes.js) |
| `GET` | `/api/users/guides` | [`userRoutes.js`](../server/routes/userRoutes.js) |
| `DELETE` | `/api/users/:id` | [`userRoutes.js`](../server/routes/userRoutes.js) |
| `POST` | `/api/vehicles` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `PUT` | `/api/vehicles/:id` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `DELETE` | `/api/vehicles/:id` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `GET` | `/api/vehicles` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `GET` | `/api/vehicles/:id` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `PUT` | `/api/vehicles/:id/assign-driver` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `PUT` | `/api/vehicles/:id/remove-driver` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `PUT` | `/api/vehicles/:id/status` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `PATCH` | `/api/vehicles/:id/restore` | [`vehicleRoutes.js`](../server/routes/vehicleRoutes.js) |
| `GET` | `/api/wishlist` | [`wishlistRoutes.js`](../server/routes/wishlistRoutes.js) |
| `POST` | `/api/wishlist` | [`wishlistRoutes.js`](../server/routes/wishlistRoutes.js) |
| `DELETE` | `/api/wishlist/:tourId` | [`wishlistRoutes.js`](../server/routes/wishlistRoutes.js) |

## Route modules without an observed mount

The following modules contain literal route declarations but are not imported/mounted by `server/routes/index.js` or `server/app.js` in the current source. They are listed for audit navigation only and should not be described as reachable endpoints without another mounting mechanism.

- `GET /` — [`accommodationInventoryRoutes.js`](../server/routes/accommodationInventoryRoutes.js)
- `POST /` — [`accommodationInventoryRoutes.js`](../server/routes/accommodationInventoryRoutes.js)
- `PATCH /:id` — [`accommodationInventoryRoutes.js`](../server/routes/accommodationInventoryRoutes.js)
- `GET /accounts` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /accounts` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /journal` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /journal` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /journal/:id/post` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /journal/:id/void` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /summary` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /statements` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /ar-aging` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /ap-aging` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /cash-flow` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /tax-control` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /customer-ledger` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /supplier-ledger` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /profitability` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /exports/general-ledger.csv` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /exports/tax-control.csv` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /subledgers` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /subledgers` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /subledgers/:id/amortize` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /subledgers/:id/reverse` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /reconciliation/transactions` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /reconciliation/transactions` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /reconciliation/transactions/:id/match` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /reconciliation/transactions/:id/exception` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /operational-reconciliation` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /assets` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /assets` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /assets/:id/depreciate` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /assets/:id/dispose` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /budgets` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /budgets` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /budgets/:id/approve` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /budgets-vs-actual` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /periods` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /periods/:period/close` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /periods/:period/reopen` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `POST /periods/:year/year-end-close` — [`accountingRoutes.js`](../server/routes/accountingRoutes.js)
- `GET /tax-profile` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `PUT /tax-profile` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /etims/credentials` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `PUT /etims/credentials` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /compliance-summary` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /expenses` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /expenses` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /expenses/:id/status` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /withholding-tax` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /withholding-tax` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /withholding-tax/:id/remit` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /withholding-tax/:id/cancel` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /notes` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /notes` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `POST /notes/:id/queue` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /etims/submissions` — [`financeComplianceRoutes.js`](../server/routes/financeComplianceRoutes.js)
- `GET /` — [`kenyaReadinessRoutes.js`](../server/routes/kenyaReadinessRoutes.js)
- `GET /suppliers` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /suppliers` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `PATCH /suppliers/:id` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /purchase-orders` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /purchase-orders` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `PATCH /purchase-orders/:id/status` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /tour-costs` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /tour-costs` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /tour-costs/profitability/:tourId` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /supplier-payables` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /supplier-payables` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /supplier-payables/:id/pay` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /corporate-accounts` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /corporate-accounts` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `POST /corporate-accounts/:id/reconcile` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /resource-conflicts` — [`operationsModuleRoutes.js`](../server/routes/operationsModuleRoutes.js)
- `GET /summary` — [`travelServiceRequestRoutes.js`](../server/routes/travelServiceRequestRoutes.js)
- `GET /` — [`travelServiceRequestRoutes.js`](../server/routes/travelServiceRequestRoutes.js)
- `POST /` — [`travelServiceRequestRoutes.js`](../server/routes/travelServiceRequestRoutes.js)
- `PATCH /:id` — [`travelServiceRequestRoutes.js`](../server/routes/travelServiceRequestRoutes.js)
- `POST /v1/leads` — [`websiteLeadRoutes.js`](../server/routes/websiteLeadRoutes.js)
- `GET /leads` — [`websiteLeadRoutes.js`](../server/routes/websiteLeadRoutes.js)
- `PATCH /leads/:id` — [`websiteLeadRoutes.js`](../server/routes/websiteLeadRoutes.js)
