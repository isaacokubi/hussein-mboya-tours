import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/invoiceRoutes.js

import express from "express";
import Booking from "../models/Booking.js";
import { downloadInvoice } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { canAccessBooking } from "../controllers/phase3InvoiceAccess.js";

const router = express.Router();

router.use(resolveTenant);

router.use(protect);

const invoiceOwnerOrPrivileged = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).select("user customer").populate("customer", "user").lean();
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ success: false, message: "You do not have access to this invoice." });
    }
    next();
  } catch (error) {
    console.error("INVOICE AUTHORIZATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Invoice authorization failed" });
  }
};

// GET /api/invoices/:id
router.get("/:id", invoiceOwnerOrPrivileged, downloadInvoice);

export default router;
