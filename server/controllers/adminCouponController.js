import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Coupon from "../models/Coupon.js";

const normalizeCouponPayload = (body = {}) => {
  const payload = { ...body };
  if (payload.code != null) payload.code = String(payload.code).trim().toUpperCase();
  if (payload.description != null) payload.description = String(payload.description).trim();
  if (payload.discountType != null) payload.discountType = String(payload.discountType).toLowerCase();
  if (payload.amount != null) payload.amount = Number(payload.amount);
  if (payload.usageLimit != null) payload.usageLimit = Number(payload.usageLimit);
  if (payload.minimumBookingAmount != null) payload.minimumBookingAmount = Number(payload.minimumBookingAmount);
  if (payload.maximumDiscount === "" || payload.maximumDiscount == null) payload.maximumDiscount = null;
  else payload.maximumDiscount = Number(payload.maximumDiscount);
  if (payload.startDate) payload.startDate = new Date(payload.startDate);
  if (payload.expiresAt) payload.expiresAt = new Date(payload.expiresAt);
  return payload;
};

const validateCouponPayload = (payload) => {
  if (payload.discountType !== "percentage" && payload.discountType !== "fixed") {
    return "Discount type must be percentage or fixed";
  }
  if (!Number.isFinite(payload.amount) || payload.amount < 0) return "Discount amount must be a valid non-negative number";
  if (payload.discountType === "percentage" && payload.amount > 100) return "Percentage discount cannot exceed 100%";
  if (!Number.isInteger(payload.usageLimit) || payload.usageLimit < 1) return "Usage limit must be at least 1";
  if (payload.maximumDiscount != null && (!Number.isFinite(payload.maximumDiscount) || payload.maximumDiscount < 0)) return "Maximum discount must be valid";
  if (payload.expiresAt && Number.isNaN(payload.expiresAt.getTime())) return "Expiry date is invalid";
  if (payload.startDate && Number.isNaN(payload.startDate.getTime())) return "Start date is invalid";
  if (payload.startDate && payload.expiresAt && payload.expiresAt <= payload.startDate) return "Expiry date must be after the start date";
  return null;
};

export const getAdminCoupons = async (req, res, next) => {
  requireTenantId();
  try {
    const coupons = await Coupon.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();
    const now = new Date();
    const enriched = coupons.map((coupon) => ({
      ...coupon,
      expired: new Date(coupon.expiresAt) < now,
      remainingUses: Math.max(Number(coupon.usageLimit || 0) - Number(coupon.usedCount || 0), 0),
    }));
    res.json({ success: true, count: enriched.length, coupons: enriched });
  } catch (error) { next(error); }
};

export const createAdminCoupon = async (req, res, next) => {
  try {
    requireTenantId();
    const payload = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const coupon = await Coupon.create({ ...payload, createdBy: req.user?._id || null });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    next(error);
  }
};

export const updateAdminCoupon = async (req, res, next) => {
  try {
    requireTenantId();
    const payload = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon id" });
    }

    const coupon = await Coupon.findOneAndUpdate(
      mergeTenantFilter(req, { _id: req.params.id }),
      payload,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    next(error);
  }
};

export const deleteAdminCoupon = async (req, res, next) => {
  try {
    requireTenantId();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon id" });
    }
    const coupon = await Coupon.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) { next(error); }
};
