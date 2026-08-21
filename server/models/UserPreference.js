// server/models/UserPreference.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| BUDGET RANGE SCHEMA
|--------------------------------------------------------------------------
*/

const budgetRangeSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    min: {
      type: Number,
      default: 0,
      min: 0,
    },

    max: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| USER PREFERENCE SCHEMA
|--------------------------------------------------------------------------
*/

const userPreferenceSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | INTERESTS
    |--------------------------------------------------------------------------
    */

    interests: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | DESTINATIONS
    |--------------------------------------------------------------------------
    */

    preferredCountries: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredDestinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | TOUR CATEGORIES
    |--------------------------------------------------------------------------
    */

    preferredCategories: [
      {
        type: String,
        enum: [
          "Safari",
          "Beach",
          "Adventure",
          "Cultural",
          "Luxury",
          "Mountain",
          "City Tour",
          "Wildlife",
          "Family",
          "Honeymoon",
        ],
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | TRAVEL STYLE
    |--------------------------------------------------------------------------
    */

    travelStyle: [
      {
        type: String,
        enum: [
          "Solo",
          "Couple",
          "Family",
          "Group",
          "Business",
          "Luxury",
          "Budget",
          "Backpacking",
        ],
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | BUDGET
    |--------------------------------------------------------------------------
    */

    budgetRange: budgetRangeSchema,

    /*
    |--------------------------------------------------------------------------
    | ACCOMMODATION
    |--------------------------------------------------------------------------
    */

    preferredAccommodation: {
      type: String,
      enum: [
        "Budget",
        "Standard",
        "Luxury",
        "Camping",
        "Resort",
      ],
      default: "Standard",
    },

    /*
    |--------------------------------------------------------------------------
    | TRANSPORT
    |--------------------------------------------------------------------------
    */

    preferredTransport: {
      type: String,
      enum: [
        "Road",
        "Air",
        "Rail",
        "Any",
      ],
      default: "Any",
    },

    /*
    |--------------------------------------------------------------------------
    | LANGUAGE
    |--------------------------------------------------------------------------
    */

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | MARKETING
    |--------------------------------------------------------------------------
    */

    receivePromotions: {
      type: Boolean,
      default: true,
    },

    receiveNewsletters: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | LAST UPDATED
    |--------------------------------------------------------------------------
    */

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

userPreferenceSchema.index({
  preferredCategories: 1,
});

userPreferenceSchema.index({
  preferredCountries: 1,
});

userPreferenceSchema.index({
  receivePromotions: 1,
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

userPreferenceSchema.methods.addInterest = async function (interest) {
  if (!this.interests.includes(interest)) {
    this.interests.push(interest);
    await this.save();
  }

  return this;
};

userPreferenceSchema.methods.removeInterest = async function (interest) {
  this.interests = this.interests.filter(
    (item) => item !== interest,
  );

  await this.save();

  return this;
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const UserPreference =
  mongoose.models.UserPreference ||
  mongoose.model(
    "UserPreference",
    userPreferenceSchema,
  );








export default UserPreference;