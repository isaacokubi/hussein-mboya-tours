/**
 * Purpose: invoice Controller HTTP controller. Main declarations: createInvoice, getInvoices, getInvoice, downloadInvoice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// server/controllers/invoiceController.js

// Load fs so this module can use its exported dependencies.
import fs from "fs";
// Load path so this module can use its exported dependencies.
import path from "path";

// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// ============================================================
// CREATE INVOICE
// ============================================================

// Declare createInvoice for use by the surrounding module or function.
export const createInvoice = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { booking } for use by the surrounding module or function.
    const { booking } = req.body;

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Booking is required",
      });
    }

    // Declare bookingData for use by the surrounding module or function.
    const bookingData = await Booking.findOne(mergeTenantFilter(req, { _id: booking }))
      .populate("tour")
      .populate("customer", "firstName lastName email phone")
      .populate("user", "name email phone");

    // Check the condition (!bookingData) and run the matching branch.
    if (!bookingData) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare existingInvoice for use by the surrounding module or function.
    const existingInvoice = await Invoice.findOne(mergeTenantFilter(req, { booking }));

    // Check the condition (existingInvoice) and run the matching branch.
    if (existingInvoice) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({
        success: false,
        message: "Invoice already exists for this booking",
      });
    }

    // Never trust amount from the frontend. The booking is the financial source
    // of truth for the invoice.
    // Declare subtotal for use by the surrounding module or function.
    const subtotal = Number(bookingData.subtotal || bookingData.totalAmount || 0);
    // Declare discount for use by the surrounding module or function.
    const discount = Number(bookingData.discountAmount || 0);
    // Declare tax for use by the surrounding module or function.
    const tax = Number(bookingData.taxAmount || 0);
    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount = Number(bookingData.totalAmount || 0);
    // Declare amountPaid for use by the surrounding module or function.
    const amountPaid = Number(bookingData.depositAmount || 0);
    // Declare invoice for use by the surrounding module or function.
    const invoice = await Invoice.create({
      tenantId: req.tenantId,
      booking: bookingData._id,
      customer: bookingData.customer?._id || null,
      user: bookingData.user?._id || null,
      tour: bookingData.tour?._id || null,
      agent: bookingData.agent || null,
      subtotal,
      discount,
      tax,
      totalAmount,
      amountPaid,
      balance: Math.max(totalAmount - amountPaid, 0),
      paymentMethod: bookingData.paymentMethod === "BANK_TRANSFER" ? "BANK_TRANSFER" : (bookingData.paymentMethod || "MPESA"),
      paymentReference: bookingData.paymentReference || bookingData.transactionId || "",
      customerSnapshot: bookingData.customerSnapshot || {
        name: bookingData.contact?.name || "",
        email: bookingData.contact?.email || "",
        phone: bookingData.contact?.phone || "",
      },
      dueDate: bookingData.travelDate,
      status: amountPaid >= totalAmount && totalAmount > 0 ? "paid" : amountPaid > 0 ? "partial" : "pending",
    });

    // Declare populatedInvoice for use by the surrounding module or function.
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: "booking",
        populate: [
          {
            path: "tour",
          },
          {
            path: "customer",
            select: "name email phone",
          },
        ],
      });

    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: populatedInvoice,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// ============================================================
// GET ALL INVOICES
// ============================================================

// Declare getInvoices for use by the surrounding module or function.
export const getInvoices = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find(tenantFilter(req))
      .populate({
        path: "booking",
        populate: [
          {
            path: "tour",
          },
          {
            path: "customer",
            select: "name email phone",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// ============================================================
// GET SINGLE INVOICE
// ============================================================

// Declare getInvoice for use by the surrounding module or function.
export const getInvoice = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare invoice for use by the surrounding module or function.
    const invoice = await Invoice.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
).populate({
      path: "booking",
      populate: [
        {
          path: "tour",
        },
        {
          path: "customer",
          select: "name email phone",
        },
      ],
    });

    // Check the condition (!invoice) and run the matching branch.
    if (!invoice) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// ============================================================
// DOWNLOAD INVOICE PDF
// ============================================================

// Declare downloadInvoice for use by the surrounding module or function.
export const downloadInvoice = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Declare filePath for use by the surrounding module or function.
    const filePath = path.join(
      process.cwd(),
      "uploads",
      `${booking.bookingNumber}.pdf`
    );

    // Check the condition (!fs.existsSync(filePath)) and run the matching branch.
    if (!fs.existsSync(filePath)) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Invoice PDF not found",
      });
    }

    // Return the result of res.download() to the caller.
    return res.download(
      filePath,
      `${booking.bookingNumber}.pdf`
    );
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};