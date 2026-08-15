import express from "express";
import superAdminRoutes from "./superAdminRoutes.js";
import apiMonitorRoutes from "./apiMonitorRoutes.js";
import superAdminOperationsRoutes from "./superAdminOperationsRoutes.js";
import superAdminToolsRoutes from "./superAdminToolsRoutes.js";

import commissionRoutes from "./commissionRoutes.js";
import tourManagerRoutes from "./tourManagerRoutes.js";
import staffRoutes from "./staffRoutes.js";
import userRoutes from "./userRoutes.js";
import vehicleRoutes from "./vehicleRoutes.js";

import authRoutes from "./authRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import tourRoutes from "./tourRoutes.js";
import destinationRoutes from "./destinationRoutes.js";
import adminDestinationRoutes from "./adminDestinationRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import heroRoutes from "./heroRoutes.js";

import mpesaRoutes from "./mpesaRoutes.js";
import stripeRoutes from "./stripeRoutes.js";

import adminRoutes from "./adminRoutes.js";
import adminTourRoutes from "./adminTourRoutes.js";
import adminBookingRoutes from "./adminBookingRoutes.js";
import adminPaymentRoutes from "./adminPaymentRoutes.js";
import adminRoleRoutes from "./adminRoleRoutes.js";
import systemHealthRoutes from "./systemHealthRoutes.js";
import adminAuthRoutes from "./adminAuthRoutes.js";

import adminDashboardRoutes from "./adminDashboardRoutes.js";
import adminReviewRoutes from "./adminReviewRoutes.js";
import adminGalleryRoutes from "./adminGalleryRoutes.js";
import adminCouponRoutes from "./adminCouponRoutes.js";

import categoryRoutes from "./categoryRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import agentRoutes from "./agentRoutes.js";
import agentBookingRoutes from "./agentBookingRoutes.js";
import agentCustomerRoutes from "./agentCustomerRoutes.js";
import agentPackageRoutes from "./agentPackageRoutes.js";
import couponRoutes from "./couponRoutes.js";
import crmRoutes from "./crmRoutes.js";
import customerRoutes from "./customerRoutes.js";
import documentRoutes from "./documentRoutes.js";
import financeRoutes from "./financeRoutes.js";
import guideRoutes from "./guideRoutes.js";
import driverRoutes from "./driverRoutes.js";
import invoiceRoutes from "./invoiceRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import quotationRoutes from "./quotationRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";
import tourAssignmentRoutes from "./tourAssignmentRoutes.js";
import tourReportRoutes from "./tourReportRoutes.js";
import aiRoutes from "./aiRoutes.js";
import seoRoutes from "./seoRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import { getPublicSettings } from "../controllers/settingsController.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC / CUSTOMER ROUTES
|--------------------------------------------------------------------------
*/

router.use("/categories", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/tours", tourRoutes);
router.use("/destinations", destinationRoutes);
router.use("/admin/destinations", adminDestinationRoutes);
router.use("/reviews", reviewRoutes);
import customTourRequestRoutes from "./customTourRequestRoutes.js";
router.use("/custom-tour-requests", customTourRequestRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/gallery", galleryRoutes);
router.use("/hero", heroRoutes);

/*
|--------------------------------------------------------------------------
| PAYMENT / M-PESA
|--------------------------------------------------------------------------
*/

router.use("/mpesa", mpesaRoutes);
router.use("/payments", mpesaRoutes);
router.use("/payments/stripe", stripeRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

// Keep the dedicated RBAC router before the generic /admin router so role
// requests can never be intercepted by a broader admin route.
router.use("/admin/roles", adminRoleRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/tours", adminTourRoutes);
router.use("/admin/bookings", adminBookingRoutes);
router.use("/admin/payments", adminPaymentRoutes);
router.use("/system", systemHealthRoutes);
router.get("/settings/public", getPublicSettings);
router.use("/admin/settings", settingsRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/admin/reviews", adminReviewRoutes);
router.use("/admin/gallery", adminGalleryRoutes);
router.use("/admin/coupons", adminCouponRoutes);
router.use("/admin/finance", financeRoutes);
// Compatibility alias for the Admin Customers CRM.
router.use("/admin/customers", customerRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN / GENERAL ANALYTICS
|--------------------------------------------------------------------------
*/

router.use("/analytics", analyticsRoutes);

/*
|--------------------------------------------------------------------------
| TOUR MANAGER
|--------------------------------------------------------------------------
|
| Both spellings are kept because the audited frontend currently uses
| /tourmanager in manager-specific services and /tour-manager in tour APIs.
|
|--------------------------------------------------------------------------
*/

router.use("/tourmanager", tourManagerRoutes);
router.use("/tour-manager", tourManagerRoutes);

router.use("/tour-assignments", tourAssignmentRoutes);
router.use("/tour-reports", tourReportRoutes);

/*
|--------------------------------------------------------------------------
| AGENT
|--------------------------------------------------------------------------
|
| The frontend uses the plural /agents namespace. /agent is retained as
| a compatibility alias for the existing route documentation.
|
|--------------------------------------------------------------------------
*/

router.use("/agents", agentRoutes);
router.use("/agent", agentRoutes);
router.use("/agents/bookings", agentBookingRoutes);
router.use("/agent/bookings", agentBookingRoutes);
router.use("/agents/customers", agentCustomerRoutes);
router.use("/agent/customers", agentCustomerRoutes);
router.use("/agents/packages", agentPackageRoutes);
router.use("/agent/packages", agentPackageRoutes);
router.use("/agents/quotes", quotationRoutes);
router.use("/agent/quotes", quotationRoutes);

/*
|--------------------------------------------------------------------------
| USER / CUSTOMER / STAFF / VEHICLES
|--------------------------------------------------------------------------
*/

router.use("/customers", customerRoutes);
router.use("/documents", documentRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/notifications", notificationRoutes);

// Lightweight health endpoint for local/deployment checks.
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Travel API healthy",
  });
});
router.use("/recommendations", recommendationRoutes);
router.use("/guide", guideRoutes);
router.use("/driver", driverRoutes);

router.use("/vehicles", vehicleRoutes);
router.use("/users", userRoutes);
router.use("/staff", staffRoutes);

/*
|--------------------------------------------------------------------------
| COMMISSIONS / CRM / COUPONS
|--------------------------------------------------------------------------
*/

router.use("/commissions", commissionRoutes);
router.use("/crm", crmRoutes);
router.use("/coupons", couponRoutes);

/*
|--------------------------------------------------------------------------
| AI
|--------------------------------------------------------------------------
*/

router.use("/ai", aiRoutes);

/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/

router.use("/", seoRoutes);

router.use("/superadmin", superAdminRoutes);

router.use("/superadmin/api-monitor", apiMonitorRoutes);

router.use(
"/superadmin",
superAdminOperationsRoutes
);

router.use(
"/superadmin-tools",
superAdminToolsRoutes
);

export default router;


