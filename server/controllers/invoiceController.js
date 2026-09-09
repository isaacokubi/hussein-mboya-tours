import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
// server/controllers/invoiceController.js

import fs from "fs";
import path from "path";

import Invoice from "../models/Invoice.js";
import Booking from "../models/Booking.js";

// ============================================================
// CREATE INVOICE
// ============================================================

export const createInvoice = async (req, res, next) => {
  requireTenantId();
  try {
    const { booking } = req.body;

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking is required",
      });
    }

    const bookingData = await Booking.findOne(mergeTenantFilter(req, { _id: booking }))
      .populate("tour")
      .populate("customer", "firstName lastName email phone")
      .populate("user", "name email phone");

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const existingInvoice = await Invoice.findOne(mergeTenantFilter(req, { booking }));

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: "Invoice already exists for this booking",
      });
    }

    // Never trust amount from the frontend. The booking is the financial source
    // of truth for the invoice.
    const subtotal = Number(bookingData.subtotal || bookingData.totalAmount || 0);
    const discount = Number(bookingData.discountAmount || 0);
    const tax = Number(bookingData.taxAmount || 0);
    const totalAmount = Number(bookingData.totalAmount || 0);
    const amountPaid = Number(bookingData.depositAmount || 0);
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

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: populatedInvoice,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL INVOICES
// ============================================================

export const getInvoices = async (req, res, next) => {
  try {
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

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE INVOICE
// ============================================================

export const getInvoice = async (req, res, next) => {
  try {
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

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DOWNLOAD INVOICE PDF
// ============================================================

export const downloadInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      "uploads",
      `${booking.bookingNumber}.pdf`
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice PDF not found",
      });
    }

    return res.download(
      filePath,
      `${booking.bookingNumber}.pdf`
    );
  } catch (error) {
    next(error);
  }
};