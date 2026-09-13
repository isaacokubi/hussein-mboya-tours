import mongoose from "mongoose";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
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
  if (!payload.code || payload.code.length < 2 || payload.code.length > 50) {
    return "Coupon code must be between 2 and 50 characters";
  }
  if (payload.discountType !== "percentage" && payload.discountType !== "fixed") {
    return "Discount type must be percentage or fixed";
  }
  if (!Number.isFinite(payload.amount) || payload.amount < 0) return "Discount amount must be a valid non-negative number";
  if (payload.discountType === "percentage" && payload.amount > 100) return "Percentage discount cannot exceed 100%";
  if (!Number.isInteger(payload.usageLimit) || payload.usageLimit < 1) return "Usage limit must be at least 1";
  if (payload.minimumBookingAmount != null && (!Number.isFinite(payload.minimumBookingAmount) || payload.minimumBookingAmount < 0)) {
    return "Minimum booking amount must be valid";
  }
  if (payload.maximumDiscount != null && (!Number.isFinite(payload.maximumDiscount) || payload.maximumDiscount < 0)) {
    return "Maximum discount must be valid";
  }
  if (payload.expiresAt && Number.isNaN(payload.expiresAt.getTime())) return "Expiry date is invalid";
  if (payload.startDate && Number.isNaN(payload.startDate.getTime())) return "Start date is invalid";
  if (payload.startDate && payload.expiresAt && payload.expiresAt <= payload.startDate) return "Expiry date must be after the start date";
  return null;
};

const serializeCoupon = (coupon) => {
  const plain = typeof coupon?.toObject === "function" ? coupon.toObject() : { ...coupon };
  const now = new Date();
  const usedCount = Number(plain.usedCount || 0);
  const usageLimit = Number(plain.usageLimit || 0);
  const startDate = plain.startDate ? new Date(plain.startDate) : null;
  const expiresAt = plain.expiresAt ? new Date(plain.expiresAt) : null;

  let status = "active";
  if (plain.active === false) status = "inactive";
  else if (expiresAt && expiresAt <= now) status = "expired";
  else if (startDate && startDate > now) status = "scheduled";
  else if (usageLimit > 0 && usedCount >= usageLimit) status = "used";

  return {
    ...plain,
    usedCount,
    usageLimit,
    remainingUses: Math.max(usageLimit - usedCount, 0),
    expired: Boolean(expiresAt && expiresAt <= now),
    status,
  };
};

export const getAdminCoupons = async (req, res, next) => {
  try {
    requireTenantId();
    const coupons = await Coupon.find(mergeTenantFilter({})).sort({ createdAt: -1 }).lean();
    const serialized = coupons.map(serializeCoupon);
    res.set("Cache-Control", "no-store");
    res.json({ success: true, count: serialized.length, coupons: serialized });
  } catch (error) {
    next(error);
  }
};

export const createAdminCoupon = async (req, res, next) => {
  try {
    requireTenantId();
    const payload = normalizeCouponPayload(req.body);
    const validationError = validateCouponPayload(payload);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const coupon = await Coupon.create({
      ...payload,
      createdBy: req.user?._id || null,
    });
    res.status(201).json({ success: true, coupon: serializeCoupon(coupon) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    }
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
      mergeTenantFilter({ _id: req.params.id }),
      payload,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon: serializeCoupon(coupon) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "Coupon code already exists for this company" });
    }
    next(error);
  }
};

export const deleteAdminCoupon = async (req, res, next) => {
  try {
    requireTenantId();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid coupon id" });
    }

    const coupon = await Coupon.findOneAndDelete(
      mergeTenantFilter({ _id: req.params.id })
    );
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    next(error);
  }
};
