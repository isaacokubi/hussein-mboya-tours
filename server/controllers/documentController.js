import Booking from "../models/Booking.js";

export const uploadDocument = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  booking.documents.push(req.file.path);

  await booking.save();

  res.json({
    message: "Document uploaded",
  });
};
