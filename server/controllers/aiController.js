import { mergeTenantFilter } from "../tenancy/context.js";
import { generateTravelAdvice } from "../services/aiService.js";
import {
  addMessage
} from "../services/aiConversationService.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const MAX_MESSAGE_LENGTH = 2000;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const cleanMessage = (message = "") =>
  message.trim().replace(/\s+/g, " ");

/*
|--------------------------------------------------------------------------
| ASK AI
|--------------------------------------------------------------------------
|
| POST /api/ai/chat
|--------------------------------------------------------------------------
*/

export const askAI = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Request
    |--------------------------------------------------------------------------
    */

    let { message } = req.body;

    if (typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be a string.",
      });
    }

    message = cleanMessage(message);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Generate AI Response
    |--------------------------------------------------------------------------
    */

    const reply = await generateTravelAdvice(message, req.user || null);

    /*
    |--------------------------------------------------------------------------
    | Validate AI Response
    |--------------------------------------------------------------------------
    */

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "AI service returned an empty response.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.status(200).json({
      success: true,
      data: {
        message,
        reply,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    next(error);
  }
};
