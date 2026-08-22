import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import { getSystemSettings } from "../services/settingsService.js";
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

export const recoverBookings = async () => {
  requireTenantId();

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";
  const now = new Date();

  const twentyFourHoursAgo = new Date(
    now.getTime() - 24 * 60 * 60 * 1000
  );

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

  let remindersSent = 0;
  let failures = 0;

  for (const booking of bookings) {
    try {
      if (!booking.contact?.email) {
        continue;
      }

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

      booking.lastReminderSent = now;

      await booking.save();

      remindersSent++;
    } catch (error) {
      failures++;

      console.error(
        `Failed sending reminder for booking ${booking._id}:`,
        error.message
      );
    }
  }

  return {
    processed: bookings.length,
    remindersSent,
    failures,
  };
};