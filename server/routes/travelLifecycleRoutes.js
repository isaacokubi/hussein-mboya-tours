/**
 * Purpose: travel Lifecycle Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect, managerOnly } from "../middleware/authMiddleware.js";
// Load ../controllers/travelLifecycleController.js so this module can use its exported dependencies.
import { issueVoucher, redeemVoucher, calculateDynamicPrice, loyaltyBalance, earnLoyalty, redeemLoyalty } from "../controllers/travelLifecycleController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.use(protect);
// Perform the side effect or state update expressed on the following line.
router.post("/vouchers", managerOnly, issueVoucher);
// Perform the side effect or state update expressed on the following line.
router.post("/vouchers/redeem", redeemVoucher);
// Perform the side effect or state update expressed on the following line.
router.post("/pricing/calculate", calculateDynamicPrice);
// Perform the side effect or state update expressed on the following line.
router.get("/loyalty/:customerId", loyaltyBalance);
// Perform the side effect or state update expressed on the following line.
router.post("/loyalty/earn", managerOnly, earnLoyalty);
// Perform the side effect or state update expressed on the following line.
router.post("/loyalty/redeem", redeemLoyalty);
export default router;
