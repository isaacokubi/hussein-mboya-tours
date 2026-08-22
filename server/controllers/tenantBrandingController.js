import Organization from "../models/Organization.js";

export async function getBranding(req, res) {
  try {
    if (!req.tenantId) {
      return res.status(404).json({ success: false, message: "Tenant not resolved" });
    }

    const tenant = await Organization.findById(req.tenantId).lean();

    if (!tenant) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    return res.json({
      success: true,
      branding: {
        id: tenant._id,
        name: tenant.name,
        legalName: tenant.legalName,
        logo: tenant.logoUrl || tenant.logo || "",
        logoUrl: tenant.logoUrl || tenant.logo || "",
        favicon: tenant.favicon || "",
        brandColors: tenant.brandColors || {},
        contactEmail: tenant.supportEmail || tenant.contactEmail || "",
        contactPhone: tenant.supportPhone || tenant.contactPhone || "",
        website: tenant.websiteUrl || tenant.website || "",
        address: tenant.address || "",
        country: tenant.country || "Kenya",
        currency: tenant.currency || "KES",
        timezone: tenant.timezone || "Africa/Nairobi",
        settings: tenant.settings || {},
        status: tenant.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateBranding(req, res) {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ success: false, message: "Tenant not resolved" });
    }

    const allowed = [
      "name",
      "legalName",
      "logoUrl",
      "websiteUrl",
      "domain",
      "supportEmail",
      "supportPhone",
      "country",
      "timezone",
      "currency",
      "settings",
    ];
    const updates = {};

    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await Organization.findByIdAndUpdate(
      req.tenantId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Tenant not found" });
    }

    return res.json({ success: true, organization: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
