/**
 * Purpose: crm Controller HTTP controller. Main declarations: getCRMStats, healthCheck.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";

// Declare getCRMStats for use by the surrounding module or function.
export const getCRMStats = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare [ customers, bookings, users ] for use by the surrounding module or function.
    const [
      customers,
      bookings,
      users
    ] = await Promise.all([
      Customer.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments()
    ]);

    // Perform the side effect or state update expressed on the following line.
    res.json({
      success: true,
      customers,
      bookings,
      users
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("CRM Stats Error:", error);

    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({
      success: false,
      message: publicErrorMessage(error)
    });
  }
};



/*
 Auto completed fallback handlers
*/

// Declare healthCheck for use by the surrounding module or function.
export const healthCheck = async(req,res)=>{
    // Perform the side effect or state update expressed on the following line.
    res.json({
        success:true,
        message:"Module operational"
    });
};
