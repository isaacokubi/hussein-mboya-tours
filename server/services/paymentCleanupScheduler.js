import cron from "node-cron";
import { cancelExpiredPendingBookings } from "./bookingPaymentCleanupService.js";


export const startPaymentCleanupScheduler = () => {

  cron.schedule(
    "*/10 * * * *",
    async () => {

      try {

        await cancelExpiredPendingBookings();

      } catch(error){

        console.error(
          "[PAYMENT CLEANUP ERROR]",
          error.message
        );

      }

    }
  );


  console.log(
    "Payment cleanup scheduler started."
  );

};
