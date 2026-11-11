/**
 * Purpose: ai Knowledge Service business-logic service. Main declarations: getTravelKnowledge.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";

// Declare getTravelKnowledge for use by the surrounding module or function.
export const getTravelKnowledge = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare tours for use by the surrounding module or function.
  const tours = await Tour.find(
    mergeTenantFilter({
      status: {
        $ne: "inactive",
      },
    })
  )
    .populate("destination", "name country")
    .select(
      `
      title
      description
      category
      duration
      durationDetails
      price
      featured
      destination
      country
      `
    )
    .limit(50)
    .lean();

  // Declare destinations for use by the surrounding module or function.
  const destinations = await Destination.find(
    mergeTenantFilter({})
  )
    .select(
      `
      name
      country
      region
      shortDescription
      attractions
      activities
      `
    )
    .limit(50)
    .lean();

  // Return the object assembled below to the caller.
  return {
    tours,
    destinations,
  };
};
