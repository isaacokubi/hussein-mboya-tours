import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";



export const getAIRevenueAdvice = async (
  req,
  res,
  next
)=>{

  try {


    const [
      totalBookings,
      revenue,
      tours,
      topTours
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


      Tour.countDocuments(),



      Booking.aggregate([

        {
          $group:{
            _id:"$tour",
            bookings:{
              $sum:1
            }
          }
        },

        {
          $sort:{
            bookings:-1
          }
        },

        {
          $limit:5
        }

      ])

    ]);



    const totalRevenue =
      revenue[0]?.total || 0;

    const totalTours = tours;



    const recommendations=[];



    if(totalBookings < 20){

      recommendations.push(
        "Increase marketing campaigns because booking volume is currently low."
      );

    }


    if(totalRevenue > 0){

      recommendations.push(
        "Create premium packages to increase average booking value."
      );

    }


    if(topTours.length){

      recommendations.push(
        "Focus advertising budget on your highest performing tours."
      );

    }


    recommendations.push(
      "Create seasonal promotions for destinations with lower demand."
    );



    res.json({

      success:true,

      data:{

        metrics:{

          totalBookings,

          totalRevenue,

          totalTours:tours

        },

        recommendations

      }

    });


  }catch(error){

    next(error);

  }

};
