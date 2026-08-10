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
      if (req.body?.[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.companyName !== undefined &&
        !String(updates.companyName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot be empty.",
      });
    }

    const settings = await SystemSetting.findOneAndUpdate(
      { key: "default" },
      {
        $set: updates,
        $setOnInsert: {
          key: "default",
          ...DEFAULTS,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "System settings saved successfully.",
      data: settings,
      settings,
    });
  } catch (error) {
    next(error);
  }
};
