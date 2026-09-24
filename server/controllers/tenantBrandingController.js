import { publicErrorMessage } from "../utils/publicError.js";
import Organization from "../models/Organization.js";

export async function getBranding(req, res) {
  try {
    if (!req.tenantId) return res.status(404).json({ success: false, message: "Tenant not resolved" });

    const tenant = await Organization.findById(req.tenantId).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    return res.json({
      success: true,
      branding: {
        id: tenant._id,
        name: tenant.name,
        legalName: tenant.legalName,
        slug: tenant.slug,
        logo: tenant.logoUrl || "",
        logoUrl: tenant.logoUrl || "",
        favicon: tenant.favicon || "",
        brandColors: tenant.brandColors || {},
        contactEmail: tenant.supportEmail || "",
        contactPhone: tenant.supportPhone || "",
        website: tenant.websiteUrl || "",
        domain: tenant.domain || "",
      address: tenant.address || "",
      country: tenant.country || "Kenya",
      currency: tenant.currency || "KES",
      timezone: tenant.timezone || "Africa/Nairobi",
      status: tenant.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
}

export async function updateBranding(req, res) {
  try {
    if (!req.tenantId) return res.status(400).json({ success: false, message: "Tenant not resolved" });

    const allowed = [
      "name", "legalName", "logoUrl", "favicon", "brandColors", "websiteUrl", "domain",
      "supportEmail", "supportPhone", "address", "country", "timezone", "currency", "settings",
    ];
    const updates = {};
    for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];

    const updated = await Organization.findOneAndUpdate(
      { _id: req.tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: "Tenant not found" });
    return res.json({ success: true, organization: {
      _id: updated._id,
      name: updated.name,
      legalName: updated.legalName,
      logoUrl: updated.logoUrl || "",
      favicon: updated.favicon || "",
      brandColors: updated.brandColors || {},
      websiteUrl: updated.websiteUrl || "",
      domain: updated.domain || "",
      supportEmail: updated.supportEmail || "",
      supportPhone: updated.supportPhone || "",
      address: updated.address || "",
      country: updated.country || "Kenya",
      currency: updated.currency || "KES",
      timezone: updated.timezone || "Africa/Nairobi",
    } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
}
