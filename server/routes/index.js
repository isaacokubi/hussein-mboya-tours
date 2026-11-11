/**
 * Purpose: index API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/planFeatureMiddleware.js so this module can use its exported dependencies.
import { enforcePlanFeature } from "../middleware/planFeatureMiddleware.js";
// Load ../tenancy/bootstrap.js so this module can use its exported dependencies.
import "../tenancy/bootstrap.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, checkPermission } from "../middleware/authMiddleware.js";
// Load ./superAdminRoutes.js so this module can use its exported dependencies.
import superAdminRoutes from "./superAdminRoutes.js";
// Load ./superAdminRoleRoutes.js so this module can use its exported dependencies.
import superAdminRoleRoutes from "./superAdminRoleRoutes.js";
// Load ./superAdminRevenueRoutes.js so this module can use its exported dependencies.
import superAdminRevenueRoutes from "./superAdminRevenueRoutes.js";
// Load ./apiMonitorRoutes.js so this module can use its exported dependencies.
import apiMonitorRoutes from "./apiMonitorRoutes.js";
// Load ./superAdminOperationsRoutes.js so this module can use its exported dependencies.
import superAdminOperationsRoutes from "./superAdminOperationsRoutes.js";
// Load ./superAdminToolsRoutes.js so this module can use its exported dependencies.
import superAdminToolsRoutes from "./superAdminToolsRoutes.js";
// Load ./superAdminMaintenanceRoutes.js so this module can use its exported dependencies.
import superAdminMaintenanceRoutes from "./superAdminMaintenanceRoutes.js";
// Load ./tenantRoutes.js so this module can use its exported dependencies.
import tenantRoutes from "./tenantRoutes.js";
// Load ./commissionRoutes.js so this module can use its exported dependencies.
import commissionRoutes from "./commissionRoutes.js";
// Load ./tourManagerRoutes.js so this module can use its exported dependencies.
import tourManagerRoutes from "./tourManagerRoutes.js";
// Load ./staffRoutes.js so this module can use its exported dependencies.
import staffRoutes from "./staffRoutes.js";
// Load ./userRoutes.js so this module can use its exported dependencies.
import userRoutes from "./userRoutes.js";
// Load ./vehicleRoutes.js so this module can use its exported dependencies.
import vehicleRoutes from "./vehicleRoutes.js";
// Load ./authRoutes.js so this module can use its exported dependencies.
import authRoutes from "./authRoutes.js";
// Load ./mfaRoutes.js so this module can use its exported dependencies.
import mfaRoutes from "./mfaRoutes.js";
// Load ./bookingRoutes.js so this module can use its exported dependencies.
import bookingRoutes from "./bookingRoutes.js";
// Load ./tourRoutes.js so this module can use its exported dependencies.
import tourRoutes from "./tourRoutes.js";
// Load ./destinationRoutes.js so this module can use its exported dependencies.
import destinationRoutes from "./destinationRoutes.js";
// Load ./adminDestinationRoutes.js so this module can use its exported dependencies.
import adminDestinationRoutes from "./adminDestinationRoutes.js";
// Load ./reviewRoutes.js so this module can use its exported dependencies.
import reviewRoutes from "./reviewRoutes.js";
// Load ./wishlistRoutes.js so this module can use its exported dependencies.
import wishlistRoutes from "./wishlistRoutes.js";
// Load ./galleryRoutes.js so this module can use its exported dependencies.
import galleryRoutes from "./galleryRoutes.js";
// Load ./heroRoutes.js so this module can use its exported dependencies.
import heroRoutes from "./heroRoutes.js";
// Load ./mpesaRoutes.js so this module can use its exported dependencies.
import mpesaRoutes from "./mpesaRoutes.js";
// Load ./stripeRoutes.js so this module can use its exported dependencies.
import stripeRoutes from "./stripeRoutes.js";
// Load ./paypalRoutes.js so this module can use its exported dependencies.
import paypalRoutes from "./paypalRoutes.js";
// Load ./adminRoutes.js so this module can use its exported dependencies.
import adminRoutes from "./adminRoutes.js";
// Load ./adminTourRoutes.js so this module can use its exported dependencies.
import adminTourRoutes from "./adminTourRoutes.js";
// Load ./adminBookingRoutes.js so this module can use its exported dependencies.
import adminBookingRoutes from "./adminBookingRoutes.js";
// Load ./adminPaymentRoutes.js so this module can use its exported dependencies.
import adminPaymentRoutes from "./adminPaymentRoutes.js";
// Load ./adminRoleRoutes.js so this module can use its exported dependencies.
import adminRoleRoutes from "./adminRoleRoutes.js";
// Load ./systemHealthRoutes.js so this module can use its exported dependencies.
import systemHealthRoutes from "./systemHealthRoutes.js";
// Load ./securityRoutes.js so this module can use its exported dependencies.
import securityRoutes from "./securityRoutes.js";
// Load ./adminAuthRoutes.js so this module can use its exported dependencies.
import adminAuthRoutes from "./adminAuthRoutes.js";
// Load ./adminDashboardRoutes.js so this module can use its exported dependencies.
import adminDashboardRoutes from "./adminDashboardRoutes.js";
// Load ./adminReviewRoutes.js so this module can use its exported dependencies.
import adminReviewRoutes from "./adminReviewRoutes.js";
// Load ./adminGalleryRoutes.js so this module can use its exported dependencies.
import adminGalleryRoutes from "./adminGalleryRoutes.js";
// Load ./adminCategoryRoutes.js so this module can use its exported dependencies.
import adminCategoryRoutes from "./adminCategoryRoutes.js";
// Load ./adminCouponRoutes.js so this module can use its exported dependencies.
import adminCouponRoutes from "./adminCouponRoutes.js";
// Load ./adminHeroRoutes.js so this module can use its exported dependencies.
import adminHeroRoutes from "./adminHeroRoutes.js";
// Load ./categoryRoutes.js so this module can use its exported dependencies.
import categoryRoutes from "./categoryRoutes.js";
// Load ./analyticsRoutes.js so this module can use its exported dependencies.
import analyticsRoutes from "./analyticsRoutes.js";
// Load ./agentRoutes.js so this module can use its exported dependencies.
import agentRoutes from "./agentRoutes.js";
// Load ./agentBookingRoutes.js so this module can use its exported dependencies.
import agentBookingRoutes from "./agentBookingRoutes.js";
// Load ./agentCustomerRoutes.js so this module can use its exported dependencies.
import agentCustomerRoutes from "./agentCustomerRoutes.js";
// Load ./agentPackageRoutes.js so this module can use its exported dependencies.
import agentPackageRoutes from "./agentPackageRoutes.js";
// Load ./couponRoutes.js so this module can use its exported dependencies.
import couponRoutes from "./couponRoutes.js";
// Load ./crmRoutes.js so this module can use its exported dependencies.
import crmRoutes from "./crmRoutes.js";
// Load ./customerRoutes.js so this module can use its exported dependencies.
import customerRoutes from "./customerRoutes.js";
// Load ./documentRoutes.js so this module can use its exported dependencies.
import documentRoutes from "./documentRoutes.js";
// Load ./financeRoutes.js so this module can use its exported dependencies.
import financeRoutes from "./financeRoutes.js";
// Load ./guideRoutes.js so this module can use its exported dependencies.
import guideRoutes from "./guideRoutes.js";
// Load ./driverRoutes.js so this module can use its exported dependencies.
import driverRoutes from "./driverRoutes.js";
// Load ./invoiceRoutes.js so this module can use its exported dependencies.
import invoiceRoutes from "./invoiceRoutes.js";
// Load ./notificationRoutes.js so this module can use its exported dependencies.
import notificationRoutes from "./notificationRoutes.js";
// Load ./quotationRoutes.js so this module can use its exported dependencies.
import quotationRoutes from "./quotationRoutes.js";
// Load ./recommendationRoutes.js so this module can use its exported dependencies.
import recommendationRoutes from "./recommendationRoutes.js";
// Load ./tourAssignmentRoutes.js so this module can use its exported dependencies.
import tourAssignmentRoutes from "./tourAssignmentRoutes.js";
// Load ./tourReportRoutes.js so this module can use its exported dependencies.
import tourReportRoutes from "./tourReportRoutes.js";
// Load ./aiRoutes.js so this module can use its exported dependencies.
import aiRoutes from "./aiRoutes.js";
// Load ./adminAIRoutes.js so this module can use its exported dependencies.
import adminAIRoutes from "./adminAIRoutes.js";
// Load ./adminAgentRoutes.js so this module can use its exported dependencies.
import adminAgentRoutes from "./adminAgentRoutes.js";
// Load ./seoRoutes.js so this module can use its exported dependencies.
import seoRoutes from "./seoRoutes.js";
// Load ./settingsRoutes.js so this module can use its exported dependencies.
import settingsRoutes from "./settingsRoutes.js";
// Load ../controllers/settingsController.js so this module can use its exported dependencies.
import { getPublicSettings } from "../controllers/settingsController.js";
// Load ./customTourRequestRoutes.js so this module can use its exported dependencies.
import customTourRequestRoutes from "./customTourRequestRoutes.js";
// Load ./superAdminUserRoutes.js so this module can use its exported dependencies.
import superAdminUserRoutes from "./superAdminUserRoutes.js";
// Load ./tenantBrandingRoutes.js so this module can use its exported dependencies.
import tenantBrandingRoutes from "./tenantBrandingRoutes.js";
// Load ./operationsRoutes.js so this module can use its exported dependencies.
import operationsRoutes from "./operationsRoutes.js";
// Load ./integrationRoutes.js so this module can use its exported dependencies.
import integrationRoutes from "./integrationRoutes.js";
// Load ./paymentGatewayRoutes.js so this module can use its exported dependencies.
import paymentGatewayRoutes from "./paymentGatewayRoutes.js";
// Load ./cashPaymentRoutes.js so this module can use its exported dependencies.
import cashPaymentRoutes from "./cashPaymentRoutes.js";
// Load ./complianceRoutes.js so this module can use its exported dependencies.
import complianceRoutes from "./complianceRoutes.js";
// Load ./privacyRoutes.js so this module can use its exported dependencies.
import privacyRoutes from "./privacyRoutes.js";
// Load ./taxRoutes.js so this module can use its exported dependencies.
import taxRoutes from "./taxRoutes.js";
// Load ./creditDebitNoteRoutes.js so this module can use its exported dependencies.
import creditDebitNoteRoutes from "./creditDebitNoteRoutes.js";
// Load ./paymentLinkRoutes.js so this module can use its exported dependencies.
import paymentLinkRoutes from "./paymentLinkRoutes.js";
// Load ./developerIntegrationRoutes.js so this module can use its exported dependencies.
import developerIntegrationRoutes from "./developerIntegrationRoutes.js";
// Load ./travelOperationsRoutes.js so this module can use its exported dependencies.
import travelOperationsRoutes from "./travelOperationsRoutes.js";
// Load ./travelLifecycleRoutes.js so this module can use its exported dependencies.
import travelLifecycleRoutes from "./travelLifecycleRoutes.js";
// Load ./operationalAssetRoutes.js so this module can use its exported dependencies.
import operationalAssetRoutes from "./operationalAssetRoutes.js";
// Load ./hotelRoutes.js so this module can use its exported dependencies.
import hotelRoutes from "./hotelRoutes.js";
// Load ./airportTransferRoutes.js so this module can use its exported dependencies.
import airportTransferRoutes from "./airportTransferRoutes.js";
// Load ./hospitalityPaymentRoutes.js so this module can use its exported dependencies.
import hospitalityPaymentRoutes from "./hospitalityPaymentRoutes.js";
// Load ./hospitalityOperationsRoutes.js so this module can use its exported dependencies.
import hospitalityOperationsRoutes from "./hospitalityOperationsRoutes.js";
// Load ./adminPackageRoutes.js so this module can use its exported dependencies.
import adminPackageRoutes from "./adminPackageRoutes.js";
// Load ./publicPackageRoutes.js so this module can use its exported dependencies.
import publicPackageRoutes from "./publicPackageRoutes.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use("/integrations", integrationRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/packages", publicPackageRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/tenant", tenantBrandingRoutes);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(enforcePlanFeature);
// Perform the side effect or state update expressed on the following line.
router.use("/categories", categoryRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/auth", authRoutes); router.use("/mfa", mfaRoutes); router.use("/bookings", bookingRoutes); router.use("/tours", tourRoutes); router.use("/destinations", destinationRoutes); router.use("/admin/destinations", adminDestinationRoutes); router.use("/reviews", reviewRoutes); router.use("/custom-tour-requests", customTourRequestRoutes); router.use("/wishlist", wishlistRoutes); router.use("/gallery", galleryRoutes); router.use("/hero", heroRoutes); router.use("/mpesa", mpesaRoutes); router.use("/payments", mpesaRoutes); router.use("/payments/stripe", stripeRoutes); router.use("/payments/paypal", paypalRoutes); router.use("/payments/cash", cashPaymentRoutes); router.use("/tenants", tenantRoutes);
// Perform the side effect or state update expressed on the following line.
router.use("/admin/auth", adminAuthRoutes); router.use("/admin/roles", adminRoleRoutes); router.use("/admin/payment-links", paymentLinkRoutes); router.use("/payment-links", paymentLinkRoutes); router.use("/admin/agents", adminAgentRoutes); router.use("/admin", adminRoutes); router.use("/admin/tours", adminTourRoutes); router.use("/admin/bookings", adminBookingRoutes); router.use("/admin/payments", adminPaymentRoutes); router.use("/system", systemHealthRoutes); router.use("/security", securityRoutes);
// Perform the side effect or state update expressed on the following line.
router.get("/admin/system-health", protect, checkPermission("system.security"), async (req, res) => { const mongoose = (await import("mongoose")).default; const memory = process.memoryUsage(); res.json({ status: "healthy", server: "running", nodeVersion: process.version, environment: process.env.NODE_ENV || "development", uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString(), database: mongoose.connection.readyState === 1 ? "connected" : "disconnected", memory: { used: Math.round(memory.heapUsed / 1024 / 1024) + " MB", total: Math.round(memory.heapTotal / 1024 / 1024) + " MB" }, platform: { os: process.platform, architecture: process.arch } }); });
// Perform the side effect or state update expressed on the following line.
router.get("/settings/public", getPublicSettings); router.use("/admin/settings", settingsRoutes); router.use("/admin/payment-gateways", paymentGatewayRoutes); router.use("/admin/dashboard", adminDashboardRoutes); router.use("/admin/packages", adminPackageRoutes); router.use("/admin/reviews", adminReviewRoutes); router.use("/admin/gallery", adminGalleryRoutes); router.use("/admin/experiences", adminCategoryRoutes); router.use("/admin/hero", adminHeroRoutes); router.use("/admin/coupons", adminCouponRoutes); router.use("/admin/finance", financeRoutes); router.use("/admin/compliance", complianceRoutes); router.use("/admin/tax", taxRoutes); router.use("/admin/credit-debit-notes", creditDebitNoteRoutes); router.use("/admin/developer", developerIntegrationRoutes); router.use("/privacy", privacyRoutes); router.use("/admin/operations", operationsRoutes); router.use("/operations", travelOperationsRoutes); router.use("/operational-assets", operationalAssetRoutes); router.use("/travel", travelLifecycleRoutes); router.use("/hotels", hotelRoutes); router.use("/airport-transfers", airportTransferRoutes); router.use("/hospitality-payments", hospitalityPaymentRoutes); router.use("/admin/hospitality-operations", hospitalityOperationsRoutes); router.use("/admin/customers", customerRoutes); router.use("/analytics", analyticsRoutes); router.use("/tourmanager", tourManagerRoutes); router.use("/tour-manager", tourManagerRoutes); router.use("/tour-assignments", tourAssignmentRoutes); router.use("/tour-reports", tourReportRoutes); router.use("/agents", agentRoutes); router.use("/agent", agentRoutes); router.use("/agents/bookings", agentBookingRoutes); router.use("/agent/bookings", agentBookingRoutes); router.use("/agents/customers", agentCustomerRoutes); router.use("/agent/customers", agentCustomerRoutes); router.use("/agents/packages", agentPackageRoutes); router.use("/agent/packages", agentPackageRoutes); router.use("/agents/quotes", quotationRoutes); router.use("/agent/quotes", quotationRoutes); router.use("/customers", customerRoutes); router.use("/documents", documentRoutes); router.use("/invoices", invoiceRoutes); router.use("/notifications", notificationRoutes); router.get("/health", (req, res) => res.status(200).json({ success: true, message: "Travel API healthy" })); router.use("/recommendations", recommendationRoutes); router.use("/guide", guideRoutes); router.use("/driver", driverRoutes); router.use("/vehicles", vehicleRoutes); router.use("/users", userRoutes); router.use("/staff", staffRoutes); router.use("/commissions", commissionRoutes); router.use("/crm", crmRoutes); router.use("/coupons", couponRoutes); router.use("/ai", aiRoutes); router.use("/admin-ai", adminAIRoutes); router.use("/", seoRoutes); router.use("/superadmin", superAdminRoutes); router.use("/superadmin/revenue", superAdminRevenueRoutes); router.use("/superadmin/roles", superAdminRoleRoutes); router.use("/superadmin/api-monitor", apiMonitorRoutes); router.use("/superadmin", superAdminOperationsRoutes); router.use("/superadmin/users", superAdminUserRoutes); router.use("/superadmin-tools", superAdminToolsRoutes); router.use("/superadmin/maintenance", superAdminMaintenanceRoutes);
export default router;
