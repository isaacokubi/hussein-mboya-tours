import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER GROWTH ANALYTICS
|--------------------------------------------------------------------------
|
| Returns monthly customer registrations.
|
*/

export const getCustomerGrowth = async () => {
  const growth = await User.aggregate([
    {
      $match: {
        legacyRole: "customer",
        isActive: true,
      },
    },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: "$createdAt",
          },
        },

        customers: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return growth;
};