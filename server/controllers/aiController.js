/**
 * Purpose: ai Controller HTTP controller. Main declarations: cleanMessage, askAI.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/aiService.js so this module can use its exported dependencies.
import { generateTravelAdvice } from "../services/aiService.js";
// Load ../services/aiConversationService.js so this module can use its exported dependencies.
import {
  addMessage
} from "../services/aiConversationService.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

// Declare MAX_MESSAGE_LENGTH for use by the surrounding module or function.
const MAX_MESSAGE_LENGTH = 2000;

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Declare cleanMessage for use by the surrounding module or function.
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

// Declare askAI for use by the surrounding module or function.
export const askAI = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Request
    |--------------------------------------------------------------------------
    */

    // Declare { message } for use by the surrounding module or function.
    let { message } = req.body;

    // Check the condition (typeof message !== "string") and run the matching branch.
    if (typeof message !== "string") {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Message must be a string.",
      });
    }

    // Perform the side effect or state update expressed on the following line.
    message = cleanMessage(message);

    // Check the condition (!message) and run the matching branch.
    if (!message) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Check the condition (message.length > MAX_MESSAGE_LENGTH) and run the matching branch.
    if (message.length > MAX_MESSAGE_LENGTH) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare reply for use by the surrounding module or function.
    const reply = await generateTravelAdvice(message, req.user || null);

    /*
    |--------------------------------------------------------------------------
    | Validate AI Response
    |--------------------------------------------------------------------------
    */

    // Check the condition (!reply) and run the matching branch.
    if (!reply) {
      // Return the result of res.status(502).json() to the caller.
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

    // Perform the side effect or state update expressed on the following line.
    res.status(200).json({
      success: true,
      data: {
        message,
        reply,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
