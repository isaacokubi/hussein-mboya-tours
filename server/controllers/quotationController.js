/**
 * Purpose: quotation Controller HTTP controller. Main declarations: createQuotation, getAgentQuotations, getQuotationById, updateQuotationStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Quotation.js so this module can use its exported dependencies.
import Quotation from "../models/Quotation.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../services/quotationCalculator.js so this module can use its exported dependencies.
import { calculateQuotation } from "../services/quotationCalculator.js";

/*
|--------------------------------------------------------------------------
| CREATE QUOTATION
|--------------------------------------------------------------------------
| POST /api/agent/quotations
|--------------------------------------------------------------------------
*/

// Declare createQuotation for use by the surrounding module or function.
export const createQuotation = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(mergeTenantFilter(req, {
      user: req.user._id,
    }));

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Declare { customer, tourPackage, items, discount = 0, taxRate = 0, notes = "", validUntil, } for use by the surrounding module or function.
    const {
      customer,
      tourPackage,
      items,
      discount = 0,
      taxRate = 0,
      notes = "",
      validUntil,
    } = req.body;

    // Check the condition (!customer || !tourPackage || !Array.isArray(items) || items.length ===) and run the matching branch.
    if (!customer || !tourPackage || !Array.isArray(items) || items.length === 0) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Customer, tour package and quotation items are required.",
      });
    }

    // Declare totals for use by the surrounding module or function.
    const totals = calculateQuotation(
      items,
      discount,
      taxRate
    );

    // Declare quotation for use by the surrounding module or function.
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

    // Declare populatedQuotation for use by the surrounding module or function.
    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate("customer", "name email phone")
      .populate("tourPackage", "title destination price");

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      message: "Quotation created successfully.",
      quotation: populatedQuotation,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("CREATE QUOTATION ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
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

// Declare getAgentQuotations for use by the surrounding module or function.
export const getAgentQuotations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(mergeTenantFilter(req, {
      user: req.user._id,
    }));

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Declare quotations for use by the surrounding module or function.
    const quotations = await Quotation.find(mergeTenantFilter(req, {
      agent: agent._id,
    }))
      .populate("customer", "name email phone")
      .populate("tourPackage", "title destination price")
      .sort({
        createdAt: -1,
      });

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("GET AGENT QUOTATIONS ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
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

// Declare getQuotationById for use by the surrounding module or function.
export const getQuotationById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(mergeTenantFilter(req, {
      user: req.user._id,
    }));

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Declare quotation for use by the surrounding module or function.
    const quotation = await Quotation.findOne(mergeTenantFilter(req, {
      _id: req.params.id,
      agent: agent._id,
    }))
      .populate("customer")
      .populate("tourPackage");

    // Check the condition (!quotation) and run the matching branch.
    if (!quotation) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      quotation,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("GET QUOTATION ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
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

// Declare updateQuotationStatus for use by the surrounding module or function.
export const updateQuotationStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await Agent.findOne(mergeTenantFilter(req, {
      user: req.user._id,
    }));

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found",
      });
    }

    // Declare { status } for use by the surrounding module or function.
    const { status } = req.body;

    // Declare allowedStatuses for use by the surrounding module or function.
    const allowedStatuses = [
      "draft",
      "sent",
      "approved",
      "rejected",
      "expired",
    ];

    // Check the condition (!allowedStatuses.includes(status)) and run the matching branch.
    if (!allowedStatuses.includes(status)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid quotation status.",
      });
    }

    // Declare quotation for use by the surrounding module or function.
    const quotation = await Quotation.findOneAndUpdate(
      mergeTenantFilter(req, {
        _id: req.params.id,
        agent: agent._id,
      }),
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

    // Check the condition (!quotation) and run the matching branch.
    if (!quotation) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Quotation not found.",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Quotation status updated successfully.",
      quotation,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("UPDATE QUOTATION STATUS ERROR:", error);
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
