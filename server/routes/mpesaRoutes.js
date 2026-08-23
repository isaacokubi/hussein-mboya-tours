import { resolveTenant } from "../middleware/tenantMiddleware.js";
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
import { resolveMpesaCallbackTenant } from "../middleware/resolveMpesaCallbackTenant.js";
import { resolveMpesaRefundTenant } from "../middleware/resolveMpesaRefundTenant.js";

const router = express.Router();

router.use(resolveTenant);

router.post("/stkpush", protect, prepareBookingForMpesa, stkPush);
router.post("/mpesa", protect, prepareBookingForMpesa, stkPush);

/* Safaricom callbacks are public server-to-server requests, but their payment
   record determines the tenant context before any tenant-scoped model query. */
router.post("/callback", resolveMpesaCallbackTenant, mpesaCallback);

router.get("/status/:checkoutRequestId", protect, checkCheckoutStatus);
router.get("/verify/:bookingId", protect, verifyBookingPayment);

/* M-Pesa refund callbacks are public because Daraja calls them server-to-server. */
router.post("/refund/result", resolveMpesaRefundTenant, mpesaRefundResult);
router.post("/refund/timeout", mpesaRefundTimeout);

export default router;
