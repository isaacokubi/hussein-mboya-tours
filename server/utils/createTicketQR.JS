/**
 * Purpose: create Ticket QR server application module. Main declarations: generateTicketQR.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import QRCode from "qrcode";

/*
|--------------------------------------------------------------------------
| GENERATE BOOKING QR CODE
|--------------------------------------------------------------------------
|
| Encodes a secure verification URL instead of customer data.
|
*/

// Declare generateTicketQR for use by the surrounding module or function.
export const generateTicketQR = async (booking) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!booking || !booking.bookingNumber) and run the matching branch.
    if (!booking || !booking.bookingNumber) {
      // Stop the current operation by raising a new Error instance.
      throw new Error("Invalid booking.");
    }

    // Declare baseUrl for use by the surrounding module or function.
    const baseUrl =
      process.env.CLIENT_URL || "http://localhost:5173";

    // Declare verificationUrl for use by the surrounding module or function.
    const verificationUrl =
      `${baseUrl}/booking/${booking.bookingNumber}`;

    // Return the completed the result of QRCode.toDataURL() operation to the caller.
    return await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "QR code generation failed:",
      error.message
    );

    // Stop the current operation by raising the value of error.
    throw error;
  }
};
