/**
 * Purpose: User Preference database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/UserPreference.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| BUDGET RANGE SCHEMA
|--------------------------------------------------------------------------
*/

// Declare budgetRangeSchema for use by the surrounding module or function.
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

// Declare userPreferenceSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
userPreferenceSchema.index({
  preferredCategories: 1,
});

// Perform the side effect or state update expressed on the following line.
userPreferenceSchema.index({
  preferredCountries: 1,
});

// Perform the side effect or state update expressed on the following line.
userPreferenceSchema.index({
  receivePromotions: 1,
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
userPreferenceSchema.methods.addInterest = async function (interest) {
  // Check the condition (!this.interests.includes(interest)) and run the matching branch.
  if (!this.interests.includes(interest)) {
    // Perform the side effect or state update expressed on the following line.
    this.interests.push(interest);
    // Perform the side effect or state update expressed on the following line.
    await this.save();
  }

  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
userPreferenceSchema.methods.removeInterest = async function (interest) {
  // Perform the side effect or state update expressed on the following line.
  this.interests = this.interests.filter(
    (item) => item !== interest,
  );

  // Perform the side effect or state update expressed on the following line.
  await this.save();

  // Return the expression shown below to the caller.
  return this;
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare UserPreference for use by the surrounding module or function.
const UserPreference =
  mongoose.models.UserPreference ||
  mongoose.model("UserPreference", userPreferenceSchema.plugin(tenantPlugin));








export default UserPreference;
