import express from "express";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import { issueVoucher, redeemVoucher, calculateDynamicPrice, loyaltyBalance, earnLoyalty, redeemLoyalty } from "../controllers/travelLifecycleController.js";

const router = express.Router();
router.use(protect);
router.post("/vouchers", managerOnly, issueVoucher);
router.post("/vouchers/redeem", redeemVoucher);
router.post("/pricing/calculate", calculateDynamicPrice);
router.get("/loyalty/:customerId", loyaltyBalance);
router.post("/loyalty/earn", managerOnly, earnLoyalty);
router.post("/loyalty/redeem", redeemLoyalty);
export default router;
