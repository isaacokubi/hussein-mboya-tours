import { resolveTenant } from "../middleware/tenantMiddleware.js";
import express from "express";
import { mpesaRefundResult, mpesaRefundTimeout } from "../controllers/mpesaRefundController.js";
import { stkPush, checkCheckoutStatus, verifyBookingPayment } from "../controllers/mpesaController.js";
import { queryMpesaPayment } from "../controllers/mpesaStatusController.js";
import { subscriptionMpesaCallback } from "../controllers/subscriptionMpesaCallbackController.js";
import { protect } from "../middleware/authMiddleware.js";
import { prepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
import { resolveMpesaCallbackTenant } from "../middleware/resolveMpesaCallbackTenant.js";
import { resolveMpesaRefundTenant } from "../middleware/resolveMpesaRefundTenant.js";
import { verifyMpesaCallbackIntegrity } from "../middleware/mpesaCallbackIntegrity.js";

const router = express.Router();
// Establish tenant scope before protected handlers; the public callback resolves its tenant from the provider request.
router.use(resolveTenant);
// Require a session and prepare/authorize the booking before initiating a charge.
router.post("/stkpush", protect, prepareBookingForMpesa, stkPush);
// Keep the legacy initiation alias on the same guarded path.
router.post("/mpesa", protect, prepareBookingForMpesa, stkPush);
// Resolve tenant and verify callback state with Daraja before the dispatcher mutates payment records.
router.post("/callback", resolveMpesaCallbackTenant, verifyMpesaCallbackIntegrity, subscriptionMpesaCallback);
// Lightweight read of the server-persisted state for client polling.
router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus);
// Explicit reconciliation query for an uncertain booking/hospitality STK request.
router.get("/query/:checkoutRequestId", protect, queryMpesaPayment);
// Booking verification returns canonical server state, not browser-calculated totals.
router.get("/verify/:bookingId", protect, verifyBookingPayment);
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult);
router.post("/refund/timeout", resolveMpesaRefundTenant, mpesaRefundTimeout);
export default router;
