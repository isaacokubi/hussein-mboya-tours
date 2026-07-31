import QRCode from "qrcode";

/*
|--------------------------------------------------------------------------
| GENERATE BOOKING QR CODE
|--------------------------------------------------------------------------
|
| Encodes a secure verification URL instead of customer data.
|
*/

export const generateTicketQR = async (booking) => {
  try {
    if (!booking || !booking.bookingNumber) {
      throw new Error("Invalid booking.");
    }

    const baseUrl =
      process.env.CLIENT_URL || "http://localhost:5173";

    const verificationUrl =
      `${baseUrl}/booking/${booking.bookingNumber}`;

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
    console.error(
      "QR code generation failed:",
      error.message
    );

    throw error;
  }
};