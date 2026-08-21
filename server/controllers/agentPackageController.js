import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import mongoose from "mongoose";
import TourPackage from "../models/TourPackage.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| GET AGENT TOUR PACKAGES
|--------------------------------------------------------------------------
|
| Agents can only view active tour packages.
| Supports:
| - Search
| - Category filter
| - Destination filter
| - Featured filter
| - Pagination
|--------------------------------------------------------------------------
*/

export const getAgentPackages = async (req, res, next) => {
  try {
    const {
      search,
      category,
      destination,
      featured,
      page = 1,
      limit = 12,
      sort = "latest",
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (currentPage - 1) * pageSize;

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const filter = {
      status: "active",
    };

    if (category) {
      filter.category = category;
    }

    if (destination) {
      filter.destination = {
        $regex: destination,
        $options: "i",
      };
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          destination: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | SORTING
    |--------------------------------------------------------------------------
    */

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "price-low":
        sortOption = {
          agentPrice: 1,
        };
        break;

      case "price-high":
        sortOption = {
          agentPrice: -1,
        };
        break;

      case "popular":
        sortOption = {
          views: -1,
        };
        break;

      case "latest":
      default:
        sortOption = {
          createdAt: -1,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH DATA
    |--------------------------------------------------------------------------
    */

    const [packages, total] = await Promise.all([
      TourPackage.find(filter)
        .select(
          `
          title
          slug
          destination
          category
          duration
          coverImage
          gallery
          agentPrice
          basePrice
          currency
          availableSeats
          maxGuests
          featured
          views
          createdAt
        `,
        )
        .sort(sortOption)
        .skip(skip)
        .limit(pageSize)
        .lean(),

      TourPackage.countDocuments(filter),
    ]);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,

      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
        hasNext: currentPage < Math.ceil(total / pageSize),
        hasPrev: currentPage > 1,
      },

      count: packages.length,

      packages,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PACKAGE DETAILS
|--------------------------------------------------------------------------
|
| Returns one active package
| Automatically increments views
|--------------------------------------------------------------------------
*/

export const getPackageDetails = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND PACKAGE
    |--------------------------------------------------------------------------
    */

    const packageData = await TourPackage.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "active",
      },
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    next(error);
  }
};