import { requireTenantId } from "../tenancy/context.js";
import OpenAI from "openai";
import { getSystemSettings } from "../services/settingsService.js";
import env from "../config/env.js";
import { formatTravelKnowledge } from "./aiKnowledgeFormatter.js";
import { searchRelevantTours } from "./aiTourSearchService.js";
import { createAIBookingDraft } from "./aiBookingDraftService.js";
import { detectIntent } from "./aiIntentService.js";

console.log("OPENAI KEY STATUS:", env.OPENAI_API_KEY ? "Loaded" : "Missing");
console.log("AI MODEL:", env.AI_MODEL);

// AI is an optional application capability. The API must still boot and the
// deterministic tour-search fallback must remain available when no key is set.
const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export const generateTravelAdvice = async (message, user = null) => {
  requireTenantId();

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";
  const intent = detectIntent(message);
  const bookingIntent = /book|booking|reserve|reservation/i.test(message);

  if (bookingIntent) {
    const bookingDraft = await createAIBookingDraft(message, user);
    if (bookingDraft) {
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

  const relevantTours = await searchRelevantTours(message);
  const travelKnowledge = formatTravelKnowledge({ tours: relevantTours, destinations: [] });

  try {
    if (!client) throw new Error("OPENAI_API_KEY is not configured; using deterministic travel-assistant fallback.");

    const response = await client.responses.create({
      model: env.AI_MODEL,
      input: [
        { role: "system", content: [{ type: "input_text", text: `You are ${companyName} AI Assistant.\n\nCUSTOMER INTENT:\n${intent}\n\nLIVE TOUR DATABASE:\n${travelKnowledge}\n\nYou help customers with:\n\n- Travel advice\n- Tour recommendations\n- Safari planning\n- Beach holidays\n- Kenya destinations\n- Tanzania destinations\n- Uganda destinations\n- Travel budgets\n- Packing tips\n- Visa guidance\n- Weather advice\n- Itinerary planning\n\nAlways be friendly, concise and professional.\nIf the user asks about tours, recommend suitable destinations.\nIf you don't know something, say so instead of making it up.` }] },
        { role: "user", content: [{ type: "input_text", text: message }] },
      ],
      temperature: 0.7,
      max_output_tokens: 600,
    });

    return response.output_text;
  } catch (error) {
    console.error("OpenAI Error:", error.message);

    try {
      const fallbackTours = relevantTours;
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("book") || lowerMessage.includes("booking") || lowerMessage.includes("reserve")) {
        const selectedTour = fallbackTours[0];
        if (selectedTour) {
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

      if (fallbackTours.length > 0) {
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

      return `
I can help you discover African adventures.

Please tell me:

- preferred destination
- budget
- number of travel days
- travel style
`;
    } catch (fallbackError) {
      console.error("AI fallback error:", fallbackError.message);
      return `
Our travel assistant is temporarily unavailable.

Please contact our support team for assistance.
`;
    }
  }
};
