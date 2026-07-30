import Wishlist from "../models/Wishlist.js";

/*
|--------------------------------------------------------------------------
| GET USER WISHLIST
|--------------------------------------------------------------------------
*/

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate({
      path: "tours",
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE EMPTY WISHLIST IF NONE EXISTS
    |--------------------------------------------------------------------------
    */

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,

        tours: [],
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RETURN ONLY TOURS ARRAY
    |--------------------------------------------------------------------------
    */

    res.status(200).json(wishlist.tours || []);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD TOUR TO WISHLIST
|--------------------------------------------------------------------------
*/

export const addWishlist = async (req, res, next) => {
  try {
    const { tourId } = req.body;

    if (!tourId) {
      return res.status(400).json({
        message: "Tour ID is required",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,

        tours: [],
      });
    }

    const alreadyExists = wishlist.tours.some((id) => id.toString() === tourId);

    if (!alreadyExists) {
      wishlist.tours.push(tourId);
    }

    await wishlist.save();

    await wishlist.populate("tours");

    res.status(200).json(wishlist.tours);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE TOUR FROM WISHLIST
|--------------------------------------------------------------------------
*/

export const removeWishlist = async (
  req,

  res,

  next,
) => {
  try {
    const { tourId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found",
      });
    }

    wishlist.tours = wishlist.tours.filter((id) => id.toString() !== tourId);

    await wishlist.save();

    await wishlist.populate("tours");

    res.status(200).json(wishlist.tours);
  } catch (error) {
    next(error);
  }
};
