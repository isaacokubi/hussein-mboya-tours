// server/routes/mpesaRoutes.js

import express from "express";

import {
  mpesaRefundResult,
  mpesaRefundTimeout,
} from "../controllers/mpesaRefundController.js";

import {
  stkPush,
  mpesaCallback,
  checkCheckoutStatus,
  verifyBookingPayment,
} from "../controllers/mpesaController.js";

import { protect } from "../middleware/authMiddleware.js";
import { prepareBookingForMpesa } from "../middleware/prepareBookingForMpesa.js";
import { resolveMpesaPaymentTenant } from "../middleware/paymentTenantMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/stkpush",
  protect,
  prepareBookingForMpesa,
  stkPush
);

router.post(
  "/mpesa",
  protect,
  prepareBookingForMpesa,
  stkPush
);

/*
|--------------------------------------------------------------------------
| SAFARICOM CALLBACK
|--------------------------------------------------------------------------
*/
router.post("/callback", resolveMpesaPaymentTenant, mpesaCallback);

router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus);
router.get("/verify/:bookingId", protect, verifyBookingPayment);

/* M-Pesa refund callbacks are public because Daraja calls them server-to-server. */
router.post("/refund/result", resolveMpesaPaymentTenant, mpesaRefundResult);
router.post("/refund/timeout", mpesaRefundTimeout);

export default router;
