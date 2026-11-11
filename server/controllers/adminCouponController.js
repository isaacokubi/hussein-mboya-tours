/**
 * Purpose: admin Coupon Controller HTTP controller. Main declarations: normalizeCouponPayload, validateCouponPayload, serializeCoupon, getAdminCoupons, createAdminCoupon.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Coupon.js so this module can use its exported dependencies.
import Coupon from "../models/Coupon.js";

// Declare normalizeCouponPayload for use by the surrounding module or function.
const normalizeCouponPayload = (body = {}) => {
  // Declare payload for use by the surrounding module or function.
  const payload = { ...body };
  // Check the condition (payload.code != null) and run the matching branch.
  if (payload.code != null) payload.code = String(payload.code).trim().toUpperCase();
  // Check the condition (payload.description != null) and run the matching branch.
  if (payload.description != null) payload.description = String(payload.description).trim();
  // Check the condition (payload.discountType != null) and run the matching branch.
  if (payload.discountType != null) payload.discountType = String(payload.discountType).toLowerCase();
  // Check the condition (payload.amount != null) and run the matching branch.
  if (payload.amount != null) payload.amount = Number(payload.amount);
  // Check the condition (payload.usageLimit != null) and run the matching branch.
  if (payload.usageLimit != null) payload.usageLimit = Number(payload.usageLimit);
  // Check the condition (payload.minimumBookingAmount != null) and run the matching branch.
  if (payload.minimumBookingAmount != null) payload.minimumBookingAmount = Number(payload.minimumBookingAmount);
  // Check the condition (payload.maximumDiscount === "" || payload.maximumDiscount == null) and run the matching branch.
  if (payload.maximumDiscount === "" || payload.maximumDiscount == null) payload.maximumDiscount = null;
  else payload.maximumDiscount = Number(payload.maximumDiscount);
  // Check the condition (payload.startDate) and run the matching branch.
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  // Check the condition (payload.expiresAt) and run the matching branch.
  if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt);
  // Return the value of payload to the caller.
  return payload;
};

// Declare validateCouponPayload for use by the surrounding module or function.
const validateCouponPayload = (payload) => {
  // Check the condition (!payload.code || payload.code.length < 2 || payload.code.length > 50) and run the matching branch.
  if (!payload.code || payload.code.length < 2 || payload.code.length > 50) {
    // Return a configured text value to the caller.
    return "Coupon code must be between 2 and 50 characters";
  }
  // Check the condition (payload.discountType !== "percentage" && payload.discountType !== "fix) and run the matching branch.
  if (payload.discountType !== "percentage" && payload.discountType !== "fixed") {
    // Return a configured text value to the caller.
    return "Discount type must be percentage or fixed";
  }
  // Check the condition (!Number.isFinite(payload.amount) || payload.amount < 0) and run the matching branch.
  if (!Number.isFinite(payload.amount) || payload.amount < 0) return "Discount amount must be a valid non-negative number";
  // Check the condition (payload.discountType === "percentage" && payload.amount > 100) and run the matching branch.
  if (payload.discountType === "percentage" && payload.amount > 100) return "Percentage discount cannot exceed 100%";
  // Check the condition (!Number.isInteger(payload.usageLimit) || payload.usageLimit < 1) and run the matching branch.
  if (!Number.isInteger(payload.usageLimit) || payload.usageLimit < 1) return "Usage limit must be at least 1";
  // Check the condition (payload.minimumBookingAmount != null && (!Number.isFinite(payload.mini) and run the matching branch.
  if (payload.minimumBookingAmount != null && (!Number.isFinite(payload.minimumBookingAmount) || payload.minimumBookingAmount < 0)) {
    // Return a configured text value to the caller.
    return "Minimum booking amount must be valid";
  }
  // Check the condition (payload.maximumDiscount != null && (!Number.isFinite(payload.maximumDi) and run the matching branch.
  if (payload.maximumDiscount != null && (!Number.isFinite(payload.maximumDiscount) || payload.maximumDiscount < 0)) {
    // Return a configured text value to the caller.
    return "Maximum discount must be valid";
  }
  // Check the condition (payload.expiresAt && Number.isNaN(payload.expiresAt.getTime())) and run the matching branch.
  if (payload.expiresAt && Number.isNaN(payload.expiresAt.getTime())) return "Expiry date is invalid";
  // Check the condition (payload.startDate && Number.isNaN(payload.startDate.getTime())) and run the matching branch.
  if (payload.startDate && Number.isNaN(payload.startDate.getTime())) return "Start date is invalid";
  // Check the condition (payload.startDate && payload.expiresAt && payload.expiresAt <= payload) and run the matching branch.
  if (payload.startDate && payload.expiresAt && payload.expiresAt <= payload.startDate) return "Expiry date must be after the start date";
  // Return the expression shown below to the caller.
  return null;
};

// Declare serializeCoupon for use by the surrounding module or function.
const serializeCoupon = (coupon) => {
  // Declare plain for use by the surrounding module or function.
  const plain = typeof coupon?.toObject === "function" ? coupon.toObject() : { ...coupon };
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare usedCount for use by the surrounding module or function.
  const usedCount = Number(plain.usedCount || 0);
  // Declare usageLimit for use by the surrounding module or function.
  const usageLimit = Number(plain.usageLimit || 0);
  // Declare startDate for use by the surrounding module or function.
  const startDate = plain.startDate ? new Date(plain.startDate) : null;
  // Declare expiresAt for use by the surrounding module or function.
  const expiresAt = plain.expiresAt ? new Date(plain.expiresAt) : null;

  // Declare status for use by the surrounding module or function.
  let status = "active";
  // Check the condition (plain.active === false) and run the matching branch.
  if (plain.active === false) status = "inactive";
  else if (expiresAt && expiresAt <= now) status = "expired";
  else if (startDate && startDate > now) status = "scheduled";
  else if (usageLimit > 0 && usedCount >= usageLimit) status = "used";

  // Return the object assembled below to the caller.
  return {
    ...plain,
    usedCount,
    usageLimit,
    remainingUses: Math.max(usageLimit - usedCount, 0),
    expired: Boolean(expiresAt && expiresAt <= now),
    status,
  };
};

// Declare getAdminCoupons for use by the surrounding module or function.
export const getAdminCoupons = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare coupons for use by the surrounding module or function.
    const coupons = await Coupon.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean();
    // Declare serialized for use by the surrounding module or function.
    const serialized = coupons.map(serializeCoupon);
    // Perform the side effect or state update expressed on the following line.
    res.set("Cache-Control", "no-store");
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: serialized.length, coupons: serialized });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare createAdminCoupon for use by the surrounding module or function.
export const createAdminCoupon = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare payload for use by the surrounding module or function.
    const payload = normalizeCouponPayload(req.body);
    // Declare validationError for use by the surrounding module or function.
    const validationError = validateCouponPayload(payload);
    // Check the condition (validationError) and run the matching branch.
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    // Declare coupon for use by the surrounding module or function.
    const coupon = await Coupon.create({
      ...payload,
      createdBy: req.user?._id || null,
    });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, coupon: serializeCoupon(coupon) });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    }
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updateAdminCoupon for use by the surrounding module or function.
export const updateAdminCoupon = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare payload for use by the surrounding module or function.
    const payload = normalizeCouponPayload(req.body);
    // Declare validationError for use by the surrounding module or function.
    const validationError = validateCouponPayload(payload);
    // Check the condition (validationError) and run the matching branch.
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid coupon id" });
    }

    // Declare coupon for use by the surrounding module or function.
    const coupon = await Coupon.findOneAndUpdate(
      mergeTenantFilter({ _id: req.params.id }),
      payload,
      { new: true, runValidators: true }
    );
    // Check the condition (!coupon) and run the matching branch.
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, coupon: serializeCoupon(coupon) });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    }
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteAdminCoupon for use by the surrounding module or function.
export const deleteAdminCoupon = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid coupon id" });
    }

    // Declare coupon for use by the surrounding module or function.
    const coupon = await Coupon.findOneAndDelete(
      mergeTenantFilter({ _id: req.params.id })
    );
    // Check the condition (!coupon) and run the matching branch.
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
