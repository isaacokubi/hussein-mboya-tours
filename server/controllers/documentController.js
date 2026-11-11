/**
 * Purpose: document Controller HTTP controller. Main declarations: isValidId, uploadDocument.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// server/controllers/documentController.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/*
|--------------------------------------------------------------------------
| UPLOAD BOOKING DOCUMENT
|--------------------------------------------------------------------------
|
| POST /api/bookings/:id/documents
|--------------------------------------------------------------------------
*/

// Declare uploadDocument for use by the surrounding module or function.
export const uploadDocument = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate Booking ID
    |--------------------------------------------------------------------------
    */

    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
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

    // Check the condition (!req.file) and run the matching branch.
    if (!req.file) {
      // Return the result of res.status(400).json() to the caller.
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

    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    // Check the condition (!booking) and run the matching branch.
    if (!booking) {
      // Return the result of res.status(404).json() to the caller.
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

    // Check the condition (!Array.isArray(booking.documents)) and run the matching branch.
    if (!Array.isArray(booking.documents)) {
      // Perform the side effect or state update expressed on the following line.
      booking.documents = [];
    }

    /*
    |--------------------------------------------------------------------------
    | Save Document
    |--------------------------------------------------------------------------
    */

    // Perform the side effect or state update expressed on the following line.
    booking.documents.push({
      url: req.file.path,
      publicId: req.file.filename || "",
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    });

    // Perform the side effect or state update expressed on the following line.
    await booking.save();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Document uploaded successfully.",
      data: booking.documents,
    });

  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
