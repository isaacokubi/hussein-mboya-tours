/**
 * Purpose: historical Customer Metrics business-logic service. Main declarations: getHistoricalCustomerCount.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { requireTenantId } from "../tenancy/context.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

/**
 * Returns the number of distinct customers represented by historical bookings.
 * This intentionally does not depend on the User collection, so deleting or
 * deactivating a customer account cannot erase historical dashboard metrics.
 */
// Define getHistoricalCustomerCount; its parameters and body implement this operation.
export async function getHistoricalCustomerCount({ includeDeletedBookings = false } = {}) {
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId(String(requireTenantId()));
  // Declare match for use by the surrounding module or function.
  const match = {
    tenantId,
    ...(includeDeletedBookings ? {} : { isDeleted: { $ne: true } }),
  };

  // Declare result for use by the surrounding module or function.
  const result = await Booking.aggregate([
    { $match: match },
    {
      $project: {
        customerKey: {
          $ifNull: [
            "$user",
            {
              $ifNull: [
                "$customerSnapshot.email",
                {
                  $ifNull: [
                    "$customerSnapshot.phone",
                    "$customerSnapshot.name",
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    { $match: { customerKey: { $nin: [null, ""] } } },
    { $group: { _id: "$customerKey" } },
    { $count: "total" },
  ]);

  // Return the expression shown below to the caller.
  return result[0]?.total || 0;
}

export default getHistoricalCustomerCount;
