/**
 * Purpose: ai Service business-logic service. Main declarations: generateTravelAdvice.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load openai so this module can use its exported dependencies.
import OpenAI from "openai";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";
// Load ./aiKnowledgeFormatter.js so this module can use its exported dependencies.
import { formatTravelKnowledge } from "./aiKnowledgeFormatter.js";
// Load ./aiTourSearchService.js so this module can use its exported dependencies.
import { searchRelevantTours } from "./aiTourSearchService.js";
// Load ./aiBookingDraftService.js so this module can use its exported dependencies.
import { createAIBookingDraft } from "./aiBookingDraftService.js";
// Load ./aiIntentService.js so this module can use its exported dependencies.
import { detectIntent } from "./aiIntentService.js";

// Perform the side effect or state update expressed on the following line.
console.log("OPENAI KEY STATUS:", env.OPENAI_API_KEY ? "Loaded" : "Missing");
// Perform the side effect or state update expressed on the following line.
console.log("AI MODEL:", env.AI_MODEL);

// AI is an optional application capability. The API must still boot and the
// deterministic tour-search fallback must remain available when no key is set.
// Declare client for use by the surrounding module or function.
const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

// Declare generateTravelAdvice for use by the surrounding module or function.
export const generateTravelAdvice = async (message, user = null) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings();
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || "Company";
  // Declare intent for use by the surrounding module or function.
  const intent = detectIntent(message);
  // Declare bookingIntent for use by the surrounding module or function.
  const bookingIntent = /book|booking|reserve|reservation/i.test(message);

  // Check the condition (bookingIntent) and run the matching branch.
  if (bookingIntent) {
    // Declare bookingDraft for use by the surrounding module or function.
    const bookingDraft = await createAIBookingDraft(message, user);
    // Check the condition (bookingDraft) and run the matching branch.
    if (bookingDraft) {
      // Return the expression shown below to the caller.
      return `
Great choice. I can help you start your booking.

Tour:
${bookingDraft.tour.title}

Tour ID:
${bookingDraft.tour._id}

Booking ID:
${bookingDraft.booking._id}

Destination:
${bookingDraft.tour.destination?.name || "Africa"}

Please provide:

- travel date
- number of travellers
- your name
- email address
- phone number

Once I have these details, I will prepare your booking.
`;
    }
  }

  // Declare relevantTours for use by the surrounding module or function.
  const relevantTours = await searchRelevantTours(message);
  // Declare travelKnowledge for use by the surrounding module or function.
  const travelKnowledge = formatTravelKnowledge({ tours: relevantTours, destinations: [] });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!client) and run the matching branch.
    if (!client) throw new Error("OPENAI_API_KEY is not configured; using deterministic travel-assistant fallback.");

    // Declare response for use by the surrounding module or function.
    const response = await client.responses.create({
      model: env.AI_MODEL,
      input: [
        { role: "system", content: [{ type: "input_text", text: `You are ${companyName} AI Assistant.\n\nCUSTOMER INTENT:\n${intent}\n\nLIVE TOUR DATABASE:\n${travelKnowledge}\n\nYou help customers with:\n\n- Travel advice\n- Tour recommendations\n- Safari planning\n- Beach holidays\n- Kenya destinations\n- Tanzania destinations\n- Uganda destinations\n- Travel budgets\n- Packing tips\n- Visa guidance\n- Weather advice\n- Itinerary planning\n\nAlways be friendly, concise and professional.\nIf the user asks about tours, recommend suitable destinations.\nIf you don't know something, say so instead of making it up.` }] },
        { role: "user", content: [{ type: "input_text", text: message }] },
      ],
      temperature: 0.7,
      max_output_tokens: 600,
    });

    // Return the output text value to the caller.
    return response.output_text;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("OpenAI Error:", error.message);

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare fallbackTours for use by the surrounding module or function.
      const fallbackTours = relevantTours;
      // Declare lowerMessage for use by the surrounding module or function.
      const lowerMessage = message.toLowerCase();

      // Check the condition (lowerMessage.includes("book") || lowerMessage.includes("booking") || l) and run the matching branch.
      if (lowerMessage.includes("book") || lowerMessage.includes("booking") || lowerMessage.includes("reserve")) {
        // Declare selectedTour for use by the surrounding module or function.
        const selectedTour = fallbackTours[0];
        // Check the condition (selectedTour) and run the matching branch.
        if (selectedTour) {
          // Return the expression shown below to the caller.
          return `
Great choice.

I can help you start your booking for:

Tour:
${selectedTour.title}

Destination:
${selectedTour.destination?.name || selectedTour.country || "Africa"}

Price:
${selectedTour.price || "Contact us"}

Please provide:

1. Your travel date
2. Number of travellers
3. Full name
4. Phone number
5. Email address

Once received, we will prepare your booking confirmation.
`;
        }
        // Return a configured text value to the caller.
        return `
Great choice.

I can help you start your booking.

Please provide:

1. Your preferred tour
2. Travel date
3. Number of travellers
4. Full name
5. Phone number
6. Email address
`;
      }

      // Check the condition (fallbackTours.length > 0) and run the matching branch.
      if (fallbackTours.length > 0) {
        // Return the expression shown below to the caller.
        return `
I can help you plan your journey.

Based on our available tours:

${fallbackTours.map((tour, index) => `
${index + 1}. ${tour.title}

Destination:
${tour.destination?.name || tour.country || "Africa"}

Category:
${tour.category || "Tour"}

Duration:
${tour.durationDetails?.days || tour.duration || "Flexible"} days

Price:
${tour.price || "Contact us"}

Overview:
${tour.description?.substring(0, 200) || ""}
`).join("\n")}

Would you like me to help customize this trip or make a booking?
`;
      }

      // Return a configured text value to the caller.
      return `
I can help you discover African adventures.

Please tell me:

- preferred destination
- budget
- number of travel days
- travel style
`;
    } catch (fallbackError) {
      // Perform the side effect or state update expressed on the following line.
      console.error("AI fallback error:", fallbackError.message);
      // Return a configured text value to the caller.
      return `
Our travel assistant is temporarily unavailable.

Please contact our support team for assistance.
`;
    }
  }
};
