import Destination from "../models/Destination.js";


/*
|--------------------------------------------------------------------------
| GET ALL ACTIVE DESTINATIONS
|--------------------------------------------------------------------------
| Used by:
| - Public destinations page
| - Admin destination selector
|
| Endpoint:
| GET /api/destinations
|--------------------------------------------------------------------------
*/

export const getDestinations = async (req, res, next) => {

  try {

    const destinations = await Destination.find({

      status: "active",

    })
    .sort({

      createdAt: -1,

    });


    res.status(200).json({

      success: true,

      count: destinations.length,

      destinations,

    });


  } catch (error) {

    next(error);

  }

};



/*
|--------------------------------------------------------------------------
| GET SINGLE DESTINATION
|--------------------------------------------------------------------------
| Used by:
| /destinations/:slug
|
| Example:
| GET /api/destinations/maasai-mara
|--------------------------------------------------------------------------
*/

export const getDestination = async (req, res, next) => {

  try {

    const destination = await Destination.findOne({

      slug: req.params.slug,

      status: "active",

    });


    if (!destination) {

      return res.status(404).json({

        success: false,

        message: "Destination not found",

      });

    }


    res.status(200).json({

      success: true,

      destination,

    });


  } catch (error) {

    next(error);

  }

};