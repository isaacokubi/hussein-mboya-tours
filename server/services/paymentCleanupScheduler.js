/**
 * Purpose: payment Cleanup Scheduler business-logic service. Main declarations: startPaymentCleanupScheduler.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load node-cron so this module can use its exported dependencies.
import cron from "node-cron";
// Load ./bookingPaymentCleanupService.js so this module can use its exported dependencies.
import { cancelExpiredPendingBookings } from "./bookingPaymentCleanupService.js";


// Declare startPaymentCleanupScheduler for use by the surrounding module or function.
export const startPaymentCleanupScheduler = () => {

  // Perform the side effect or state update expressed on the following line.
  cron.schedule(
    "*/10 * * * *",
    async () => {

      // Run this operation with a dedicated error-handling path for failures.
      try {

        // Perform the side effect or state update expressed on the following line.
        await cancelExpiredPendingBookings();

      } catch(error){

        // Perform the side effect or state update expressed on the following line.
        console.error(
          "[PAYMENT CLEANUP ERROR]",
          error.message
        );

      }

    }
  );


  // Perform the side effect or state update expressed on the following line.
  console.log(
    "Payment cleanup scheduler started."
  );

};
