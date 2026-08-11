import SystemSetting from "../models/SystemSetting.js";

const DEFAULTS = {
  companyName: "Coherent Tours",
  supportEmail: "",
  supportPhone: "+254 733 439 362",
  currency: "KES",
  timezone: "Africa/Nairobi",
  bookingNotifications: true,
  paymentNotifications: true,
};

export const getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: "default" },
      { $setOnInsert: { key: "default", ...DEFAULTS } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      success: true,
      data: settings,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const allowed = [
      "companyName",
      "supportEmail",
      "supportPhone",
      "currency",
      "timezone",
      "bookingNotifications",
      "paymentNotifications",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    }

    updates.companyName = String(updates.companyName ?? DEFAULTS.companyName).trim();
    updates.supportEmail = String(updates.supportEmail ?? DEFAULTS.supportEmail).trim().toLowerCase();
    updates.supportPhone = String(updates.supportPhone ?? DEFAULTS.supportPhone).trim();
    updates.currency = String(updates.currency ?? DEFAULTS.currency).trim().toUpperCase();
    updates.timezone = String(updates.timezone ?? DEFAULTS.timezone).trim();

    if (!updates.companyName) {
      return res.status(400).json({ success: false, message: "Company name cannot be empty." });
    }

    if (updates.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.supportEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid support email." });
    }

    let settings = await SystemSetting.findOne({ key: "default" });
    if (!settings) {
      settings = new SystemSetting({ key: "default", ...DEFAULTS });
    }

    Object.assign(settings, updates);
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "System settings saved successfully.",
      data: settings.toObject(),
      settings: settings.toObject(),
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save system settings.",
    });
  }
};
