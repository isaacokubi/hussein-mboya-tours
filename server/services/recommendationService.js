import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";

/*
|--------------------------------------------------------------------------
| RECOMMEND TOURS
|--------------------------------------------------------------------------
*/

export const recommendTours = async (preferences = {}) => {
  requireTenantId();
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

  const query = mergeTenantFilter({
    status: "active",
  });

  if (preferredCountries.length) {
    query.country = { $in: preferredCountries };
  }

  if (travelStyle.length) {
    query.category = { $in: travelStyle };
  }

  if (minBudget !== undefined || maxBudget !== undefined) {
    query.price = {};

    if (minBudget !== undefined) {
      query.price.$gte = minBudget;
    }

    if (maxBudget !== undefined) {
      query.price.$lte = maxBudget;
    }
  }

  if (minDuration !== undefined || maxDuration !== undefined) {
    query.duration = {};

    if (minDuration !== undefined) {
      query.duration.$gte = minDuration;
    }

    if (maxDuration !== undefined) {
      query.duration.$lte = maxDuration;
    }
  }

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

  if (!tours.length) {
    tours = await Tour.find(
      mergeTenantFilter({
        status: "active",
      })
    )
      .populate("destination", "name country")
      .sort({
        featured: -1,
        rating: -1,
      })
      .limit(limit);
  }

  return tours;
};
