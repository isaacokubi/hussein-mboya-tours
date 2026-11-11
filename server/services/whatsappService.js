/**
 * Purpose: whatsapp Service business-logic service. Main declarations: sendWhatsApp.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// services/whatsappService.js

// Load axios so this module can use its exported dependencies.
import axios from "axios";

/*
|--------------------------------------------------------------------------
| SEND WHATSAPP MESSAGE
|--------------------------------------------------------------------------
|
| Uses Meta WhatsApp Cloud API
|
| Required ENV variables:
|
| WHATSAPP_API_URL
| WHATSAPP_ACCESS_TOKEN
|
|--------------------------------------------------------------------------
*/

// Declare sendWhatsApp for use by the surrounding module or function.
export const sendWhatsApp = async ({
  to,
  message,
}) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!to) and run the matching branch.
    if (!to) throw new Error("WhatsApp recipient is required.");
    // Check the condition (!message) and run the matching branch.
    if (!message) throw new Error("WhatsApp message is required.");

    // Declare normalizedTo for use by the surrounding module or function.
    let normalizedTo = String(to).trim().replace(/[^0-9+]/g, "");
    // Check the condition (/^0\d{9}$/.test(normalizedTo)) and run the matching branch.
    if (/^0\d{9}$/.test(normalizedTo)) {
      // Perform the side effect or state update expressed on the following line.
      normalizedTo = `254${normalizedTo.slice(1)}`;
    } else {
      // Perform the side effect or state update expressed on the following line.
      normalizedTo = normalizedTo.replace(/^\+/, "");
    }
    // Check the condition (!process.env.WHATSAPP_API_URL) and run the matching branch.
    if (!process.env.WHATSAPP_API_URL) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("WHATSAPP_API_URL is missing");
    }

    // Check the condition (!process.env.WHATSAPP_ACCESS_TOKEN) and run the matching branch.
    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("WHATSAPP_ACCESS_TOKEN is missing");
    }

    // Declare response for use by the surrounding module or function.
    const response = await axios.post(
      process.env.WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to: normalizedTo,

        type: "text",

        text: {
          preview_url: false,

          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,

          "Content-Type": "application/json",
        },

        timeout: 15000,
      }
    );

    // Return the data value to the caller.
    return response.data;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "WhatsApp Error:",
      error.response?.data || error.message
    );

    // Stop the current operation by raising the value of error.
    throw error;
  }
};
