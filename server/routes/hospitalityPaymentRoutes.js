import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { initiateHospitalityMpesa, initiateHospitalityCard, verifyHospitalityCard, submitHospitalityBank, confirmHospitalityBank, getHospitalityPayments } from "../controllers/hospitalityPaymentController.js";

const router = express.Router();
router.post("/mpesa", protect, initiateHospitalityMpesa);
router.post("/card", protect, initiateHospitalityCard);
router.get("/card/verify/:sessionId", protect, verifyHospitalityCard);
router.post("/bank", protect, submitHospitalityBank);
router.post("/bank/:paymentId/confirm", protect, confirmHospitalityBank);
router.get("/:bookingId", protect, getHospitalityPayments);
export default router;
