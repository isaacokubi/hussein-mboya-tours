import Lead from "../models/Lead.js";
import Tour from "../models/Tour.js";
import { requireTenantId } from "../tenancy/context.js";

const clean = (value, max = 500) => String(value ?? "").trim().slice(0, max);
const normalizeEmail = (value) => clean(value, 180).toLowerCase();

const safeUtm = (value) => {
  if (!value || typeof value !== "object") return {};
  const result = {};
  for (const key of ["source", "medium", "campaign", "term", "content"]) {
    if (value[key] !== undefined) result[key] = clean(value[key], 160);
  }
  return result;
};

const safeFields = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [key, raw] of Object.entries(value).slice(0, 50)) {
    const name = clean(key, 80);
    if (!name || /card|cvv|cvc|secret|token|authorization/i.test(name)) continue;
    result[name] = clean(raw, 500);
  }
  return result;
};

export const createWebsiteLead = async (req, res, next) => {
  try {
    requireTenantId();
    const body = req.body || {};
    const customer = body.customer || body.contact || body;
    const name = clean(customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`);
    const parts = name.split(/\s+/).filter(Boolean);
    const firstName = clean(customer.firstName || parts.shift() || "Website");
    const lastName = clean(customer.lastName || parts.join(" ") || "Lead");
    const phone = clean(customer.phone || customer.phoneNumber || customer.mobile, 40);
    const email = normalizeEmail(customer.email || customer.emailAddress);

    if (!phone) return res.status(400).json({ success: false, message: "Customer phone number is required." });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });

    let tour = null;
    const tourId = body.tourId || body.tour || customer.tourId;
    const tourSlug = clean(body.tourSlug || customer.tourSlug, 180).toLowerCase();
    if (tourId || tourSlug) {
      const filter = { published: true, available: true, isDeleted: false };
      if (tourId) filter._id = tourId;
      else filter.slug = tourSlug;
      tour = await Tour.findOne(filter).select("_id title slug").lean();
    }

    const marketingConsent = customer.marketingConsent === true || body.marketingConsent === true;
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

    res.status(201).json({ success: true, message: "Lead captured successfully.", lead: { id: lead._id, name: lead.name, phone: lead.phone, email: lead.email, tour: tour || null, status: lead.status } });
  } catch (error) { next(error); }
};

export const listWebsiteLeads = async (req, res, next) => {
  try {
    requireTenantId();
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const filter = { tenantId: req.tenantId };
    if (req.query.status) filter.status = clean(req.query.status, 30);
    if (req.query.search) {
      const search = clean(req.query.search, 120);
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { company: { $regex: search, $options: "i" } }];
    }
    const leads = await Lead.find(filter).populate("tour", "title slug").sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, count: leads.length, leads });
  } catch (error) { next(error); }
};

export const updateWebsiteLead = async (req, res, next) => {
  try {
    requireTenantId();
    const updates = {};
    for (const key of ["status", "message", "lastContactedAt", "convertedBooking"]) if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.tenantId }, { $set: updates }, { new: true, runValidators: true }).lean();
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found." });
    res.json({ success: true, lead });
  } catch (error) { next(error); }
};
