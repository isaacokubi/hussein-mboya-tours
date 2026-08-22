import { mergeTenantFilter } from "../tenancy/context.js";
import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| RECOMMEND TOURS
|--------------------------------------------------------------------------
*/

export const recommendTours = async (preferences = {}) => {
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

  const query = {
    status: "active",
  };

  /*
  |--------------------------------------------------------------------------
  | COUNTRY
  |--------------------------------------------------------------------------
  */

  if (preferredCountries.length) {
    query.country = {
      $in: preferredCountries,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CATEGORY
  |--------------------------------------------------------------------------
  */

  if (travelStyle.length) {
    query.category = {
      $in: travelStyle,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */

  if (
    minBudget !== undefined ||
    maxBudget !== undefined
  ) {
    query.price = {};

    if (minBudget !== undefined) {
      query.price.$gte = minBudget;
    }

    if (maxBudget !== undefined) {
      query.price.$lte = maxBudget;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DURATION
  |--------------------------------------------------------------------------
  */

  if (
    minDuration !== undefined ||
    maxDuration !== undefined
  ) {
    query.duration = {};

    if (minDuration !== undefined) {
      query.duration.$gte = minDuration;
    }

    if (maxDuration !== undefined) {
      query.duration.$lte = maxDuration;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | FEATURED
  |--------------------------------------------------------------------------
  */

  if (featuredOnly) {
    query.featured = true;
  }

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

  if (!tours.length) {
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

  return tours;
};