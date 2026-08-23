import { mergeTenantFilter } from "../tenancy/context.js";
export const formatTravelKnowledge = (knowledge = {}) => {

  const tours = (knowledge.tours || [])
    .map(tour => {

      const destination =
        tour.destination?.name ||
        "Unknown destination";

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


  const destinations = (knowledge.destinations || [])
    .map(destination => {

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


  return `
AVAILABLE TOURS
================
${tours}


AVAILABLE DESTINATIONS
================
${destinations}
`;

};
