import Subscription from "../models/Subscription.js";
import { runWithTenant } from "../tenancy/context.js";
import { runCommunicationAutomation, sendSubscriptionReminderAutomation } from "./customerCommunicationService.js";

export const startCustomerCommunicationScheduler = () => {
  const run = async () => {
    try {
      await runCommunicationAutomation();
      const now = new Date();
      const expired = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.find({ status: "expired", currentPeriodEndsAt: { $ne: null, $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }).lean());
      for (const subscription of expired) {
        await sendSubscriptionReminderAutomation({ subscription, expired: true }).catch((error) => console.error("Subscription expiry notification failed:", error.message));
      }
    } catch (error) {
      console.error("Customer communication automation failed:", error.message);
    }
  };
  run();
  return setInterval(run, 60 * 60 * 1000);
};
