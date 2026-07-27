import {
  getRevenueAnalytics,
  getBookingAnalytics,
  getPopularTours
} from "../services/analyticsService.js";



/**
|--------------------------------------------------------------------------
| TOUR MANAGER DASHBOARD ANALYTICS
|--------------------------------------------------------------------------
*/

export const dashboardAnalytics = async (req, res, next) => {

  try {


    const revenue = await getRevenueAnalytics();



    const bookings = await getBookingAnalytics();



    const popularTours = await getPopularTours();




    res.status(200).json({

      success: true,

      data: {

        revenue,

        bookings,

        popularTours

      }

    });


  } catch (error) {


    next(error);


  }


};