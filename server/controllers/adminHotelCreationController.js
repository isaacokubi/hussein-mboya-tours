import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";

const clean = (value) => String(value ?? "").trim();
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId || null;

const slugify = (value) =>
  clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 170);

const normalizeEmail = (value) => clean(value).toLowerCase();

const normalizeNumber = (value, fallback = null) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

export const createAdminHotel = async (req, res, next) => {
  try {
    const tenantId = tenantIdOf(req);
    if (!tenantId || !mongoose.isValidObjectId(tenantId)) {
      return res.status(400).json({
        success: false,
        message: "A valid company/tenant context is required before creating a hotel.",
      });
    }

    const body = req.body || {};
    const name = clean(body.name);
    const city = clean(body.city);
    const location = clean(body.location);

    if (!name) return res.status(400).json({ success: false, message: "Hotel name is required." });
    if (!city) return res.status(400).json({ success: false, message: "City is required." });
    if (!location) return res.status(400).json({ success: false, message: "Location is required." });

    const starRating = normalizeNumber(body.starRating, 3);
    if (!Number.isInteger(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ success: false, message: "Star rating must be a whole number from 1 to 5." });
    }

    const latitude = normalizeNumber(body.latitude);
    const longitude = normalizeNumber(body.longitude);
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ success: false, message: "Latitude must be between -90 and 90." });
    }
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Longitude must be between -180 and 180." });
    }

    const contactEmail = normalizeEmail(body.contactEmail);
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ success: false, message: "Enter a valid reservations email address." });
    }

    const requestedSlug = slugify(body.slug || name) || `hotel-${Date.now()}`;
    let slug = requestedSlug;
    let suffix = 2;
    while (await Hotel.exists({ tenantId, slug })) slug = `${requestedSlug}-${suffix++}`;

    const hotel = await Hotel.create({
      tenantId,
      name,
      slug,
      description: clean(body.description),
      location,
      address: clean(body.address),
      city,
      county: clean(body.county),
      country: clean(body.country) || "Kenya",
      latitude,
      longitude,
      starRating,
      amenities: Array.isArray(body.amenities)
        ? body.amenities.map(clean).filter(Boolean).slice(0, 50)
        : [],
      images: Array.isArray(body.images)
        ? body.images.map(clean).filter(Boolean).slice(0, 30)
        : [],
      contactPhone: clean(body.contactPhone),
      contactEmail,
      checkInTime: clean(body.checkInTime) || "14:00",
      checkOutTime: clean(body.checkOutTime) || "11:00",
      cancellationPolicy: clean(body.cancellationPolicy),
      status: ["draft", "active", "inactive"].includes(body.status) ? body.status : "draft",
      featured: Boolean(body.featured),
      currency: clean(body.currency).toUpperCase() || "KES",
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: `${hotel.name} was created successfully.`,
      data: hotel,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A hotel with that identifier already exists for this company. Please use a different name.",
      });
    }
    return next(error);
  }
};
