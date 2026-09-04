import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";

export const getTravelKnowledge = async () => {
  requireTenantId();

  const tours = await Tour.find(
    mergeTenantFilter({
      status: { $ne: "inactive" },
    })
  )
    .populate("destination", "name country")
    .select(`
      title
      description
      category
      duration
      durationDetails
      price
      featured
      destination
      country
    `)
    .limit(50)
    .lean();

  const destinations = await Destination.find(
    mergeTenantFilter({})
  )
    .select(`
      name
      country
      region
      shortDescription
      attractions
      activities
    `)
    .limit(50)
    .lean();

  return {
    tours,
    destinations,
  };
};
