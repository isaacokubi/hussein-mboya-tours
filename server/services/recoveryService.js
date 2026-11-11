/**
 * Purpose: recovery Service business-logic service. Main declarations: recoverBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ./emailService.js so this module can use its exported dependencies.
import { sendEmail } from "./emailService.js";

/*
|--------------------------------------------------------------------------
| RECOVER ABANDONED BOOKINGS
|--------------------------------------------------------------------------
|
| Sends reminder emails for pending bookings that:
| - are not abandoned
| - are at least 24 hours old
| - haven't received a reminder in the last 24 hours
|
*/

// Declare recoverBookings for use by the surrounding module or function.
export const recoverBookings = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings();
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || "Company";
  // Declare now for use by the surrounding module or function.
  const now = new Date();

  // Declare twentyFourHoursAgo for use by the surrounding module or function.
  const twentyFourHoursAgo = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );

  // Declare bookings for use by the surrounding module or function.
  const bookings = await Booking.find({
    paymentStatus: "pending",

    abandoned: false,

    createdAt: {
      $lte: twentyFourHoursAgo,
    },

    $or: [
      {
        lastReminderSent: {
          $exists: false,
        },
      },
      {
        lastReminderSent: {
          $lte: twentyFourHoursAgo,
        },
      },
    ],
  });

  // Declare remindersSent for use by the surrounding module or function.
  let remindersSent = 0;
  // Declare failures for use by the surrounding module or function.
  let failures = 0;

  // Repeat the enclosed work for each required iteration.
  for (const booking of bookings) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (!booking.contact?.email) and run the matching branch.
      if (!booking.contact?.email) {
        // Skip the remainder of this iteration and continue with the next one.
        continue;
      }

      // Perform the side effect or state update expressed on the following line.
      await sendEmail({
        to: booking.contact.email,

        subject:
          `Complete Your ${companyName} Booking`,

        html: `
          <h2>Your adventure is waiting 🌍</h2>

          <p>
            Hi ${booking.contact.name || "Traveler"},
          </p>

          <p>
            Your booking <strong>${booking.bookingNumber}</strong>
            is still waiting for payment.
          </p>

          <p>
            Complete your payment to secure your reservation before it expires.
          </p>

          <p>
            Thank you for choosing ${companyName}.
          </p>
        `,
      });

      // Perform the side effect or state update expressed on the following line.
      booking.lastReminderSent = now;

      // Perform the side effect or state update expressed on the following line.
      await booking.save();

      // Perform the side effect or state update expressed on the following line.
      remindersSent++;
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      failures++;

      // Perform the side effect or state update expressed on the following line.
      console.error(
        `Failed sending reminder for booking ${booking._id}:`,
        error.message
      );
    }
  }

  // Return the object assembled below to the caller.
  return {
    processed: bookings.length,
    remindersSent,
    failures,
  };
};
