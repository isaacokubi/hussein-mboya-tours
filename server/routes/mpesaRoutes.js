/**
 * Purpose: mpesa Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load express-rate-limit so this module can use its exported dependencies.
import rateLimit from "express-rate-limit";
// Load ../controllers/mpesaRefundController.js so this module can use its exported dependencies.
import { mpesaRefundResult, mpesaRefundTimeout } from "../controllers/mpesaRefundController.js";
// Load ../controllers/mpesaController.js so this module can use its exported dependencies.
import { stkPush, checkCheckoutStatus, verifyBookingPayment } from "../controllers/mpesaController.js";
// Load ../controllers/mpesaStatusController.js so this module can use its exported dependencies.
import { queryMpesaPayment } from "../controllers/mpesaStatusController.js";
// Load ../controllers/subscriptionMpesaCallbackController.js so this module can use its exported dependencies.
import { subscriptionMpesaCallback } from "../controllers/subscriptionMpesaCallbackController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../middleware/prepareBookingForMpesa.js so this module can use its exported dependencies.
import { prepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
// Load ../middleware/resolveMpesaCallbackTenant.js so this module can use its exported dependencies.
import { resolveMpesaCallbackTenant } from "../middleware/resolveMpesaCallbackTenant.js";
// Load ../middleware/resolveMpesaRefundTenant.js so this module can use its exported dependencies.
import { resolveMpesaRefundTenant } from "../middleware/resolveMpesaRefundTenant.js";
// Load ../middleware/mpesaCallbackIntegrity.js so this module can use its exported dependencies.
import { validateMpesaCallbackPayload, verifyMpesaCallbackIntegrity } from "../middleware/mpesaCallbackIntegrity.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Declare paymentInitiationLimit for use by the surrounding module or function.
const paymentInitiationLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);
// Perform the side effect or state update expressed on the following line.
router.post("/stkpush", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush);
// Perform the side effect or state update expressed on the following line.
router.post("/mpesa", protect, paymentInitiationLimit, prepareBookingForMpesa, stkPush);
// Perform the side effect or state update expressed on the following line.
router.post("/callback", validateMpesaCallbackPayload, resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback);
// Perform the side effect or state update expressed on the following line.
router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus);
// Perform the side effect or state update expressed on the following line.
router.get("/query/:checkoutRequestId", protect, queryMpesaPayment);
// Perform the side effect or state update expressed on the following line.
router.get("/verify/:bookingId", protect, verifyBookingPayment);
// Perform the side effect or state update expressed on the following line.
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult);
// Perform the side effect or state update expressed on the following line.
router.post("/refund/timeout", resolveMpesaRefundTenant, mpesaRefundTimeout);
export default router;
