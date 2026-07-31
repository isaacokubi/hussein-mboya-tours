// server/controllers/crmController.js

import CustomerProfile from "../models/CustomerProfile.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER CRM DASHBOARD STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/crm/stats
|--------------------------------------------------------------------------
*/

export const getCRMStats = async (req, res, next) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Customer Statistics
    |--------------------------------------------------------------------------
    */

    const [
      totalCustomers,
      vipCustomers,
      corporateCustomers,
      regularCustomers,
      activeCustomers,
      inactiveCustomers,
    ] = await Promise.all([
      CustomerProfile.countDocuments(),

      CustomerProfile.countDocuments({
        customerType: "vip",
      }),

      CustomerProfile.countDocuments({
        customerType: "corporate",
      }),

      CustomerProfile.countDocuments({
        customerType: "regular",
      }),

      CustomerProfile.countDocuments({
        status: "active",
      }),

      CustomerProfile.countDocuments({
        status: "inactive",
      }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      data: {
        totalCustomers,

        customerTypes: {
          regular: regularCustomers,
          vip: vipCustomers,
          corporate: corporateCustomers,
        },

        accountStatus: {
          active: activeCustomers,
          inactive: inactiveCustomers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};