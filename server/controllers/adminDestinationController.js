import Destination from "../models/Destination.js";


/*
|--------------------------------------------------------------------------
| CREATE DESTINATION
|--------------------------------------------------------------------------
| Used by:
| - Admin destination management
|
| Endpoint:
| POST /api/admin/destinations
|--------------------------------------------------------------------------
*/

export const createDestination = async (req, res, next) => {
  try {

    const images = req.files
      ? req.files.map((file) => file.path)
      : [];

    const destination = await Destination.create({
      ...req.body,
      images,
    });

    res.status(201).json({
      success: true,
      destination,
    });

  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET ALL DESTINATIONS
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

    const destinations = await Destination.find()
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
| - Destination details page
|
| Endpoint:
| GET /api/destinations/:slug
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

    res.status(200).json({
      success: true,
      destination,
    });

  } catch (error) {
    next(error);
  }
};


/*
|--------------------------------------------------------------------------
| GET ALL DESTINATIONS (ADMIN)
|--------------------------------------------------------------------------
| Used by:
| - Admin destination management page
|
| Endpoint:
| GET /api/admin/destinations
|--------------------------------------------------------------------------
*/

export const getAdminDestinations = async (req, res, next) => {
  try {

    const destinations = await Destination.find()
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
| DELETE DESTINATION
|--------------------------------------------------------------------------
| Used by:
| - Admin destination management page
|
| Endpoint:
| DELETE /api/admin/destinations/:id
|--------------------------------------------------------------------------
*/

export const deleteDestination = async (req, res, next) => {
  try {

    const destination = await Destination.findByIdAndDelete(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination deleted",
    });

  } catch (error) {
    next(error);
  }
};