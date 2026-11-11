/**
 * Purpose: website Lead Controller HTTP controller. Main declarations: clean, normalizeEmail, safeUtm, safeFields, createWebsiteLead.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Lead from "../models/Lead.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";

// Declare clean for use by the surrounding module or function.
const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);
// Declare normalizeEmail for use by the surrounding module or function.
const normalizeEmail = (value) => clean(value, 180).toLowerCase();

// Declare safeUtm for use by the surrounding module or function.
const safeUtm = (value) => {
  // Check the condition (!value || typeof value !== "object") and run the matching branch.
  if (!value || typeof value !== "object") return {};
  // Declare result for use by the surrounding module or function.
  const result = {};
  // Repeat the enclosed work for each required iteration.
  for (const key of ["source", "medium", "campaign", "term", "content"]) {
    // Check the condition (value[key] !== undefined) and run the matching branch.
    if (value[key] !== undefined) result[key] = clean(value[key], 160);
  }
  // Return the value of result to the caller.
  return result;
};

// Declare safeFields for use by the surrounding module or function.
const safeFields = (value) => {
  // Check the condition (!value || typeof value !== "object" || Array.isArray(value)) and run the matching branch.
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  // Declare result for use by the surrounding module or function.
  const result = {};
  // Repeat the enclosed work for each required iteration.
  for (const [key, raw] of Object.entries(value).slice(0, 50)) {
    // Declare name for use by the surrounding module or function.
    const name = clean(key, 80);
    // Check the condition (!name || /card|cvv|cvc|secret|token|authorization/i.test(name)) and run the matching branch.
    if (!name || /card|cvv|cvc|secret|token|authorization/i.test(name)) continue;
    // Perform the side effect or state update expressed on the following line.
    result[name] = clean(raw, 500);
  }
  // Return the value of result to the caller.
  return result;
};

// Declare createWebsiteLead for use by the surrounding module or function.
export const createWebsiteLead = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare body for use by the surrounding module or function.
    const body = req.body || {};
    // Declare customer for use by the surrounding module or function.
    const customer = body.customer || body.contact || body;
    // Declare name for use by the surrounding module or function.
    const name = clean(customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`);
    // Declare parts for use by the surrounding module or function.
    const parts = name.split(/\s+/).filter(Boolean);
    // Declare firstName for use by the surrounding module or function.
    const firstName = clean(customer.firstName || parts.shift() || "Website");
    // Declare lastName for use by the surrounding module or function.
    const lastName = clean(customer.lastName || parts.join(" ") || "Lead");
    // Declare phone for use by the surrounding module or function.
    const phone = clean(customer.phone || customer.phoneNumber || customer.mobile, 40);
    // Declare email for use by the surrounding module or function.
    const email = normalizeEmail(customer.email || customer.emailAddress);

    // Check the condition (!phone) and run the matching branch.
    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number is required." });
    // Check the condition (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) and run the matching branch.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });

    // Declare tour for use by the surrounding module or function.
    let tour = null;
    // Declare tourId for use by the surrounding module or function.
    const tourId = body.tourId || body.tour || customer.tourId;
    // Declare tourSlug for use by the surrounding module or function.
    const tourSlug = clean(body.tourSlug || customer.tourSlug, 180).toLowerCase();
    // Check the condition (tourId || tourSlug) and run the matching branch.
    if (tourId || tourSlug) {
      // Declare filter for use by the surrounding module or function.
      const filter = { published: true, available: true, isDeleted: false };
      // Check the condition (tourId) and run the matching branch.
      if (tourId) filter._id = tourId;
      else filter.slug = tourSlug;
      // Perform the side effect or state update expressed on the following line.
      tour = await Tour.findOne(filter).select("_id title slug").lean();
    }

    // Declare marketingConsent for use by the surrounding module or function.
    const marketingConsent = customer.marketingConsent === true || body.marketingConsent === true;
    // Declare lead for use by the surrounding module or function.
    const lead = await Lead.create({
      tenantId: req.tenantId,
      integrationKey: req.integration?.keyId || null,
      firstName,
      lastName,
      name: name || `${firstName} ${lastName}`,
      email,
      phone,
      company: clean(customer.company || customer.companyName, 180),
      nationality: clean(customer.nationality, 120),
      country: clean(customer.country, 120),
      city: clean(customer.city, 120),
      county: clean(customer.county, 120),
      tour: tour?._id || null,
      travelDate: body.travelDate ? new Date(body.travelDate) : null,
      guests: Math.min(Math.max(Number(body.guests || body.numberOfGuests || 1) || 1, 1), 100),
      message: clean(body.message || body.notes || body.specialRequests, 3000),
      source: clean(body.source || req.get("Origin") || "website", 300),
      landingPage: clean(body.landingPage || body.page || body.url, 1000),
      referrer: clean(body.referrer || req.get("Referer"), 1000),
      utm: safeUtm(body.utm),
      customFields: safeFields(body.fields || body.formFields || {}),
      marketingConsent,
      consentAt: marketingConsent ? new Date() : null,
    });

    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, message: "Lead captured successfully.", lead: { id: lead._id, name: lead.name, phone: lead.phone, email: lead.email, tour: tour || null, status: lead.status } });
  } catch (error) { next(error); }
};

// Declare listWebsiteLeads for use by the surrounding module or function.
export const listWebsiteLeads = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId: req.tenantId };
    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) filter.status = clean(req.query.status, 30);
    // Check the condition (req.query.search) and run the matching branch.
    if (req.query.search) {
      // Declare search for use by the surrounding module or function.
      const search = clean(req.query.search, 120);
      // Perform the side effect or state update expressed on the following line.
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { company: { $regex: search, $options: "i" } }];
    }
    // Declare leads for use by the surrounding module or function.
    const leads = await Lead.find(filter).populate("tour", "title slug").sort({ createdAt: -1 }).limit(limit).lean();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, count: leads.length, leads });
  } catch (error) { next(error); }
};

// Declare updateWebsiteLead for use by the surrounding module or function.
export const updateWebsiteLead = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare updates for use by the surrounding module or function.
    const updates = {};
    // Repeat the enclosed work for each required iteration.
    for (const key of ["status", "message", "lastContactedAt", "convertedBooking"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    // Declare lead for use by the surrounding module or function.
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();
    // Check the condition (!lead) and run the matching branch.
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, lead });
  } catch (error) { next(error); }
};
