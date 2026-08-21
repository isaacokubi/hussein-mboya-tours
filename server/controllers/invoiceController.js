import {mergeTenantFilter} from "../tenancy/secureQuery.js";
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
  try {
    const { booking } = req.body;

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: "Booking is required",
      });
    }

    const bookingData = await Booking.findById(booking)
      .populate("tour")
      .populate("customer", "name email");

    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const existingInvoice = await Invoice.findOne(mergeTenantFilter(req,{
      booking,
    });

    if (existingInvoice) {
      return res.status(409).json({
        success: false,
        message: "Invoice already exists for this booking",
      });
    }

    // Never trust amount from frontend
    const amount =
      bookingData.amount ||
      bookingData.totalAmount ||
      bookingData.subtotal ||
      0;

    const invoice = await Invoice.create({
      booking,
      invoiceNumber: `INV-${Date.now()}`,
      amount,
      status: "pending",
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
    const invoice = await Invoice.findById(req.params.id).populate({
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
    const booking = await Booking.findById(req.params.id);

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