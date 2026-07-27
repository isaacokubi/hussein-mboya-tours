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

  apiKey: env.OPENAI_API_KEY

});



export const generateTravelAdvice =
async (message) => {


  const response =
  await client.chat.completions.create({

    model: env.AI_MODEL,

    messages: [

      {
        role:"system",
        content:
        "You are a professional travel assistant. Give helpful travel advice, destinations, itineraries and recommendations."
      },


      {
        role:"user",
        content:message
      }

    ]

  });


  return response
  .choices[0]
  .message
  .content;


};