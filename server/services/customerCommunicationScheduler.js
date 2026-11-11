/**
 * Purpose: customer Communication Scheduler business-logic service. Main declarations: startCustomerCommunicationScheduler, run.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Subscription from "../models/Subscription.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ./customerCommunicationService.js so this module can use its exported dependencies.
import { runCommunicationAutomation, sendSubscriptionReminderAutomation } from "./customerCommunicationService.js";

// Declare startCustomerCommunicationScheduler for use by the surrounding module or function.
export const startCustomerCommunicationScheduler = () => {
  // Declare run for use by the surrounding module or function.
  const run = async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Perform the side effect or state update expressed on the following line.
      await runWithTenant({ role: "super_admin", bypass: true }, async () => {
        // Perform the side effect or state update expressed on the following line.
        await runCommunicationAutomation();
        // Declare now for use by the surrounding module or function.
        const now = new Date();
        // Declare expired for use by the surrounding module or function.
        const expired = await Subscription.find({ status: "expired", currentPeriodEndsAt: { $ne: null, $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).lean();
        // Repeat the enclosed work for each required iteration.
        for (const subscription of expired) {
          // Perform the side effect or state update expressed on the following line.
          await sendSubscriptionReminderAutomation({ subscription, expired: true }).catch((error) => console.error("Subscription expiry notification failed:", error.message));
        }
      });
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error("Customer communication automation failed:", error.message);
    }
  };
  // Perform the side effect or state update expressed on the following line.
  run();
  // Return the result of setInterval() to the caller.
  return setInterval(run, 60 * 60 * 1000);
};
