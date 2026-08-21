import {mergeTenantFilter} from "../tenancy/secureQuery.js";
// server/controllers/wishlistController.js

import mongoose from "mongoose";

import Wishlist from "../models/Wishlist.js";
import Tour from "../models/Tour.js";


/*
|--------------------------------------------------------------------------
| GET USER WISHLIST
|--------------------------------------------------------------------------
*/

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    }).populate({
      path: "tours",
      match: {
        isDeleted: false,
        published: true,
      },
    });


    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        tours: [],
      });
    }


    return res.status(200).json({
      success: true,
      count: wishlist.tours.length,
      wishlist: wishlist.tours,
    });


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
        success: false,
        message: "Tour ID is required",
      });
    }



    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }




    /*
    |--------------------------------------------------------------------------
    | CHECK TOUR EXISTS
    |--------------------------------------------------------------------------
    |
    | Tours use published/isDeleted fields for visibility.
    | They do not use status:"active".
    |
    |--------------------------------------------------------------------------
    */

    const tour = await Tour.findOne(mergeTenantFilter(req,{
      _id: tourId,
      isDeleted: false,
      published: true,
    });



    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }




    let wishlist = await Wishlist.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });



    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        tours: [],
      });
    }





    await Wishlist.updateOne(
      {
        _id: wishlist._id,
      },
      {
        $addToSet: {
          tours: tourId,
        },
      }
    );





    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate({
      path: "tours",
      match: {
        isDeleted: false,
        published: true,
      },
    });





    return res.status(200).json({
      success: true,
      message: "Tour added to wishlist",
      count: updatedWishlist.tours.length,
      wishlist: updatedWishlist.tours,
    });



  } catch (error) {
    next(error);
  }
};






/*
|--------------------------------------------------------------------------
| REMOVE TOUR FROM WISHLIST
|--------------------------------------------------------------------------
*/

export const removeWishlist = async (req, res, next) => {
  try {
    const { tourId } = req.params;



    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }



    const wishlist = await Wishlist.findOne(mergeTenantFilter(req,{
      user: req.user._id,
    });



    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }




    await Wishlist.updateOne(
      {
        _id: wishlist._id,
      },
      {
        $pull: {
          tours: tourId,
        },
      }
    );





    const updatedWishlist = await Wishlist.findById(
      wishlist._id
    ).populate({
      path: "tours",
      match: {
        isDeleted: false,
        published: true,
      },
    });





    return res.status(200).json({
      success: true,
      message: "Tour removed from wishlist",
      count: updatedWishlist.tours.length,
      wishlist: updatedWishlist.tours,
    });



  } catch (error) {
    next(error);
  }
};