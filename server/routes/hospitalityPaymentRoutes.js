import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { initiateHospitalityMpesa, getHospitalityPayments } from "../controllers/hospitalityPaymentController.js";

const router = express.Router();
router.post("/mpesa", protect, initiateHospitalityMpesa);
router.get("/:bookingId", protect, getHospitalityPayments);
export default router;
