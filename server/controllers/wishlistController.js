import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Tour from "../models/Tour.js";

const wishlistFilter = (req, extra = {}) => mergeTenantFilter(req, { user: req.user._id, ...extra });
const publicTourMatch = { isDeleted: false, published: true };

export const getWishlist = async (req, res, next) => {
  requireTenantId();
  try {
    let wishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    if (!wishlist) {
      wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });
    }
    return res.status(200).json({ success: true, count: wishlist.tours.length, wishlist: wishlist.tours });
  } catch (error) { next(error); }
};

export const addWishlist = async (req, res, next) => {
  requireTenantId();
  try {
    const { tourId } = req.body;
    if (!tourId) return res.status(400).json({ success: false, message: "Tour ID is required" });
    if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });

    const tour = await Tour.findOne(mergeTenantFilter(req, { _id: tourId, ...publicTourMatch }));
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    let wishlist = await Wishlist.findOne(wishlistFilter(req));
    if (!wishlist) wishlist = await Wishlist.create({ tenantId: req.tenantId, user: req.user._id, tours: [] });

    await Wishlist.updateOne(
      mergeTenantFilter(req, { _id: wishlist._id }),
      { $addToSet: { tours: tourId } }
    );

    const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    return res.status(200).json({ success: true, message: "Tour added to wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });
  } catch (error) { next(error); }
};

export const removeWishlist = async (req, res, next) => {
  requireTenantId();
  try {
    const { tourId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tourId)) return res.status(400).json({ success: false, message: "Invalid tour ID" });

    const wishlist = await Wishlist.findOne(wishlistFilter(req));
    if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

    await Wishlist.updateOne(
      mergeTenantFilter(req, { _id: wishlist._id }),
      { $pull: { tours: tourId } }
    );

    const updatedWishlist = await Wishlist.findOne(wishlistFilter(req)).populate({ path: "tours", match: publicTourMatch });
    return res.status(200).json({ success: true, message: "Tour removed from wishlist", count: updatedWishlist.tours.length, wishlist: updatedWishlist.tours });
  } catch (error) { next(error); }
};
