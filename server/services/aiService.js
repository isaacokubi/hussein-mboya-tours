import OpenAI from "openai";
import env from "../config/env.js";

console.log(
  "OPENAI KEY STATUS:",
  env.OPENAI_API_KEY ? "Loaded" : "Missing"
);

console.log(
  "AI MODEL:",
  env.AI_MODEL
);

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const generateTravelAdvice = async (message) => {
  try {
    const response = await client.responses.create({
      model: env.AI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are Coherent Tours AI Assistant.

You help customers with:

- Travel advice
- Tour recommendations
- Safari planning
- Beach holidays
- Kenya destinations
- Tanzania destinations
- Uganda destinations
- Travel budgets
- Packing tips
- Visa guidance
- Weather advice
- Itinerary planning

Always be friendly, concise and professional.
If the user asks about tours, recommend suitable destinations.
If you don't know something, say so instead of making it up.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      ],
      temperature: 0.7,
      max_output_tokens: 600,
    });

    return response.output_text;
  } catch (error) {
    console.error("OpenAI Error:", error);

    throw new Error("Unable to generate travel advice.");
  }
};