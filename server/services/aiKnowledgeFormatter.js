/**
 * Purpose: ai Knowledge Formatter business-logic service. Main declarations: formatTravelKnowledge.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Declare formatTravelKnowledge for use by the surrounding module or function.
export const formatTravelKnowledge = (knowledge = {}) => {

  // Declare tours for use by the surrounding module or function.
  const tours = (knowledge.tours || [])
    .map(tour => {

      // Declare destination for use by the surrounding module or function.
      const destination =
        tour.destination?.name ||
        "Unknown destination";

      // Return the expression shown below to the caller.
      return `
TOUR:
Name: ${tour.title}
Destination: ${destination}
Country: ${tour.country || ""}
Category: ${tour.category || ""}
Duration: ${tour.duration || tour.durationDetails?.days || ""} days
Price: ${tour.price || ""}
Featured: ${tour.featured ? "Yes" : "No"}
Description: ${tour.description || ""}
`;

    })
    .join("\n");


  // Declare destinations for use by the surrounding module or function.
  const destinations = (knowledge.destinations || [])
    .map(destination => {

      // Return the expression shown below to the caller.
      return `
DESTINATION:
Name: ${destination.name}
Country: ${destination.country}
Region: ${destination.region || ""}
Activities: ${(destination.activities || []).join(", ")}
Attractions: ${(destination.attractions || []).join(", ")}
Description: ${destination.shortDescription || ""}
`;

    })
    .join("\n");


  // Return the expression shown below to the caller.
  return `
AVAILABLE TOURS
================
${tours}


AVAILABLE DESTINATIONS
================
${destinations}
`;

};
