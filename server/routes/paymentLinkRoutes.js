import express from "express";
import { resolveTenant } from "../middleware/tenantMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { listPaymentLinks, createPaymentLink, getPaymentLink, cancelPaymentLink } from "../controllers/paymentLinkController.js";

const router = express.Router();
router.get("/public/:token", resolveTenant, getPaymentLink);
router.use(resolveTenant, protect, authorize("finance.manage"));
router.get("/", listPaymentLinks);
router.post("/", createPaymentLink);
router.post("/:id/cancel", cancelPaymentLink);
export default router;
