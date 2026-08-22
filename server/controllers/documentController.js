import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// server/controllers/documentController.js

import mongoose from "mongoose";
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| UPLOAD BOOKING DOCUMENT
|--------------------------------------------------------------------------
|
| POST /api/bookings/:id/documents
|--------------------------------------------------------------------------
*/

export const uploadDocument = async (req, res, next) => {
  requireTenantId();
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Booking ID
    |--------------------------------------------------------------------------
    */

    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Uploaded File
    |--------------------------------------------------------------------------
    */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Booking
    |--------------------------------------------------------------------------
    */

    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Initialize Documents Array
    |--------------------------------------------------------------------------
    */

    if (!Array.isArray(booking.documents)) {
      booking.documents = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Save Document
    |--------------------------------------------------------------------------
    */

    booking.documents.push({
      url: req.file.path,
      publicId: req.file.filename || "",
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    });

    await booking.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      data: booking.documents,
    });

  } catch (error) {
    next(error);
  }
};