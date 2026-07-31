// services/whatsappService.js

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

export const sendWhatsApp = async ({
  to,
  message,
}) => {
  try {
    if (!process.env.WHATSAPP_API_URL) {
      throw new Error("WHATSAPP_API_URL is missing");
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      throw new Error("WHATSAPP_ACCESS_TOKEN is missing");
    }

    const response = await axios.post(
      process.env.WHATSAPP_API_URL,
      {
        messaging_product: "whatsapp",

        recipient_type: "individual",

        to,

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

    return response.data;
  } catch (error) {
    console.error(
      "WhatsApp Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};