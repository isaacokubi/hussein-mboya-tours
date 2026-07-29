import Destination from "../models/Destination.js";

export const createDestination = async (req, res, next) => {
  try {
    const images = req.files.map((file) => file.path);

    const destination = await Destination.create({
      ...req.body,

      images,
    });

    res.status(201).json(destination);
  } catch (error) {
    next(error);
  }
};

export const getAdminDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find();

    res.json(destinations);
  } catch (error) {
    next(error);
  }
};

export const deleteDestination = async (req, res, next) => {
  try {
    await Destination.findByIdAndDelete(req.params.id);

    res.json({
      message: "Destination deleted",
    });
  } catch (error) {
    next(error);
  }
};
