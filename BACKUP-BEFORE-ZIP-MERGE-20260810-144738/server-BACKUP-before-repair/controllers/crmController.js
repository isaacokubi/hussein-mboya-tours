import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getCRMStats = async (req, res) => {
  try {
    const [
      customers,
      bookings,
      users
    ] = await Promise.all([
      Customer.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      customers,
      bookings,
      users
    });
  } catch (error) {
    console.error("CRM Stats Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



/*
 Auto completed fallback handlers
*/

export const healthCheck = async(req,res)=>{
    res.json({
        success:true,
        message:"Module operational"
    });
};

