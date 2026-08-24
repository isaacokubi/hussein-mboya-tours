import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
// server/controllers/adminDestinationController.js

import mongoose from "mongoose";
import Destination from "../models/Destination.js";
import cloudinary from "../config/cloudinary.js";

export const createDestination = async (req, res, next) => {
  requireTenantId();
  try {
    const { name, slug, description, country, city, featured, seo } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required." });
    }

    const normalizedSlug = slug.trim().toLowerCase();
    const exists = await Destination.findOne({
      $or: [
        { slug: normalizedSlug },
        { name: { $regex: `^${name.trim()}$`, $options: "i" } },
      ],
    });

    if (exists) {
      return res.status(409).json({ success: false, message: "Destination already exists." });
    }

    const images = req.files?.map((file) => ({ url: file.path, publicId: file.filename })) || [];

    const destination = await Destination.create({
      name: name.trim(),
      slug: normalizedSlug,
      description,
      country,
      city,
      featured: featured === true || featured === "true",
      featuredImage: images[0]?.url || "",
      images,
      seo: seo ? JSON.parse(seo) : {},
    });

    res.status(201).json({ success: true, message: "Destination created successfully.", destination });
  } catch (error) {
    next(error);
  }
};

export const getDestinations = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.featured === "true") filter.featured = true;
    if (req.query.country) filter.country = req.query.country;

    const [destinations, total] = await Promise.all([
      Destination.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Destination.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      count: destinations.length,
      destinations,
    });
  } catch (error) {
    next(error);
  }
};

export const getDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug.toLowerCase() }).lean();
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });
    res.status(200).json({ success: true, destination });
  } catch (error) {
    next(error);
  }
};

export const getAdminDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: destinations.length, destinations });
  } catch (error) {
    next(error);
  }
};

export const updateDestination = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    const destination = await Destination.findOne({ _id: req.params.id, tenantId });
    if (!destination) {
      return res.status(404).json({
        success: false,
        code: "DESTINATION_NOT_FOUND",
        message: "Destination not found in the current tenant.",
      });
    }

    if (req.body.name !== undefined) destination.name = String(req.body.name).trim();
    if (req.body.slug !== undefined) destination.slug = String(req.body.slug).trim().toLowerCase();
    if (req.body.description !== undefined) destination.description = req.body.description;
    if (req.body.country !== undefined) destination.country = req.body.country;
    if (req.body.city !== undefined) destination.city = req.body.city;
    if (req.body.featured !== undefined) {
      destination.featured = req.body.featured === true || req.body.featured === "true";
    }
    if (req.body.seo !== undefined) {
      try {
        destination.seo = typeof req.body.seo === "string" ? JSON.parse(req.body.seo) : req.body.seo;
      } catch {
        return res.status(400).json({ success: false, message: "Invalid SEO data." });
      }
    }

    if (req.files?.length) {
      destination.images = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      destination.featuredImage = destination.images[0]?.url || destination.featuredImage || "";
    }

    await destination.save();
    res.status(200).json({ success: true, message: "Destination updated successfully.", destination });
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    const destination = await Destination.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });

    const imagePublicIds = (destination.images || []).map((image) => image.publicId).filter(Boolean);
    await Promise.all(
      imagePublicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId).catch((error) => {
          console.error("DESTINATION IMAGE DELETE ERROR:", error.message);
        })
      )
    );

    await destination.deleteOne();
    res.status(200).json({ success: true, message: "Destination deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const getDestinationById = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    const destination = await Destination.findOne({ _id: req.params.id, tenantId }).lean();
    if (!destination) {
      return res.status(404).json({
        success: false,
        code: "DESTINATION_NOT_FOUND",
        message: "Destination not found in the current tenant.",
      });
    }

    res.json({ success: true, data: destination, destination });
  } catch (error) {
    next(error);
  }
};
