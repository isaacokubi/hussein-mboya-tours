/**
 * Purpose: Staff Profile database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/StaffProfile.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
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

// Declare emergencyContactSchema for use by the surrounding module or function.
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

// Declare staffProfileSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
staffProfileSchema.index({
  profileCompleted: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantStaffProfileSchema for use by the surrounding module or function.
const tenantStaffProfileSchema = staffProfileSchema.plugin(tenantPlugin);
// Declare StaffProfile for use by the surrounding module or function.
const StaffProfile = mongoose.models.StaffProfile || mongoose.model("StaffProfile", tenantStaffProfileSchema);








export default StaffProfile;
