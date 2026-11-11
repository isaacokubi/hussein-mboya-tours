/**
 * Purpose: invoice Routes API route module. Main declarations: invoiceOwnerOrPrivileged.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/invoiceRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../controllers/invoiceController.js so this module can use its exported dependencies.
import { downloadInvoice } from "../controllers/invoiceController.js";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import { protect } from "../middleware/authMiddleware.js";
// Load ../controllers/phase3InvoiceAccess.js so this module can use its exported dependencies.
import { canAccessBooking } from "../controllers/phase3InvoiceAccess.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Declare invoiceOwnerOrPrivileged for use by the surrounding module or function.
const invoiceOwnerOrPrivileged = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
      mergeTenantFilter(req, { _id: req.params.id })
    )
      .select("user customer")
      .populate("customer", "user")
      .lean();
    // Check the condition (!booking) and run the matching branch.
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    // Check the condition (!canAccessBooking(booking, req.user)) and run the matching branch.
    if (!canAccessBooking(booking, req.user)) {
      // Return the result of res.status(403).json() to the caller.
      return res.status(403).json({ success: false, message: "You do not have access to this invoice." });
    }
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("INVOICE AUTHORIZATION ERROR:", error);
    // Return the result of res.status(error?.status || 500).json() to the caller.
    return res.status(error?.status || 500).json({ success: false, message: error?.message || "Invoice authorization failed" });
  }
};

// GET /api/invoices/:id
// Perform the side effect or state update expressed on the following line.
router.get("/:id", invoiceOwnerOrPrivileged, downloadInvoice);

export default router;
