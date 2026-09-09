import crypto from "crypto";
import OperationalAsset from "../models/OperationalAsset.js";
import TravelCommercialRule from "../models/TravelCommercialRule.js";
import LoyaltyAccount from "../models/LoyaltyAccount.js";

const tokenHash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export const issueVoucher = async (req, res, next) => {
  try {
    const raw = crypto.randomBytes(24).toString("hex");
    const voucher = await OperationalAsset.create({ tenantId: req.user.tenantId, type: "voucher", name: req.body.name || "Tour voucher", bookingId: req.body.bookingId, tourId: req.body.tourId, status: "active", code: `VCH-${raw.slice(0, 10).toUpperCase()}`, metadata: { tokenHash: tokenHash(raw), redemptionLimit: 1, redeemedCount: 0, expiresAt: req.body.expiresAt || null, issuedFor: req.body.issuedFor || null }, createdBy: req.user._id });
    res.status(201).json({ success: true, data: { ...voucher.toObject(), token: raw } });
  } catch (e) { next(e); }
};

export const redeemVoucher = async (req, res, next) => {
  try {
    const hash = tokenHash(req.body.token);
    const voucher = await OperationalAsset.findOne({ tenantId: req.user.tenantId, type: "voucher", "metadata.tokenHash": hash, status: "active" });
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher is invalid, expired, or already redeemed." });
    if (voucher.metadata?.expiresAt && new Date(voucher.metadata.expiresAt) < new Date()) return res.status(410).json({ success: false, message: "Voucher has expired." });
    if (Number(voucher.metadata?.redeemedCount || 0) >= Number(voucher.metadata?.redemptionLimit || 1)) return res.status(409).json({ success: false, message: "Voucher redemption limit reached." });
    voucher.metadata.redeemedCount = Number(voucher.metadata.redeemedCount || 0) + 1;
    voucher.metadata.redeemedAt = new Date().toISOString();
    voucher.metadata.redeemedBy = String(req.user._id);
    voucher.status = "completed";
    await voucher.save();
    res.json({ success: true, data: voucher });
  } catch (e) { next(e); }
};

export const calculateDynamicPrice = async (req, res, next) => {
  try {
    let price = Number(req.body.basePrice);
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ success: false, message: "basePrice must be a non-negative number." });
    const rules = await TravelCommercialRule.find({ tenantId: req.user.tenantId, type: "dynamic_price", active: true }).sort({ priority: -1 }).lean();
    for (const rule of rules) {
      const c = rule.conditions || {};
      if (c.minGuests && Number(req.body.guests || 1) < Number(c.minGuests)) continue;
      if (c.maxGuests && Number(req.body.guests || 1) > Number(c.maxGuests)) continue;
      if (c.from && req.body.date && new Date(req.body.date) < new Date(c.from)) continue;
      if (c.to && req.body.date && new Date(req.body.date) > new Date(c.to)) continue;
      const a = rule.action || {};
      if (a.percent !== undefined) price *= 1 + Number(a.percent) / 100;
      if (a.fixed !== undefined) price += Number(a.fixed);
      price = Math.max(0, price);
    }
    res.json({ success: true, data: { basePrice: Number(req.body.basePrice), finalPrice: Math.round(price * 100) / 100, currency: req.body.currency || "KES", rulesApplied: rules.length } });
  } catch (e) { next(e); }
};

export const loyaltyBalance = async (req, res, next) => {
  try {
    const customerId = req.params.customerId || req.user._id;
    const account = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId }).lean();
    res.json({ success: true, data: account || { points: 0, lifetimeEarned: 0, lifetimeRedeemed: 0 } });
  } catch (e) { next(e); }
};

export const earnLoyalty = async (req, res, next) => {
  try {
    const points = Number(req.body.points);
    if (!Number.isInteger(points) || points <= 0 || points > 1000000) return res.status(400).json({ success: false, message: "points must be a positive integer." });
    const customerId = req.body.customerId || req.user._id;
    const existing = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId });
    const referralCode = existing?.referralCode || `REF-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId }, { $setOnInsert: { referralCode }, $inc: { points, lifetimeEarned: points } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: account });
  } catch (e) { next(e); }
};

export const redeemLoyalty = async (req, res, next) => {
  try {
    const points = Number(req.body.points);
    if (!Number.isInteger(points) || points <= 0) return res.status(400).json({ success: false, message: "points must be a positive integer." });
    const customerId = req.body.customerId || req.user._id;
    const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId, points: { $gte: points } }, { $inc: { points: -points, lifetimeRedeemed: points } }, { new: true });
    if (!account) return res.status(409).json({ success: false, message: "Insufficient loyalty points." });
    res.json({ success: true, data: account });
  } catch (e) { next(e); }
};
