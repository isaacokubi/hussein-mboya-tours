/**
 * Purpose: admin Coupon Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load ../middleware/permissionMiddleware.js so this module can use its exported dependencies.
import { authorize } from "../middleware/permissionMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/adminMiddleware.js so this module can use its exported dependencies.
import adminMiddleware from "../middleware/adminMiddleware.js";
// Load ../controllers/adminCouponController.js so this module can use its exported dependencies.
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from "../controllers/adminCouponController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.use(protect, adminMiddleware);

// Perform the side effect or state update expressed on the following line.
router.use(authorize("coupon.manage"));
// Perform the side effect or state update expressed on the following line.
router.get("/", getAdminCoupons);
// Perform the side effect or state update expressed on the following line.
router.post("/", createAdminCoupon);
// Perform the side effect or state update expressed on the following line.
router.put("/:id", updateAdminCoupon);
// Perform the side effect or state update expressed on the following line.
router.delete("/:id", deleteAdminCoupon);

export default router;
