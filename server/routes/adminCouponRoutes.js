import { authorize } from "../middleware/permissionMiddleware.js";
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from "../controllers/adminCouponController.js";

const router = express.Router();
router.use(protect, adminMiddleware);

router.use(authorize("settings.manage"));
router.get("/", getAdminCoupons);
router.post("/", createAdminCoupon);
router.put("/:id", updateAdminCoupon);
router.delete("/:id", deleteAdminCoupon);

export default router;
