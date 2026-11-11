/**
 * Purpose: hospitality Payment Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../controllers/hospitalityPaymentController.js so this module can use its exported dependencies.
import { initiateHospitalityMpesa, initiateHospitalityCard, verifyHospitalityCard, submitHospitalityBank, confirmHospitalityBank, getHospitalityPayments } from "../controllers/hospitalityPaymentController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();
// Perform the side effect or state update expressed on the following line.
router.post("/mpesa", protect, initiateHospitalityMpesa);
// Perform the side effect or state update expressed on the following line.
router.post("/card", protect, initiateHospitalityCard);
// Perform the side effect or state update expressed on the following line.
router.get("/card/verify/:sessionId", protect, verifyHospitalityCard);
// Perform the side effect or state update expressed on the following line.
router.post("/bank", protect, submitHospitalityBank);
// Perform the side effect or state update expressed on the following line.
router.post("/bank/:paymentId/confirm", protect, confirmHospitalityBank);
// Perform the side effect or state update expressed on the following line.
router.get("/:bookingId", protect, getHospitalityPayments);
export default router;
