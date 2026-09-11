import express from "express";
import { protect, managerOnly } from "../middleware/authMiddleware.js";
import { listTransfers, listAdminTransfers, createTransfer, updateTransfer, createTransferBooking, listTransferBookings, updateTransferBooking } from "../controllers/airportTransferController.js";

const router = express.Router();
router.get("/", listTransfers);
router.get("/admin/catalog", protect, managerOnly, listAdminTransfers);
router.post("/admin/catalog", protect, managerOnly, createTransfer);
router.patch("/admin/catalog/:id", protect, managerOnly, updateTransfer);
router.post("/bookings", protect, createTransferBooking);
router.get("/bookings", protect, listTransferBookings);
router.patch("/bookings/:id", protect, updateTransferBooking);
export default router;
