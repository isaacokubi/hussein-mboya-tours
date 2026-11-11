/**
 * Purpose: wishlist Controller HTTP controller. Main declarations: wishlistFilter, getWishlist, addWishlist, removeWishlist.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Wishlist.js so this module can use its exported dependencies.
import Wishlist from "../models/Wishlist.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

// Declare wishlistFilter for use by the surrounding module or function.
const wishlistFilter = (req, extra = {}) => mergeTenantFilter(req, { user: req.user._id, ...extra });
// Declare publicTourMatch for use by the surrounding module or function.
const publicTourMatch = { isDeleted: false, published: true };

// Declare getWishlist for use by the surrounding module or function.
export const getWishlist = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare wishlist for use by the surrounding module or function.
    let wishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    // Check the condition (!wishlist) and run the matching branch.
    if (!wishlist) {
      // Perform the side effect or state update expressed on the following line.
      wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });
    }
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, count: wishlist.tours.length, wishlist: wishlist.tours });
  } catch (error) { next(error); }
};

// Declare addWishlist for use by the surrounding module or function.
export const addWishlist = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { tourId } for use by the surrounding module or function.
    const { tourId } = req.body;
    // Check the condition (!tourId) and run the matching branch.
    if (!tourId) return res.status(400).json({ success: false, message: "Tour ID is required" });
    // Check the condition (!mongoose.Types.ObjectId.isValid(tourId)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });

    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, ...publicTourMatch }));
    // Check the condition (!tour) and run the matching branch.
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    // Declare wishlist for use by the surrounding module or function.
    let wishlist = await Wishlist.findOne(wishlistFilter(req));
    // Check the condition (!wishlist) and run the matching branch.
    if (!wishlist) wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });

    // Perform the side effect or state update expressed on the following line.
    await Wishlist.updateOne(
      mergeTenantFilter(req, { _id: wishlist._id }),
      { $addToSet: { tours: tourId } }
    );

    // Declare updatedWishlist for use by the surrounding module or function.
    const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour added to wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });
  } catch (error) { next(error); }
};

// Declare removeWishlist for use by the surrounding module or function.
export const removeWishlist = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { tourId } for use by the surrounding module or function.
    const { tourId } = req.params;
    // Check the condition (!mongoose.Types.ObjectId.isValid(tourId)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });

    // Declare wishlist for use by the surrounding module or function.
    const wishlist = await Wishlist.findOne(wishlistFilter(req));
    // Check the condition (!wishlist) and run the matching branch.
    if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

    // Perform the side effect or state update expressed on the following line.
    await Wishlist.updateOne(
      mergeTenantFilter(req, { _id: wishlist._id }),
      { $pull: { tours: tourId } }
    );

    // Declare updatedWishlist for use by the surrounding module or function.
    const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: "Tour removed from wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });
  } catch (error) { next(error); }
};
