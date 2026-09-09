import crypto from "crypto";
import OperationalAsset from "../models/OperationalAsset.js";
import TravelCommercialRule from "../models/TravelCommercialRule.js";
import LoyaltyAccount from "../models/LoyaltyAccount.js";
import Tour from "../models/Tour.js";

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
    const requestedTourId = req.body.tourId || req.body.tour || null;
    const requestedDate = req.body.travelDate || req.body.date || null;
    const guests = Number(req.body.guests ?? req.body.numberOfGuests ?? 1);
    let basePrice = Number(req.body.basePrice);

    if (requestedTourId) {
      const tour = await Tour.findOne({ _id: requestedTourId, status: { $in: ["scheduled", "upcoming", "ongoing"] }, published: true, available: true, isDeleted: false }).select("price discount discountPrice").lean();
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not available." });
      if (!Number.isFinite(basePrice)) {
        const listedPrice = Number(tour.discountPrice ?? tour.price);
        const discount = Number(tour.discount || 0);
        basePrice = Number.isFinite(listedPrice) ? listedPrice : Number(tour.price) * (1 - discount / 100);
      }
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) return res.status(400).json({ success: false, message: "basePrice must be a non-negative number." });
    if (!Number.isInteger(guests) || guests <= 0 || guests > 100) return res.status(400).json({ success: false, message: "guests must be a positive integer between 1 and 100." });
    if (requestedDate && Number.isNaN(new Date(requestedDate).getTime())) return res.status(400).json({ success: false, message: "travelDate must be a valid date." });

    const rules = await TravelCommercialRule.find({ tenantId: req.user.tenantId, type: "dynamic_price", active: true }).sort({ priority: -1 }).lean();
    let price = basePrice;
    let appliedRules = 0;
    for (const rule of rules) {
      const c = rule.conditions || {};
      if (c.minGuests && guests < Number(c.minGuests)) continue;
      if (c.maxGuests && guests > Number(c.maxGuests)) continue;
      if (c.from && requestedDate && new Date(requestedDate) < new Date(c.from)) continue;
      if (c.to && requestedDate && new Date(requestedDate) > new Date(c.to)) continue;
      const a = rule.actions || rule.action || {};
      if (a.percent !== undefined) price *= 1 + Number(a.percent) / 100;
      if (a.fixed !== undefined) price += Number(a.fixed);
      price = Math.max(0, price);
      appliedRules += 1;
    }
    res.json({ success: true, data: { basePrice, finalPrice: Math.round(price * 100) / 100, currency: req.body.currency || "KES", guests, travelDate: requestedDate || null, rulesApplied: appliedRules } });
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
