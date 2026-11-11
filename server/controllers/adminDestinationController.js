/**
 * Purpose: admin Destination Controller HTTP controller. Main declarations: escapeRegex, createDestination, getDestinations, getDestination, getAdminDestinations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../config/cloudinary.js so this module can use its exported dependencies.
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

// Declare escapeRegex for use by the surrounding module or function.
const escapeRegex = (value = "") => value.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\$&");

// Declare createDestination for use by the surrounding module or function.
export const createDestination = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { name, slug, description, country, city, featured, seo } for use by the surrounding module or function.
    const { name, slug, description, country, city, featured, seo } = req.body;

    // Check the condition (!name?.trim() || !slug?.trim()) and run the matching branch.
    if (!name?.trim() || !slug?.trim()) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Name and slug are required." });
    }

    // Declare normalizedSlug for use by the surrounding module or function.
    const normalizedSlug = slug.trim().toLowerCase();
    // Declare escapedName for use by the surrounding module or function.
    const escapedName = escapeRegex(name.trim());
    // Declare exists for use by the surrounding module or function.
    const exists = await Destination.findOne({
      tenantId,
      isDeleted: { $ne: true },
      $or: [
        { slug: normalizedSlug },
        { name: { $regex: `^${escapedName}$`, $options: "i" } },
      ],
    });

    // Check the condition (exists) and run the matching branch.
    if (exists) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "Destination already exists in this tenant." });
    }

    // Declare parsedSeo for use by the surrounding module or function.
    let parsedSeo = {};
    // Check the condition (seo) and run the matching branch.
    if (seo) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
      } catch {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Invalid SEO data." });
      }
    }

    // Declare images for use by the surrounding module or function.
    const images = req.files?.map((file) => ({ url: file.path, publicId: file.filename })) || [];

    // Declare destination for use by the surrounding module or function.
    const destination = await Destination.create({
      tenantId,
      name: name.trim(),
      slug: normalizedSlug,
      description,
      country,
      city,
      featured: featured === true || featured === "true",
      featuredImage: images[0]?.url || "",
      images,
      seo: parsedSeo,
    });

    // Perform the side effect or state update expressed on the following line.
    res.status(201).json({ success: true, message: "Destination created successfully.", destination });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getDestinations for use by the surrounding module or function.
export const getDestinations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;
    // Declare filter for use by the surrounding module or function.
    const filter = { tenantId, isDeleted: { $ne: true }, status: "active", active: true };

    // Check the condition (req.query.featured === "true") and run the matching branch.
    if (req.query.featured === "true") filter.featured = true;
    // Check the condition (req.query.country) and run the matching branch.
    if (req.query.country) filter.country = req.query.country;

    // Declare [destinations, total] for use by the surrounding module or function.
    const [destinations, total] = await Promise.all([
      Destination.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Destination.countDocuments(filter),
    ]);

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getDestination for use by the surrounding module or function.
export const getDestination = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare destination for use by the surrounding module or function.
    const destination = await Destination.findOne({
      tenantId,
      slug: req.params.slug.toLowerCase(),
      status: "active",
      active: true,
      isDeleted: { $ne: true },
    }).lean();

    // Check the condition (!destination) and run the matching branch.
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });
    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({ success: true, destination });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getAdminDestinations for use by the surrounding module or function.
export const getAdminDestinations = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare destinations for use by the surrounding module or function.
    const destinations = await Destination.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();
    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({ success: true, count: destinations.length, destinations });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updateDestination for use by the surrounding module or function.
export const updateDestination = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();

    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    // Declare destination for use by the surrounding module or function.
    const destination = await Destination.findOne({ _id: req.params.id, tenantId });
    // Check the condition (!destination) and run the matching branch.
    if (!destination) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        code: "DESTINATION_NOT_FOUND",
        message: "Destination not found in the current tenant.",
      });
    }

    // Check the condition (req.body.name !== undefined) and run the matching branch.
    if (req.body.name !== undefined) destination.name = String(req.body.name).trim();

    // Check the condition (req.body.slug !== undefined) and run the matching branch.
    if (req.body.slug !== undefined) {
      // Declare normalizedSlug for use by the surrounding module or function.
      const normalizedSlug = String(req.body.slug).trim().toLowerCase();
      // Check the condition (!normalizedSlug) and run the matching branch.
      if (!normalizedSlug) return res.status(400).json({ success: false, message: "Slug cannot be empty." });

      // Declare duplicate for use by the surrounding module or function.
      const duplicate = await Destination.findOne({
        tenantId,
        slug: normalizedSlug,
        _id: { $ne: destination._id },
        isDeleted: { $ne: true },
      }).lean();

      // Check the condition (duplicate) and run the matching branch.
      if (duplicate) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({
          success: false,
          message: "Another destination already uses this slug in the current tenant.",
        });
      }

      // Perform the side effect or state update expressed on the following line.
      destination.slug = normalizedSlug;
    }

    // Check the condition (req.body.description !== undefined) and run the matching branch.
    if (req.body.description !== undefined) destination.description = req.body.description;
    // Check the condition (req.body.country !== undefined) and run the matching branch.
    if (req.body.country !== undefined) destination.country = req.body.country;
    // Check the condition (req.body.city !== undefined) and run the matching branch.
    if (req.body.city !== undefined) destination.city = req.body.city;
    // Check the condition (req.body.featured !== undefined) and run the matching branch.
    if (req.body.featured !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      destination.featured = req.body.featured === true || req.body.featured === "true";
    }

    // Check the condition (req.body.status !== undefined) and run the matching branch.
    if (req.body.status !== undefined) {
      // Declare status for use by the surrounding module or function.
      const status = String(req.body.status).toLowerCase();
      // Check the condition (!["active", "inactive"].includes(status)) and run the matching branch.
      if (!["active", "inactive"].includes(status)) {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Invalid destination status." });
      }
      // Perform the side effect or state update expressed on the following line.
      destination.status = status;
      // Perform the side effect or state update expressed on the following line.
      destination.active = status === "active";
    }

    // Check the condition (req.body.seo !== undefined) and run the matching branch.
    if (req.body.seo !== undefined) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        destination.seo = typeof req.body.seo === "string" ? JSON.parse(req.body.seo) : req.body.seo;
      } catch {
        // Return the result of res.status(400).json() to the caller.
        return res.status(400).json({ success: false, message: "Invalid SEO data." });
      }
    }

    // Check the condition (req.files?.length) and run the matching branch.
    if (req.files?.length) {
      // Perform the side effect or state update expressed on the following line.
      destination.images = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      // Perform the side effect or state update expressed on the following line.
      destination.featuredImage = destination.images[0]?.url || destination.featuredImage || "";
    }

    // Perform the side effect or state update expressed on the following line.
    await destination.save();
    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({ success: true, message: "Destination updated successfully.", destination });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteDestination for use by the surrounding module or function.
export const deleteDestination = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    // Declare destination for use by the surrounding module or function.
    const destination = await Destination.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!destination) and run the matching branch.
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found." });

    // Declare imagePublicIds for use by the surrounding module or function.
    const imagePublicIds = (destination.images || []).map((image) => image.publicId).filter(Boolean);
    // Check the condition (imagePublicIds.length && !isCloudinaryConfigured) and run the matching branch.
    if (imagePublicIds.length && !isCloudinaryConfigured) {
      // Return the result of res.status(503).json() to the caller.
      return res.status(503).json({ success: false, message: "Destination images cannot be deleted because Cloudinary is not configured." });
    }
    // Perform the side effect or state update expressed on the following line.
    await Promise.all(
      imagePublicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId).catch((error) => {
          // Perform the side effect or state update expressed on the following line.
          console.error("DESTINATION IMAGE DELETE ERROR:", error.message);
        })
      )
    );

    // Perform the side effect or state update expressed on the following line.
    await destination.deleteOne();
    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({ success: true, message: "Destination deleted successfully." });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getDestinationById for use by the surrounding module or function.
export const getDestinationById = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();

    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid destination ID." });
    }

    // Declare destination for use by the surrounding module or function.
    const destination = await Destination.findOne({ _id: req.params.id, tenantId }).lean();
    // Check the condition (!destination) and run the matching branch.
    if (!destination) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        code: "DESTINATION_NOT_FOUND",
        message: "Destination not found in the current tenant.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, data: destination, destination });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
