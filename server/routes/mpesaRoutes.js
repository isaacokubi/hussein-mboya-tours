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

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * POST /api/mpesa/stkpush
 *
 * Initiate an STK Push request.
 * Requires an authenticated user.
 */
router.post(
  "/stkpush",
  protect,
  stkPush
);

router.post(
  "/mpesa",
  protect,
  stkPush
);

/*
|--------------------------------------------------------------------------
| SAFARICOM CALLBACK
|--------------------------------------------------------------------------
|
| POST /api/mpesa/callback
|
| Public endpoint.
| Called directly by Safaricom Daraja.
| Do NOT protect with JWT middleware.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/callback",
  mpesaCallback
);

router.get(
  "/status/:checkoutRequestId",
  protect,
  checkCheckoutStatus
);

router.get(
  "/verify/:bookingId",
  protect,
  verifyBookingPayment
);

/*
|--------------------------------------------------------------------------
| MPESA REFUND CALLBACKS
|--------------------------------------------------------------------------
|
| These endpoints are public because Safaricom Daraja calls them
| server-to-server. Do not attach application JWT middleware.
|--------------------------------------------------------------------------
*/

router.post(
  "/refund/result",
  mpesaRefundResult
);

router.post(
  "/refund/timeout",
  mpesaRefundTimeout
);

export default router;
