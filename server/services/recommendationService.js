/**
 * Purpose: recommendation Service business-logic service. Main declarations: recommendTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| RECOMMEND TOURS
|--------------------------------------------------------------------------
*/

// Declare recommendTours for use by the surrounding module or function.
export const recommendTours = async (preferences = {}) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare { preferredCountries = [], travelStyle = [], minBudget, maxBudget, minDuration, maxDuration, featuredOnly = false, limit = 10, } for use by the surrounding module or function.
  const {
    preferredCountries = [],
    travelStyle = [],
    minBudget,
    maxBudget,
    minDuration,
    maxDuration,
    featuredOnly = false,
    limit = 10,
  } = preferences;

  // Declare query for use by the surrounding module or function.
  const query = {
    status: "active",
  };

  /*
  |--------------------------------------------------------------------------
  | COUNTRY
  |--------------------------------------------------------------------------
  */

  // Check the condition (preferredCountries.length) and run the matching branch.
  if (preferredCountries.length) {
    // Perform the side effect or state update expressed on the following line.
    query.country = {
      $in: preferredCountries,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY
  |--------------------------------------------------------------------------
  */

  // Check the condition (travelStyle.length) and run the matching branch.
  if (travelStyle.length) {
    // Perform the side effect or state update expressed on the following line.
    query.category = {
      $in: travelStyle,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */

  // Check the condition (minBudget !== undefined || maxBudget !== undefined) and run the matching branch.
  if (
    minBudget !== undefined ||
    maxBudget !== undefined
  ) {
    // Perform the side effect or state update expressed on the following line.
    query.price = {};

    // Check the condition (minBudget !== undefined) and run the matching branch.
    if (minBudget !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      query.price.$gte = minBudget;
    }

    // Check the condition (maxBudget !== undefined) and run the matching branch.
    if (maxBudget !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      query.price.$lte = maxBudget;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DURATION
  |--------------------------------------------------------------------------
  */

  // Check the condition (minDuration !== undefined || maxDuration !== undefined) and run the matching branch.
  if (
    minDuration !== undefined ||
    maxDuration !== undefined
  ) {
    // Perform the side effect or state update expressed on the following line.
    query.duration = {};

    // Check the condition (minDuration !== undefined) and run the matching branch.
    if (minDuration !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      query.duration.$gte = minDuration;
    }

    // Check the condition (maxDuration !== undefined) and run the matching branch.
    if (maxDuration !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      query.duration.$lte = maxDuration;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FEATURED
  |--------------------------------------------------------------------------
  */

  // Check the condition (featuredOnly) and run the matching branch.
  if (featuredOnly) {
    // Perform the side effect or state update expressed on the following line.
    query.featured = true;
  }

  // Declare tours for use by the surrounding module or function.
  let tours = await Tour.find(query)
    .populate("destination", "name country")
    .sort({
      featured: -1,
      rating: -1,
      bookingsCount: -1,
    })
    .limit(limit);

  /*
  |--------------------------------------------------------------------------
  | FALLBACK
  |--------------------------------------------------------------------------
  |
  | If no tours match the filters,
  | return the highest-rated active tours.
  |
  */

  // Check the condition (!tours.length) and run the matching branch.
  if (!tours.length) {
    // Perform the side effect or state update expressed on the following line.
    tours = await Tour.find({
      status: "active",
    })
      .populate("destination", "name country")
      .sort({
        featured: -1,
        rating: -1,
      })
      .limit(limit);
  }

  // Return the value of tours to the caller.
  return tours;
};
