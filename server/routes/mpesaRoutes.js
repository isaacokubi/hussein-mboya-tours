// server/routes/mpesaRoutes.js

import express from "express";

import {
mpesaRefundResult
}
from "../controllers/mpesaRefundController.js";

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

export default router;

/*
|--------------------------------------------------------------------------
| MPESA REFUND CALLBACKS
|--------------------------------------------------------------------------
*/

router.post(
"/refund/result",
mpesaRefundResult
);

