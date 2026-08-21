import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import Quotation from "../models/Quotation.js";
import Agent from "../models/Agent.js";
import { calculateQuotation } from "../services/quotationCalculator.js";

/*
|--------------------------------------------------------------------------
| CREATE QUOTATION
|--------------------------------------------------------------------------
| POST /api/agent/quotations
|--------------------------------------------------------------------------
*/

export const createQuotation = async (req, res, next) => {
  try {
    const agent = await Agent.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    const {
      customer,
      tourPackage,
      items,
      discount = 0,
      taxRate = 0,
      notes = "",
      validUntil,
    } = req.body;

    if (!customer || !tourPackage || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer, tour package and quotation items are required.",
      });
    }

    const totals = calculateQuotation(
      items,
      discount,
      taxRate
    );

    const quotation = await Quotation.create({
      agent: agent._id,
      customer,
      tourPackage,
      items,
      ...totals,
      discount,
      taxRate,
      notes,
      validUntil,
      status: "draft",
    });

    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customer", "name email phone")
      .populate("tourPackage", "title destination price");

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully.",
      quotation: populatedQuotation,
    });
  } catch (error) {
    console.error("CREATE QUOTATION ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET AGENT QUOTATIONS
|--------------------------------------------------------------------------
| GET /api/agent/quotations
|--------------------------------------------------------------------------
*/

export const getAgentQuotations = async (req, res, next) => {
  try {
    const agent = await Agent.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    const quotations = await Quotation.find(mergeTenantFilter(req,{
      agent: agent._id,
    })
      .populate("customer", "name email phone")
      .populate("tourPackage", "title destination price")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    console.error("GET AGENT QUOTATIONS ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE QUOTATION
|--------------------------------------------------------------------------
| GET /api/agent/quotations/:id
|--------------------------------------------------------------------------
*/

export const getQuotationById = async (req, res, next) => {
  try {
    const agent = await Agent.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    const quotation = await Quotation.findOne(mergeTenantFilter(req,{
      _id: req.params.id,
      agent: agent._id,
    })
      .populate("customer")
      .populate("tourPackage");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    return res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    console.error("GET QUOTATION ERROR:", error);
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE QUOTATION STATUS
|--------------------------------------------------------------------------
| PATCH /api/agent/quotations/:id/status
|--------------------------------------------------------------------------
*/

export const updateQuotationStatus = async (req, res, next) => {
  try {
    const agent = await Agent.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "draft",
      "sent",
      "approved",
      "rejected",
      "expired",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quotation status.",
      });
    }

    const quotation = await Quotation.findOneAndUpdate(
      {
        _id: req.params.id,
        agent: agent._id,
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("customer", "name email phone")
      .populate("tourPackage", "title destination price");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation status updated successfully.",
      quotation,
    });
  } catch (error) {
    console.error("UPDATE QUOTATION STATUS ERROR:", error);
    next(error);
  }
};