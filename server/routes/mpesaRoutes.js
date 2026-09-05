import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { mpesaRefundResult, mpesaRefundTimeout } from "../controllers/mpesaRefundController.js";
import { stkPush, checkCheckoutStatus, verifyBookingPayment } from "../controllers/mpesaController.js";
import { subscriptionMpesaCallback } from "../controllers/subscriptionMpesaCallbackController.js";
import { mpesaB2cResult, mpesaB2cTimeout } from "../controllers/mpesaB2cController.js";
import { protect } from "../middleware/authMiddleware.js";
import { prepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
import { resolveMpesaCallbackTenant } from "../middleware/resolveMpesaCallbackTenant.js";
import { resolveMpesaRefundTenant } from "../middleware/resolveMpesaRefundTenant.js";

const router = express.Router();

// Safaricom calls these server-to-server endpoints without the user's JWT.
router.post("/b2c/result", mpesaB2cResult);
router.post("/b2c/timeout", mpesaB2cTimeout);

router.use(resolveTenant);
router.post("/stkpush", protect, prepareBookingForMpesa, stkPush);
router.post("/mpesa", protect, prepareBookingForMpesa, stkPush);
router.post("/callback", resolveMpesaCallbackTenant, subscriptionMpesaCallback);
router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus);
router.get("/verify/:bookingId", protect, verifyBookingPayment);
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult);
router.post("/refund/timeout", mpesaRefundTimeout);
export default router;
