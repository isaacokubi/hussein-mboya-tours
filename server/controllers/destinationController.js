import Destination from "../models/Destination.js";


/*
|--------------------------------------------------------------------------
| GET ALL DESTINATIONS
|--------------------------------------------------------------------------
| Used by:
| /destinations page
|
| Returns all available destinations
|--------------------------------------------------------------------------
*/

export const getDestinations = async (req, res, next) => {
  try {

    const destinations = await Destination.find()
      .sort({
        createdAt: -1,
      });


    res.status(200).json(destinations);


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
| /destinations/maasai-mara
|--------------------------------------------------------------------------
*/

export const getDestination = async (req, res, next) => {
  try {


    const destination = await Destination.findOne({
      slug: req.params.slug,
    });



    if (!destination) {

      return res.status(404).json({

        success: false,

        message: "Destination not found",

      });

    }



    res.status(200).json(destination);



  } catch (error) {

    next(error);

  }
};