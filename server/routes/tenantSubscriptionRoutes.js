/**
 * Purpose: tenant Subscription Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../controllers/tenantSubscriptionController.js so this module can use its exported dependencies.
import { getTenantSubscription, startTenantSubscriptionPayment, getTenantSubscriptionPaymentStatus } from "../controllers/tenantSubscriptionController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect, resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.get("/", getTenantSubscription);
// Perform the side effect or state update expressed on the following line.
router.post("/mpesa", startTenantSubscriptionPayment);
// Perform the side effect or state update expressed on the following line.
router.get("/payment/:checkoutRequestId", getTenantSubscriptionPaymentStatus);
export default router;
