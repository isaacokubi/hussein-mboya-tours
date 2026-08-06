// server/routes/mpesaRoutes.js

import express from "express";

import {
mpesaRefundResult
}
from "../controllers/mpesaRefundController.js";

import {
  stkPush,
  mpesaCallback,
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

export default router;

/*
|--------------------------------------------------------------------------
| MPESA REFUND CALLBACKS
|--------------------------------------------------------------------------
*/

router.post(
"/refund/result",
handleRefundResult
);


router.post(
"/refund/timeout",
handleRefundTimeout
);

