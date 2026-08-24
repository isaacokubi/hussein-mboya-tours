import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { getTenantSubscription, startTenantSubscriptionPayment, getTenantSubscriptionPaymentStatus } from "../controllers/tenantSubscriptionController.js";

const router = express.Router();
router.use(protect, resolveTenant);
router.get("/", getTenantSubscription);
router.post("/mpesa", startTenantSubscriptionPayment);
router.get("/payment/:checkoutRequestId", getTenantSubscriptionPaymentStatus);
export default router;
