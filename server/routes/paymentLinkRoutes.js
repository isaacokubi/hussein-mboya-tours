/**
 * Purpose: payment Link Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/tenantMiddleware.js so this module can use its exported dependencies.
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load ../controllers/paymentLinkController.js so this module can use its exported dependencies.
import { listPaymentLinks, createPaymentLink, getPaymentLink, cancelPaymentLink } from "../controllers/paymentLinkController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.get("/public/:token", resolveTenant, getPaymentLink);
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant, protect, authorize("finance.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", listPaymentLinks);
// Perform the side effect or state update expressed on the following line.
router.post("/", createPaymentLink);
// Perform the side effect or state update expressed on the following line.
router.post("/:id/cancel", cancelPaymentLink);
export default router;
