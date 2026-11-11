/**
 * Purpose: customer Analytics Service business-logic service. Main declarations: getCustomerGrowth.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER GROWTH ANALYTICS
|--------------------------------------------------------------------------
|
| Returns monthly customer registrations.
|
*/

// Declare getCustomerGrowth for use by the surrounding module or function.
export const getCustomerGrowth = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Declare growth for use by the surrounding module or function.
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

  // Return the value of growth to the caller.
  return growth;
};
