import { mergeTenantFilter } from "../tenancy/context.js";
import Booking from "../models/Booking.js";

/**
 * Returns the number of distinct customers represented by historical bookings.
 * This intentionally does not depend on the User collection, so deleting or
 * deactivating a customer account cannot erase historical dashboard metrics.
 */
export async function getHistoricalCustomerCount({ includeDeletedBookings = false } = {}) {
  const match = includeDeletedBookings ? {} : { isDeleted: { $ne: true } };

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

  return result[0]?.total || 0;
}

export default getHistoricalCustomerCount;
