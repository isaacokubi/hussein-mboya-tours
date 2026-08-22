import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Review from "../models/Review.js";
import { generateTravelAdvice } from "../services/aiService.js";


export const getAIDashboard = async (req,res,next)=>{
  requireTenantId();
  try {

    const [
      bookings,
      revenue,
      pendingPayments,
      tours,
      customers,
      vehicles,
      reviews
    ] = await Promise.all([

      Booking.countDocuments(),

      Payment.aggregate([
        {
          $match:{
            status:"completed"
          }
        },
        {
          $group:{
            _id:null,
            total:{
              $sum:"$amount"
            }
          }
        }
      ]),

      Booking.countDocuments({
        paymentStatus:"pending"
      }),

      Tour.countDocuments(),

      User.countDocuments({
        role:"customer"
      }),

      Vehicle.countDocuments(),

      Review.countDocuments()

    ]);


    res.json({
      success:true,
      data:{
        bookings,
        revenue:
          revenue[0]?.total || 0,
        pendingPayments,
        tours,
        customers,
        vehicles,
        reviews
      }
    });


  } catch(error){
    next(error);
  }
};



export const adminAIQuery = async(req,res,next)=>{

  try{

    const {
      message
    } = req.body;


    const [
      bookings,
      payments,
      tours,
      vehicles,
      reviews
    ] = await Promise.all([

      Booking.countDocuments(),

      Payment.countDocuments(),

      Tour.countDocuments(),

      Vehicle.countDocuments(),

      Review.countDocuments()

    ]);


    const context = `

You are an AI operations assistant for a tour company.

Business data:

Bookings:
${bookings}

Payments:
${payments}

Tours:
${tours}

Vehicles:
${vehicles}

Reviews:
${reviews}

Admin question:
${message}

Give practical business advice.

`;


    const reply =
      await generateTravelAdvice(
        context,
        req.user
      );


    res.json({

      success:true,

      data:{
        reply
      }

    });


  }catch(error){

    next(error);

  }

};
