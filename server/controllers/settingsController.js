import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import SystemSetting from "../models/SystemSetting.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = { ...COMPANY_DEFAULTS };

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", ...DEFAULTS } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({ success: true, data: settings, settings });
  } catch (error) { next(error); }
};

export const updateSettings = async (req, res, next) => {
  try {
    const allowed = [
      "companyName","companyLogo","websiteUrl","supportEmail","supportPhone",
      "address","city","country","currency","currencySymbol","timezone","language",
      "taxRate","bookingDepositPercentage","defaultCommissionRate",
      "maintenanceMode","allowRegistrations","allowAgentRegistrations",
      "requireEmailVerification","requirePhoneVerification",
      "enableMpesa","enableStripe","enablePaypal","enableBankTransfer","bankName","bankAccountName","bankAccountNumber","bankBranch","bankSwiftCode",
      "emailFromName","emailFromAddress","facebook","instagram","twitter","youtube",
      "seoTitle","seoDescription","seoKeywords","bookingNotifications","paymentNotifications",
    ];
    const updates = {};
    for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    if (req.file?.path) updates.companyLogo = req.file.path;

    updates.companyName = String(updates.companyName ?? DEFAULTS.companyName).trim();
    updates.supportEmail = String(updates.supportEmail ?? DEFAULTS.supportEmail).trim().toLowerCase();
    updates.supportPhone = String(updates.supportPhone ?? DEFAULTS.supportPhone).trim();
    updates.currency = String(updates.currency ?? DEFAULTS.currency).trim().toUpperCase();
    updates.timezone = String(updates.timezone ?? DEFAULTS.timezone).trim();

    if (typeof updates.seoKeywords === "string") {
      try { updates.seoKeywords = JSON.parse(updates.seoKeywords); }
      catch { updates.seoKeywords = updates.seoKeywords.split(",").map((v) => v.trim()).filter(Boolean); }
    }
    for (const key of ["taxRate","bookingDepositPercentage","defaultCommissionRate"]) {
      if (updates[key] !== undefined) updates[key] = Number(updates[key]);
    }
    for (const key of ["bookingNotifications","paymentNotifications","maintenanceMode","allowRegistrations","allowAgentRegistrations","requireEmailVerification","requirePhoneVerification","enableMpesa","enableStripe","enablePaypal","enableBankTransfer"]) {
      if (updates[key] !== undefined && typeof updates[key] === "string") updates[key] = updates[key] === "true";
    }
    if (updates.taxRate < 0 || updates.taxRate > 100 || updates.bookingDepositPercentage < 0 || updates.bookingDepositPercentage > 100 || updates.defaultCommissionRate < 0 || updates.defaultCommissionRate > 100) {
      return res.status(400).json({ success: false, message: "Tax, deposit and commission rates must be between 0 and 100." });
    }
    if (!updates.companyName) return res.status(400).json({ success: false, message: "Company name cannot be empty." });
    if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) return res.status(400).json({ success: false, message: "Enter a valid support email." });

    let settings = await SystemSetting.findOne(mergeTenantFilter(req,{ key: "default" });
    if (!settings) settings = new SystemSetting({ key: "default", ...DEFAULTS });
    Object.assign(settings, updates);
    await settings.save();

    return res.status(200).json({ success: true, message: "System settings saved successfully.", data: settings.toObject(), settings: settings.toObject() });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to save system settings." });
  }
};

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", ...DEFAULTS } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      success: true,
      settings: {
        companyName: settings.companyName,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        currency: settings.currency,
        timezone: settings.timezone,
        currencySymbol: settings.currencySymbol || "",
        taxRate: Number(settings.taxRate || 0),
        bookingDepositPercentage: Number(settings.bookingDepositPercentage ?? 30),
        defaultCommissionRate: Number(settings.defaultCommissionRate ?? 10),
        companyLogo: settings.companyLogo || "",
        websiteUrl: settings.websiteUrl || "",
        address: settings.address || "",
        city: settings.city || "",
        country: settings.country || "",
        enableMpesa: settings.enableMpesa !== false,
        enableStripe: settings.enableStripe === true,
        enableBankTransfer: settings.enableBankTransfer !== false,
        bankName: settings.bankName || "",
        bankAccountName: settings.bankAccountName || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankBranch: settings.bankBranch || "",
        bankSwiftCode: settings.bankSwiftCode || "",
      },
    });
  } catch (error) { next(error); }
};
