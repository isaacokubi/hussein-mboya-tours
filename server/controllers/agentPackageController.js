/**
 * Purpose: agent Package Controller HTTP controller. Main declarations: isValidId, getAgentPackages, getPackageDetails.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/TourPackage.js so this module can use its exported dependencies.
import TourPackage from "../models/TourPackage.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Declare isValidId for use by the surrounding module or function.
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

// Declare getAgentPackages for use by the surrounding module or function.
export const getAgentPackages = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { search, category, destination, featured, page = 1, limit = 12, sort = "latest", } for use by the surrounding module or function.
    const {
      search,
      category,
      destination,
      featured,
      page = 1,
      limit = 12,
      sort = "latest",
    } = req.query;

    // Declare currentPage for use by the surrounding module or function.
    const currentPage = Math.max(Number(page), 1);
    // Declare pageSize for use by the surrounding module or function.
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    // Declare skip for use by the surrounding module or function.
    const skip = (currentPage - 1) * pageSize;

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    // Declare filter for use by the surrounding module or function.
    const filter = {
      status: "active",
    };

    // Check the condition (category) and run the matching branch.
    if (category) {
      // Perform the side effect or state update expressed on the following line.
      filter.category = category;
    }

    // Check the condition (destination) and run the matching branch.
    if (destination) {
      // Perform the side effect or state update expressed on the following line.
      filter.destination = {
        $regex: destination,
        $options: "i",
      };
    }

    // Check the condition (featured === "true") and run the matching branch.
    if (featured === "true") {
      // Perform the side effect or state update expressed on the following line.
      filter.featured = true;
    }

    // Check the condition (search) and run the matching branch.
    if (search) {
      // Perform the side effect or state update expressed on the following line.
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

    // Declare sortOption for use by the surrounding module or function.
    let sortOption = {
      createdAt: -1,
    };

    // Select the appropriate branch based on sort.
    switch (sort) {
      case "price-low":
        // Perform the side effect or state update expressed on the following line.
        sortOption = {
          agentPrice: 1,
        };
        // Exit the current loop or switch branch.
        break;

      case "price-high":
        // Perform the side effect or state update expressed on the following line.
        sortOption = {
          agentPrice: -1,
        };
        // Exit the current loop or switch branch.
        break;

      case "popular":
        // Perform the side effect or state update expressed on the following line.
        sortOption = {
          views: -1,
        };
        // Exit the current loop or switch branch.
        break;

      case "latest":
      default:
        // Perform the side effect or state update expressed on the following line.
        sortOption = {
          createdAt: -1,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | FETCH DATA
    |--------------------------------------------------------------------------
    */

    // Declare [packages, total] for use by the surrounding module or function.
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

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
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

// Declare getPackageDetails for use by the surrounding module or function.
export const getPackageDetails = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare packageData for use by the surrounding module or function.
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

    // Check the condition (!packageData) and run the matching branch.
    if (!packageData) {
      // Return the result of res.status(404).json() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      package: packageData,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
