import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import User from "../models/User.js";

import { sendEmail } from "./emailService.js";

/*
|--------------------------------------------------------------------------
| SEND EMAIL CAMPAIGN
|--------------------------------------------------------------------------
*/

export const sendCampaign = async (campaign) => {
  requireTenantId();
  try {
    /*
    |--------------------------------------------------------------------------
    | BUILD AUDIENCE FILTER
    |--------------------------------------------------------------------------
    */

    const filter = {
      legacyRole: "customer",
      isActive: true,
    };

    if (campaign.audience === "vip") {
      filter.customerType = "vip";
    }

    const users = await User.find(filter).select(
      "email name"
    );

    let sentCount = 0;
    let failedCount = 0;

    /*
    |--------------------------------------------------------------------------
    | SEND EMAILS
    |--------------------------------------------------------------------------
    */

    for (const user of users) {
      try {
        await sendEmail({
          to: user.email,

          subject: campaign.subject,

          html: campaign.message,
        });

        sentCount++;
      } catch (error) {
        failedCount++;

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

    campaign.sentCount = sentCount;

    campaign.failedCount = failedCount;

    campaign.status =
      failedCount === users.length
        ? "failed"
        : "sent";

    campaign.sentAt = new Date();

    await campaign.save();

    return {
      success: true,
      totalRecipients: users.length,
      sent: sentCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error(
      "Campaign sending failed:",
      error.message
    );

    campaign.status = "failed";

    await campaign.save().catch(() => {});

    throw error;
  }
};
