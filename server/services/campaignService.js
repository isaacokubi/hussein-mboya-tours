/**
 * Purpose: campaign Service business-logic service. Main declarations: sendCampaign.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";

// Load ./emailService.js so this module can use its exported dependencies.
import { sendEmail } from "./emailService.js";

/*
|--------------------------------------------------------------------------
| SEND EMAIL CAMPAIGN
|--------------------------------------------------------------------------
*/

// Declare sendCampaign for use by the surrounding module or function.
export const sendCampaign = async (campaign) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | BUILD AUDIENCE FILTER
    |--------------------------------------------------------------------------
    */

    // Declare filter for use by the surrounding module or function.
    const filter = {
      legacyRole: "customer",
      isActive: true,
    };

    // Check the condition (campaign.audience === "vip") and run the matching branch.
    if (campaign.audience === "vip") {
      // Perform the side effect or state update expressed on the following line.
      filter.customerType = "vip";
    }

    // Declare users for use by the surrounding module or function.
    const users = await User.find(filter).select(
      "email name"
    );

    // Declare sentCount for use by the surrounding module or function.
    let sentCount = 0;
    // Declare failedCount for use by the surrounding module or function.
    let failedCount = 0;

    /*
    |--------------------------------------------------------------------------
    | SEND EMAILS
    |--------------------------------------------------------------------------
    */

    // Repeat the enclosed work for each required iteration.
    for (const user of users) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        await sendEmail({
          to: user.email,

          subject: campaign.subject,

          html: campaign.message,
        });

        // Perform the side effect or state update expressed on the following line.
        sentCount++;
      } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        failedCount++;

        // Perform the side effect or state update expressed on the following line.
        console.error(
          `Failed to send email to ${user.email}:`,
          error.message
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE CAMPAIGN
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    campaign.sentCount = sentCount;

    // Perform the side effect or state update expressed on the following line.
    campaign.failedCount = failedCount;

    // Perform the side effect or state update expressed on the following line.
    campaign.status =
      failedCount === users.length
        ? "failed"
        : "sent";

    // Perform the side effect or state update expressed on the following line.
    campaign.sentAt = new Date();

    // Perform the side effect or state update expressed on the following line.
    await campaign.save();

    // Return the object assembled below to the caller.
    return {
      success: true,
      totalRecipients: users.length,
      sent: sentCount,
      failed: failedCount,
    };
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      "Campaign sending failed:",
      error.message
    );

    // Perform the side effect or state update expressed on the following line.
    campaign.status = "failed";

    // Perform the side effect or state update expressed on the following line.
    await campaign.save().catch(() => {});

    // Stop the current operation by raising the value of error.
    throw error;
  }
};
