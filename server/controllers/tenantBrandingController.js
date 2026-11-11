/**
 * Purpose: tenant Branding Controller HTTP controller. Main declarations: getBranding, updateBranding.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";

// Define getBranding; its parameters and body implement this operation.
export async function getBranding(req, res) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.tenantId) and run the matching branch.
    if (!req.tenantId) return res.status(404).json({ success: false, message: "Tenant not resolved" });

    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(req.tenantId).lean();
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });

    // Return the result of res.json() to the caller.
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
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
}

// Define updateBranding; its parameters and body implement this operation.
export async function updateBranding(req, res) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!req.tenantId) and run the matching branch.
    if (!req.tenantId) return res.status(400).json({ success: false, message: "Tenant not resolved" });

    // Declare allowed for use by the surrounding module or function.
    const allowed = [
      "name", "legalName", "logoUrl", "favicon", "brandColors", "websiteUrl", "domain",
      "supportEmail", "supportPhone", "address", "country", "timezone", "currency", "settings",
    ];
    // Declare updates for use by the surrounding module or function.
    const updates = {};
    // Repeat the enclosed work for each required iteration.
    for (const key of allowed) if (req.body?.[key] !== undefined) updates[key] = req.body[key];

    // Declare updated for use by the surrounding module or function.
    const updated = await Organization.findOneAndUpdate(
      { _id: req.tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    // Check the condition (!updated) and run the matching branch.
    if (!updated) return res.status(404).json({ success: false, message: "Tenant not found" });
    // Return the result of res.json() to the caller.
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
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "That custom domain is already assigned to another company." });
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
}
