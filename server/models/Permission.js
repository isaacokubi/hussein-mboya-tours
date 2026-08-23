// server/models/Permission.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

import { tenantPlugin } from "../tenancy/tenantPlugin.js";
/*
|--------------------------------------------------------------------------
| PERMISSION SCHEMA
|--------------------------------------------------------------------------
|
| Examples:
|
| bookings.view
| bookings.create
| bookings.update
| bookings.delete
|
| tours.assign
| vehicles.manage
| reports.view
|
|--------------------------------------------------------------------------
*/

const permissionSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | UNIQUE PERMISSION NAME
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | DISPLAY LABEL
    |--------------------------------------------------------------------------
    */

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | MODULE
    |--------------------------------------------------------------------------
    */

    module: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    /*
    |--------------------------------------------------------------------------
    | FRONTEND ROUTE
    |--------------------------------------------------------------------------
    */

    path: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | MENU ICON
    |--------------------------------------------------------------------------
    */

    icon: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    category: {
      type: String,
      enum: [
        "dashboard",
        "booking",
        "tour",
        "vehicle",
        "staff",
        "customer",
        "agent",
        "payment",
        "report",
        "user",
        "role",
        "system",
        "other",
      ],
      default: "other",
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    isActive: {
      type: Boolean,
      default: true,
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

permissionSchema.index({
  module: 1,
  name: 1,
});

permissionSchema.index({
  category: 1,
});

permissionSchema.index({
  isActive: 1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

permissionSchema.virtual("displayName").get(function () {
  return this.label || this.name;
});

/*
|--------------------------------------------------------------------------
| PRE SAVE
|--------------------------------------------------------------------------
*/

permissionSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.trim().toLowerCase();
  }

  if (this.module) {
    this.module = this.module.trim().toLowerCase();
  }

  next();
});

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

permissionSchema.statics.getByModule = function (module) {
  return this.find({
    module: module.toLowerCase(),
    isActive: true,
  }).sort({
    name: 1,
  });
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

tenantPlugin(permissionSchema);


const Permission =
  mongoose.models.Permission ||
  mongoose.model("Permission", permissionSchema);








export default Permission;
