import mongoose from "mongoose";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Destination from "../models/Destination.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";



export const getDashboard = async (req, res) => {

    try {


        /*
        |--------------------------------------------------------------------------
        | BASIC COUNTS
        |--------------------------------------------------------------------------
        */


        const users =
            await User.countDocuments();



        const tours =
            await Tour.countDocuments();



        const bookings =
            await Booking.countDocuments();



        const destinations =
            await Destination.countDocuments();






        /*
        |--------------------------------------------------------------------------
        | REVENUE FROM PAYMENTS
        |--------------------------------------------------------------------------
        */


        let revenue = 0;



        const paymentStats =
await Payment.aggregate([
{
$group:{
_id:"$status",
count:{
$sum:1
},
amount:{
$sum:"$amount"
}
}
}
]);


const successfulStatuses = [
    "completed",
    "paid",
    "success",
    "Completed",
    "Success"
];

const completedPayments =
paymentStats
.filter(
p => successfulStatuses.includes(p._id)
)
.reduce(
(acc,p)=>({
count: acc.count + p.count,
amount: acc.amount + p.amount
}),
{
count:0,
amount:0
}
);


const pendingPayments =
    paymentStats.find(
        p => p._id === "pending"
    ) || {
        count:0,
        amount:0
    };


const failedPayments =
    paymentStats.find(
        p => p._id === "failed"
    ) || {
        count:0,
        amount:0
    };


const paymentRevenue = {
    total: completedPayments.amount,
    completed: completedPayments.amount,
    count: completedPayments.count,
    pending: pendingPayments.count,
    failed: failedPayments.count
};



        revenue =
            paymentRevenue.total || 0;








        /*
        |--------------------------------------------------------------------------
        | FALLBACK REVENUE FROM BOOKINGS
        |--------------------------------------------------------------------------
        */


        if(revenue === 0){


            const bookingRevenue =
                await Booking.aggregate([

                    {
                        $match:{
                            paymentStatus:{
                                $in:[
                                    "paid",
                                    "partial",
                                    "completed"
                                ]
                            }
                        }
                    },


                    {

                        $group:{

                            _id:null,


                            total:{

                                $sum:{
                                    $ifNull:[
                                        "$amount",
                                        "$totalAmount"
                                    ]
                                }

                            }

                        }

                    }


                ]);



            revenue =
                bookingRevenue[0]?.total || 0;


        }









        /*
        |--------------------------------------------------------------------------
        | PAYMENT STATUS
        |--------------------------------------------------------------------------
        */


        const payments = {


            paid:

                await Payment.countDocuments({

                    status:{
                        $in:[
                            "completed",
                            "paid",
                            "success"
                        ]
                    }

                }),



            pending:

                await Payment.countDocuments({

                    status:"pending"

                }),



            failed:

                await Payment.countDocuments({

                    status:"failed"

                })


        };









        /*
        |--------------------------------------------------------------------------
        | BOOKING STATUS
        |--------------------------------------------------------------------------
        */


        
          /*
          |--------------------------------------------------------------------------
          | MONTHLY REVENUE
          |--------------------------------------------------------------------------
          */

          const monthlyRevenue =
              await Booking.aggregate([
                  {
                      $group:{
                          _id:{
                              month:{
                                  $month:"$createdAt"
                              },
                              year:{
                                  $year:"$createdAt"
                              }
                          },
                          amount:{
                              $sum:"$amount"
                          }
                      }
                  },
                  {
                      $sort:{
                          "_id.year":1,
                          "_id.month":1
                      }
                  }
              ]);


          const formattedMonthlyRevenue =
              monthlyRevenue.map(item => ({
                  month:
                      `${item._id.month}/${item._id.year}`,
                  amount:
                      item.amount || 0
              }));


const bookingStatus =

            await Booking.aggregate([


                {

                    $group:{


                          _id:"$status",


                        count:{

                            $sum:1

                        }


                    }

                }


            ]);









        /*
        |--------------------------------------------------------------------------
        | POPULAR TOURS
        |--------------------------------------------------------------------------
        */


        const popularTours =

            await Booking.aggregate([


                {


                    $group:{


                        _id:"$tour",



                        totalBookings:{

                            $sum:1

                        },



                        revenue:{


                            $sum:{

                                $ifNull:[

                                    "$amount",

                                    "$totalAmount"

                                ]

                            }


                        }


                    }


                },



                {


                    $lookup:{


                        from:"tours",


                        localField:"_id",


                        foreignField:"_id",


                        as:"tour"


                    }


                },



                {


                    $unwind:"$tour"


                },



                {


                    $project:{


                        title:
                            "$tour.title",


                        totalBookings:1,


                        revenue:1


                    }


                },



                {


                    $sort:{


                        totalBookings:-1


                    }


                },



                {


                    $limit:5


                }


            ]);









        /*
        |--------------------------------------------------------------------------
        | RECENT BOOKINGS
        |--------------------------------------------------------------------------
        */


        const recentBookings =
await Booking.find()
.sort({
createdAt:-1
})
.limit(5)
.populate("tour","title")
.populate("customer","name email");









        /*
        |--------------------------------------------------------------------------
        | NORMALIZE PAYMENT STATUS
        |--------------------------------------------------------------------------
        */


        const normalizedRecentBookings =

            recentBookings.map(
                
                (booking)=>({

                    ...booking,


                    paymentStatus:

                        typeof booking.paymentStatus === "object"

                        ?

                        (

                            booking.paymentStatus.paymentStatus ||

                            booking.paymentStatus.status ||

                            "pending"

                        )

                        :

                        booking.paymentStatus || "pending"


                })

            );









        /*
        |--------------------------------------------------------------------------
        | USER GROUPS
        |--------------------------------------------------------------------------
        */


        const customers =

            await User.countDocuments({

                role:"customer"

            });







        const agents =

            await User.find({

                role:"agent"

            })

            .select(
                "name email"
            );








        const guides =

            await User.find({

                role:{

                    $in:[

                        "tour_guide",
                        "tourguide",
                        "Tour Guide"

                    ]

                }

            })

            .select(
                "name email"
            );









        /*
        |--------------------------------------------------------------------------
        | NOTIFICATIONS
        |--------------------------------------------------------------------------
        */


        const notifications =

            await Notification.find()

                .sort({

                    createdAt:-1

                })

                .limit(5);









        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */


        res.status(200).json({


            success:true,


            data:{


                users,


                tours,


                bookings,


                destinations,



                revenue,

                  monthlyRevenue:
                      formattedMonthlyRevenue,




                paymentStats:{


                    completed:
                        paymentRevenue.completed,


                    pending:
                        paymentRevenue.pending,


                    failed:
                        paymentRevenue.failed


                },




                statusData: bookingStatus,




                popularTours,




                recentBookings:
                    normalizedRecentBookings,




                notifications,




                userStats:{
                    customers,
                    agents:
                        agents.length,
                    guides:
                        guides.length
                },


                agents:
                    agents.length,


                guides:
                    guides.length




            }



        });



    }



    catch(error){


        console.error(
            "Dashboard Error:",
            error
        );



        res.status(500).json({


            success:false,


            message:error.message


        });


    }


};
