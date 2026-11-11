/**
 * Purpose: travel Lifecycle Controller HTTP controller. Main declarations: tokenHash, issueVoucher, redeemVoucher, calculateDynamicPrice, loyaltyBalance.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../models/OperationalAsset.js so this module can use its exported dependencies.
import OperationalAsset from "../models/OperationalAsset.js";
// Load ../models/TravelCommercialRule.js so this module can use its exported dependencies.
import TravelCommercialRule from "../models/TravelCommercialRule.js";
// Load ../models/LoyaltyAccount.js so this module can use its exported dependencies.
import LoyaltyAccount from "../models/LoyaltyAccount.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare tokenHash for use by the surrounding module or function.
const tokenHash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

// Declare issueVoucher for use by the surrounding module or function.
export const issueVoucher = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare raw for use by the surrounding module or function.
    const raw = crypto.randomBytes(24).toString("hex");
    // Declare voucher for use by the surrounding module or function.
    const voucher = await OperationalAsset.create({ tenantId: req.user.tenantId, type: "voucher", name: req.body.name || "Tour voucher", bookingId: req.body.bookingId, tourId: req.body.tourId, status: "active", code: `VCH-${raw.slice(0, 10).toUpperCase()}`, metadata: { tokenHash: tokenHash(raw), redemptionLimit: 1, redeemedCount: 0, expiresAt: req.body.expiresAt || null, issuedFor: req.body.issuedFor || null }, createdBy: req.user._id });
    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, data: { ...voucher.toObject(), token: raw } });
  } catch (e) { next(e); }
};

// Declare redeemVoucher for use by the surrounding module or function.
export const redeemVoucher = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare hash for use by the surrounding module or function.
    const hash = tokenHash(req.body.token);
    // Declare voucher for use by the surrounding module or function.
    const voucher = await OperationalAsset.findOne({ tenantId: req.user.tenantId, type: "voucher", "metadata.tokenHash": hash, status: "active" });
    // Check the condition (!voucher) and run the matching branch.
    if (!voucher) return res.status(404).json({ success: false, message: "Voucher is invalid, expired, or already redeemed." });
    // Check the condition (voucher.metadata?.expiresAt && new Date(voucher.metadata.expiresAt) < ) and run the matching branch.
    if (voucher.metadata?.expiresAt && new Date(voucher.metadata.expiresAt) < new Date()) return res.status(410).json({ success: false, message: "Voucher has expired." });
    // Check the condition (Number(voucher.metadata?.redeemedCount || 0) >= Number(voucher.metadat) and run the matching branch.
    if (Number(voucher.metadata?.redeemedCount || 0) >= Number(voucher.metadata?.redemptionLimit || 1)) return res.status(409).json({ success: false, message: "Voucher redemption limit reached." });
    // Perform the side effect or state update expressed on the following line.
    voucher.metadata.redeemedCount = Number(voucher.metadata.redeemedCount || 0) + 1;
    // Perform the side effect or state update expressed on the following line.
    voucher.metadata.redeemedAt = new Date().toISOString();
    // Perform the side effect or state update expressed on the following line.
    voucher.metadata.redeemedBy = String(req.user._id);
    // Perform the side effect or state update expressed on the following line.
    voucher.status = "completed";
    // Perform the side effect or state update expressed on the following line.
    await voucher.save();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: voucher });
  } catch (e) { next(e); }
};

// Declare calculateDynamicPrice for use by the surrounding module or function.
export const calculateDynamicPrice = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare requestedTourId for use by the surrounding module or function.
    const requestedTourId = req.body.tourId || req.body.tour || null;
    // Declare requestedDate for use by the surrounding module or function.
    const requestedDate = req.body.travelDate || req.body.date || null;
    // Declare guests for use by the surrounding module or function.
    const guests = Number(req.body.guests ?? req.body.numberOfGuests ?? 1);
    // Declare basePrice for use by the surrounding module or function.
    let basePrice = Number(req.body.basePrice);

    // Check the condition (requestedTourId) and run the matching branch.
    if (requestedTourId) {
      // Declare tour for use by the surrounding module or function.
      const tour = await Tour.findOne({ _id: requestedTourId, status: { $in: ["scheduled", "upcoming", "ongoing"] }, published: true, available: true, isDeleted: false }).select("price discount discountPrice").lean();
      // Check the condition (!tour) and run the matching branch.
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found or not available." });
      // Check the condition (!Number.isFinite(basePrice)) and run the matching branch.
      if (!Number.isFinite(basePrice)) {
        // Declare listedPrice for use by the surrounding module or function.
        const listedPrice = Number(tour.discountPrice ?? tour.price);
        // Declare discount for use by the surrounding module or function.
        const discount = Number(tour.discount || 0);
        // Perform the side effect or state update expressed on the following line.
        basePrice = Number.isFinite(listedPrice) ? listedPrice : Number(tour.price) * (1 - discount / 100);
      }
    }

    // Check the condition (!Number.isFinite(basePrice) || basePrice < 0) and run the matching branch.
    if (!Number.isFinite(basePrice) || basePrice < 0) return res.status(400).json({ success: false, message: "basePrice must be a non-negative number." });
    // Check the condition (!Number.isInteger(guests) || guests <= 0 || guests > 100) and run the matching branch.
    if (!Number.isInteger(guests) || guests <= 0 || guests > 100) return res.status(400).json({ success: false, message: "guests must be a positive integer between 1 and 100." });
    // Check the condition (requestedDate && Number.isNaN(new Date(requestedDate).getTime())) and run the matching branch.
    if (requestedDate && Number.isNaN(new Date(requestedDate).getTime())) return res.status(400).json({ success: false, message: "travelDate must be a valid date." });

    // Declare rules for use by the surrounding module or function.
    const rules = await TravelCommercialRule.find({ tenantId: req.user.tenantId, type: "dynamic_price", active: true }).sort({ priority: -1 }).lean();
    // Declare price for use by the surrounding module or function.
    let price = basePrice;
    // Declare appliedRules for use by the surrounding module or function.
    let appliedRules = 0;
    // Repeat the enclosed work for each required iteration.
    for (const rule of rules) {
      // Declare c for use by the surrounding module or function.
      const c = rule.conditions || {};
      // Check the condition (c.minGuests && guests < Number(c.minGuests)) and run the matching branch.
      if (c.minGuests && guests < Number(c.minGuests)) continue;
      // Check the condition (c.maxGuests && guests > Number(c.maxGuests)) and run the matching branch.
      if (c.maxGuests && guests > Number(c.maxGuests)) continue;
      // Check the condition (c.from && requestedDate && new Date(requestedDate) < new Date(c.from)) and run the matching branch.
      if (c.from && requestedDate && new Date(requestedDate) < new Date(c.from)) continue;
      // Check the condition (c.to && requestedDate && new Date(requestedDate) > new Date(c.to)) and run the matching branch.
      if (c.to && requestedDate && new Date(requestedDate) > new Date(c.to)) continue;
      // Declare a for use by the surrounding module or function.
      const a = rule.actions || rule.action || {};
      // Check the condition (a.percent !== undefined) and run the matching branch.
      if (a.percent !== undefined) price *= 1 + Number(a.percent) / 100;
      // Check the condition (a.fixed !== undefined) and run the matching branch.
      if (a.fixed !== undefined) price += Number(a.fixed);
      // Perform the side effect or state update expressed on the following line.
      price = Math.max(0, price);
      // Perform the side effect or state update expressed on the following line.
      appliedRules += 1;
    }
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: { basePrice, finalPrice: Math.round(price * 100) / 100, currency: req.body.currency || "KES", guests, travelDate: requestedDate || null, rulesApplied: appliedRules } });
  } catch (e) { next(e); }
};

// Declare loyaltyBalance for use by the surrounding module or function.
export const loyaltyBalance = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare customerId for use by the surrounding module or function.
    const customerId = req.params.customerId || req.user._id;
    // Declare account for use by the surrounding module or function.
    const account = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId }).lean();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: account || { points: 0, lifetimeEarned: 0, lifetimeRedeemed: 0 } });
  } catch (e) { next(e); }
};

// Declare earnLoyalty for use by the surrounding module or function.
export const earnLoyalty = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare points for use by the surrounding module or function.
    const points = Number(req.body.points);
    // Check the condition (!Number.isInteger(points) || points <= 0 || points > 1000000) and run the matching branch.
    if (!Number.isInteger(points) || points <= 0 || points > 1000000) return res.status(400).json({ success: false, message: "points must be a positive integer." });
    // Declare customerId for use by the surrounding module or function.
    const customerId = req.body.customerId || req.user._id;
    // Declare existing for use by the surrounding module or function.
    const existing = await LoyaltyAccount.findOne({ tenantId: req.user.tenantId, customerId });
    // Declare referralCode for use by the surrounding module or function.
    const referralCode = existing?.referralCode || `REF-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    // Declare account for use by the surrounding module or function.
    const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId }, { $setOnInsert: { referralCode }, $inc: { points, lifetimeEarned: points } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: account });
  } catch (e) { next(e); }
};

// Declare redeemLoyalty for use by the surrounding module or function.
export const redeemLoyalty = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare points for use by the surrounding module or function.
    const points = Number(req.body.points);
    // Check the condition (!Number.isInteger(points) || points <= 0) and run the matching branch.
    if (!Number.isInteger(points) || points <= 0) return res.status(400).json({ success: false, message: "points must be a positive integer." });
    // Declare customerId for use by the surrounding module or function.
    const customerId = req.body.customerId || req.user._id;
    // Declare account for use by the surrounding module or function.
    const account = await LoyaltyAccount.findOneAndUpdate({ tenantId: req.user.tenantId, customerId, points: { $gte: points } }, { $inc: { points: -points, lifetimeRedeemed: points } }, { new: true });
    // Check the condition (!account) and run the matching branch.
    if (!account) return res.status(409).json({ success: false, message: "Insufficient loyalty points." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: account });
  } catch (e) { next(e); }
};
