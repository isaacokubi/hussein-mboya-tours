import mongoose from "mongoose";
import slugify from "slugify";

/*
|--------------------------------------------------------------------------
| ITINERARY SCHEMA
|--------------------------------------------------------------------------
*/

const itinerarySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    day: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    meals: [String],

    accommodation: {
      type: String,
      default: "",
    },

    activities: [String],
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| AVAILABILITY SCHEMA
|--------------------------------------------------------------------------
*/

const availabilitySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    totalSlots: {
      type: Number,
      default: 20,
      min: 0,
    },

    bookedSlots: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| SEO SCHEMA
|--------------------------------------------------------------------------
*/

const seoSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    keywords: [String],
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

const imageSchema = new mongoose.Schema(
  {
    url: String,

    publicId: String,
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| PRICING RULE SCHEMA
|--------------------------------------------------------------------------
*/

const pricingRuleSchema = new mongoose.Schema(
  {
    name: String,

    minTravelers: Number,

    maxTravelers: Number,

    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| TOUR SCHEMA
|--------------------------------------------------------------------------
*/

const tourSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 250,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | CATEGORY
    |--------------------------------------------------------------------------
    */

    category: {
      type: String,
      enum: [
        "Safari",
        "Beach",
        "Adventure",
        "Cultural",
        "Luxury",
        "Hiking",
        "Family",
        "Wildlife",
      ],
      default: "Safari",
    },

    /*
    |--------------------------------------------------------------------------
    | DESTINATION
    |--------------------------------------------------------------------------
    */

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    meetingPoint: {
      type: String,
      default: "",
      trim: true,
    },

    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [36.8219, -1.2921],
      },
    },

    /*
    |--------------------------------------------------------------------------
    | DURATION
    |--------------------------------------------------------------------------
    */

    duration: {
      type: String,
      default: "",
    },

    durationDetails: {
      days: {
        type: Number,
        default: 1,
      },

      nights: {
        type: Number,
        default: 0,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR DATES
    |--------------------------------------------------------------------------
    */

    date: {
      type: Date,
      required: true,
    },

    startDate: Date,

    endDate: Date,

    /*
    |--------------------------------------------------------------------------
    | CAPACITY
    |--------------------------------------------------------------------------
    */

    capacity: {
      type: Number,
      default: 20,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    agentPrice: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountPrice: {
      type: Number,
      default: null,
    },

    pricingRules: [pricingRuleSchema],    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
    */

    featuredImage: imageSchema,

    gallery: [imageSchema],

    video: {
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
    | TOUR CONTENT
    |--------------------------------------------------------------------------
    */

    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],

    exclusions: [
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

    minimumAge: {
      type: Number,
      default: 0,
    },

    maximumAge: {
      type: Number,
      default: 99,
    },

    difficulty: {
      type: String,
      enum: [
        "easy",
        "moderate",
        "hard"
      ],
      default: "easy",
    },

    /*
    |--------------------------------------------------------------------------
    | ITINERARY
    |--------------------------------------------------------------------------
    */

    itinerary: [itinerarySchema],

    /*
    |--------------------------------------------------------------------------
    | AVAILABILITY
    |--------------------------------------------------------------------------
    */

    availability: [availabilitySchema],

    availabilitySettings: {

      totalSlots: {
        type: Number,
        default: 20,
      },

      bookedSlots: {
        type: Number,
        default: 0,
      },

      waitlistEnabled: {
        type: Boolean,
        default: false,
      },

    },

    /*
    |--------------------------------------------------------------------------
    | BOOKING RULES
    |--------------------------------------------------------------------------
    */

    depositRequired: {
      type: Number,
      default: 0,
    },

    cancellationPolicy: {
      type: String,
      default: "",
    },

    bookingDeadline: {
      type: Number,
      default: 1,
    },

    instantBooking: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    assignedGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    assignmentStatus: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "upcoming",
        "ongoing",
        "fully-booked",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },

    published: {
      type: Boolean,
      default: false,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    available: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REVIEWS
    |--------------------------------------------------------------------------
    */

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    wishlistCount: {
      type: Number,
      default: 0,
    },

    popularity: {
      type: Number,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    seo: seoSchema,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);/*
|--------------------------------------------------------------------------
| AUTO SLUG GENERATION
|--------------------------------------------------------------------------
*/

tourSchema.pre("validate", async function (next) {
  if (
    this.title &&
    (!this.slug || this.isModified("title"))
  ) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (
      await mongoose.models.Tour.findOne({
        slug,
        _id: { $ne: this._id },
      })
    ) {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    this.slug = slug;
  }

  next();
});

/*
|--------------------------------------------------------------------------
| NORMALIZE TOUR DATES
|--------------------------------------------------------------------------
*/

tourSchema.pre("validate", function (next) {
  const start = this.startDate || this.date;
  const days = Math.max(
    1,
    Number(this.durationDetails?.days || this.duration || 1)
  );

  if (start) {
    const startDate = new Date(start);
    if (!Number.isNaN(startDate.getTime())) {
      this.startDate = startDate;
      const calculatedEnd = new Date(startDate);
      calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
      const existingEnd = this.endDate ? new Date(this.endDate) : null;
      if (
        !existingEnd ||
        Number.isNaN(existingEnd.getTime()) ||
        (days > 1 && existingEnd.getTime() <= startDate.getTime())
      ) {
        this.endDate = calculatedEnd;
      }
    }
  }

  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

tourSchema.virtual("images").get(function () {
  const result = [];
  if (this.featuredImage?.url) result.push(this.featuredImage);
  if (Array.isArray(this.gallery)) result.push(...this.gallery);
  return result;
});

tourSchema.virtual("image").get(function () {
  return this.featuredImage?.url || this.gallery?.[0]?.url || "";
});

tourSchema.virtual("finalPrice").get(function () {
  if (
    this.discountPrice !== null &&
    this.discountPrice !== undefined
  ) {
    return this.discountPrice;
  }

  if (this.discount > 0) {
    return this.price - (this.price * this.discount) / 100;
  }

  return this.price;
});

tourSchema.virtual("remainingSlots").get(function () {
  return Math.max(
    0,
    this.availabilitySettings.totalSlots -
      this.availabilitySettings.bookedSlots
  );
});

tourSchema.virtual("isFullyBooked").get(function () {
  return this.remainingSlots <= 0;
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

tourSchema.methods.bookSlot = function (count = 1) {
  if (
    this.availabilitySettings.bookedSlots + count >
    this.availabilitySettings.totalSlots
  ) {
    throw new Error("Tour is fully booked.");
  }

  this.availabilitySettings.bookedSlots += count;

  if (
    this.availabilitySettings.bookedSlots >=
    this.availabilitySettings.totalSlots
  ) {
    this.status = "fully-booked";
    this.available = false;
  }

  return this.save();
};

tourSchema.methods.releaseSlot = function (count = 1) {
  this.availabilitySettings.bookedSlots = Math.max(
    0,
    this.availabilitySettings.bookedSlots - count
  );

  if (
    this.availabilitySettings.bookedSlots <
    this.availabilitySettings.totalSlots
  ) {
    if (this.status === "fully-booked") {
      this.status = "upcoming";
    }

    this.available = true;
  }

  return this.save();
};

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

tourSchema.statics.getFeatured = function () {
  return this.find({
    featured: true,
    available: true,
    isDeleted: false,
    published: true,
  });
};

tourSchema.statics.getActiveTours = function () {
  return this.find({
    available: true,
    isDeleted: false,
    published: true,
    status: {
      $in: ["scheduled", "upcoming", "ongoing"],
    },
  });
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



tourSchema.index({
  destination: 1,
  status: 1,
});

tourSchema.index({
  featured: 1,
  available: 1,
});

tourSchema.index({
  published: 1,
});

tourSchema.index({
  createdBy: 1,
});

tourSchema.index({
  category: 1,
});

tourSchema.index({
  country: 1,
});

tourSchema.index({
  price: 1,
});

tourSchema.index({
  averageRating: -1,
});

tourSchema.index({
  totalBookings: -1,
});

tourSchema.index({
  popularity: -1,
});

tourSchema.index({
  assignedGuide: 1,
});

tourSchema.index({
  assignedDriver: 1,
});

tourSchema.index({
  assignedVehicle: 1,
});

tourSchema.index({
  assignmentStatus: 1,
});

tourSchema.index({
  isDeleted: 1,
});

tourSchema.index({
  available: 1,
});

tourSchema.index({
  status: 1,
  date: 1,
});

tourSchema.index({
  title: "text",
  description: "text",
  location: "text",
  country: "text",
  category: "text",
  tags: "text",
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const Tour =
  mongoose.models.Tour ||
  mongoose.model("Tour", tourSchema);

export default Tour;