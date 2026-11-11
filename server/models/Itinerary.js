/**
 * Purpose: Itinerary database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Itinerary.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| ACTIVITY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare activitySchema for use by the surrounding module or function.
const activitySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    coordinates: {
      latitude: Number,
      longitude: Number,
    },

    meal: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack", "none"],
      default: "none",
    },

    accommodation: {
      type: String,
      default: "",
      trim: true,
    },

    transport: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| DAY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare daySchema for use by the surrounding module or function.
const daySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },

    activities: [activitySchema],
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| ITINERARY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare itinerarySchema for use by the surrounding module or function.
const itinerarySchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
      unique: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DAYS
    |--------------------------------------------------------------------------
    */

    days: [daySchema],

    /*
    |--------------------------------------------------------------------------
    | OVERVIEW
    |--------------------------------------------------------------------------
    */

    overview: {
      type: String,
      default: "",
      trim: true,
    },

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    included: [
      {
        type: String,
        trim: true,
      },
    ],

    excluded: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
itinerarySchema.virtual("totalDays").get(function () {
  // Return the length value to the caller.
  return this.days.length;
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


// Perform the side effect or state update expressed on the following line.
itinerarySchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
itinerarySchema.index({
  createdBy: 1,
});

// Perform the side effect or state update expressed on the following line.
itinerarySchema.index({
  isDeleted: 1,
});

// Perform the side effect or state update expressed on the following line.
itinerarySchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantItinerarySchema for use by the surrounding module or function.
const tenantItinerarySchema = itinerarySchema.plugin(tenantPlugin);
// Declare Itinerary for use by the surrounding module or function.
const Itinerary = mongoose.models.Itinerary || mongoose.model("Itinerary", tenantItinerarySchema);








export default Itinerary;
