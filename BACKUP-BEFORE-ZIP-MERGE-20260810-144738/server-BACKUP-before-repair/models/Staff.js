// server/models/Staff.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| EMERGENCY CONTACT SCHEMA
|--------------------------------------------------------------------------
*/

const emergencyContactSchema = new mongoose.Schema(
  {
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

/*
|--------------------------------------------------------------------------
| STAFF SCHEMA
|--------------------------------------------------------------------------
*/

const staffSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | LINKED USER ACCOUNT
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERSONAL INFORMATION
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    nationalId: {
      type: String,
      default: "",
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | POSITION
    |--------------------------------------------------------------------------
    */

    position: {
      type: String,
      enum: [
        "admin",
        "tour_manager",
        "guide",
        "driver",
        "support",
      ],
      required: true,
    },

    // Legacy compatibility
    role: {
      type: String,
      enum: [
        "admin",
        "manager",
        "guide",
        "driver",
        "support",
      ],
      default: null,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PROFILE IMAGE
    |--------------------------------------------------------------------------
    */

    profileImage: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | DRIVER INFORMATION
    |--------------------------------------------------------------------------
    */

    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    licenseExpiry: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | SKILLS
    |--------------------------------------------------------------------------
    */

    languages: [
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

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | EMPLOYMENT
    |--------------------------------------------------------------------------
    */

    employeeNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    employmentType: {
      type: String,
      enum: [
        "full_time",
        "part_time",
        "contract",
        "temporary",
      ],
      default: "full_time",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    salary: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | AVAILABILITY
    |--------------------------------------------------------------------------
    */

    availability: {
      type: String,
      enum: [
        "available",
        "busy",
        "leave",
        "offline",
      ],
      default: "available",
    },

    assignedTours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | PERFORMANCE
    |--------------------------------------------------------------------------
    */

    completedTours: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY CONTACT
    |--------------------------------------------------------------------------
    */

    emergencyContact: emergencyContactSchema,

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "suspended",
      ],
      default: "active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AUDIT
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
| VIRTUALS
|--------------------------------------------------------------------------
*/

staffSchema.virtual("isDriver").get(function () {
  return this.position === "driver";
});

staffSchema.virtual("isGuide").get(function () {
  return this.position === "guide";
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

staffSchema.methods.assignTour = async function (tourId) {
  if (!this.assignedTours.includes(tourId)) {
    this.assignedTours.push(tourId);
  }

  this.availability = "busy";

  return this.save();
};

staffSchema.methods.releaseFromTour = async function (tourId) {
  this.assignedTours = this.assignedTours.filter(
    (id) => id.toString() !== tourId.toString()
  );

  if (this.assignedTours.length === 0) {
    this.availability = "available";
  }

  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



staffSchema.index({
  position: 1,
});

staffSchema.index({
  status: 1,
});

staffSchema.index({
  availability: 1,
});



staffSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Staff =
  mongoose.models.Staff ||
  mongoose.model("Staff", staffSchema);

export default Staff;