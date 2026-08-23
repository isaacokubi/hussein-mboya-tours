// server/models/StaffProfile.js

import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| STAFF PROFILE SCHEMA
|--------------------------------------------------------------------------
|
| Additional profile information for staff members.
| Authentication and core employment details remain in User and Staff.
|
|--------------------------------------------------------------------------
*/

const emergencyContactSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },

    relationship: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const staffProfileSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | LINKED USER
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
    | LINKED STAFF RECORD
    |--------------------------------------------------------------------------
    */

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERSONAL DETAILS
    |--------------------------------------------------------------------------
    */

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "Kenya",
      trim: true,
    },

    emergencyContact: emergencyContactSchema,

    /*
    |--------------------------------------------------------------------------
    | PROFESSIONAL DETAILS
    |--------------------------------------------------------------------------
    */

    education: [
      {
        type: String,
        trim: true,
      },
    ],

    certifications: [
      {
        type: String,
        trim: true,
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | DOCUMENTS
    |--------------------------------------------------------------------------
    */

    documents: [
      {
        name: String,
        url: String,
        publicId: String,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | SOCIAL LINKS
    |--------------------------------------------------------------------------
    */

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
      },

      facebook: {
        type: String,
        default: "",
      },

      instagram: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | PROFILE STATUS
    |--------------------------------------------------------------------------
    */

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

staffProfileSchema.index({
  profileCompleted: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const StaffProfile =
  mongoose.models.StaffProfile ||
  mongoose.model("StaffProfile", staffProfileSchema);








staffProfileSchema.plugin(tenantIsolationPlugin);
export default StaffProfile;
