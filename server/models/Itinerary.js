// server/models/Itinerary.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| ACTIVITY SCHEMA
|--------------------------------------------------------------------------
*/

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

itinerarySchema.virtual("totalDays").get(function () {
  return this.days.length;
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


itinerarySchema.index({
  status: 1,
});

itinerarySchema.index({
  createdBy: 1,
});

itinerarySchema.index({
  isDeleted: 1,
});

itinerarySchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantItinerarySchema = itinerarySchema.plugin(tenantPlugin);
const Itinerary = mongoose.models.Itinerary || mongoose.model("Itinerary", tenantItinerarySchema);








export default Itinerary;