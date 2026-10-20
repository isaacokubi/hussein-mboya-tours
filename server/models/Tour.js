// Mongoose defines the tour document schema and database model.
import mongoose from "mongoose";
// Attach tenant query/write isolation to each tour document.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Generate URL-friendly slugs from tour titles when saving tour records.
import slugify from "slugify";

const itinerarySchema = new mongoose.Schema({ tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, day: { type: Number, required: true, min: 1 }, title: { type: String, required: true, trim: true }, description: { type: String, required: true, trim: true }, meals: [String], accommodation: { type: String, default: "" }, activities: [String] }, { _id: false });
const availabilitySchema = new mongoose.Schema({ date: { type: Date, required: true }, totalSlots: { type: Number, default: 20, min: 0 }, bookedSlots: { type: Number, default: 0, min: 0 } }, { _id: false });
const seoSchema = new mongoose.Schema({ title: String, description: String, keywords: [String] }, { _id: false });
const imageSchema = new mongoose.Schema({ url: String, publicId: String }, { _id: false });
const pricingRuleSchema = new mongoose.Schema({ name: String, minTravelers: Number, maxTravelers: Number, discount: { type: Number, default: 0 } }, { _id: false });

const tourSchema = new mongoose.Schema({
  // Organization that owns the tour; used for tenant isolation.
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },

  // Public/internal tour title.
  title: { type: String, required: true, trim: true, maxlength: 150 },

  // Unique URL-friendly identifier used to open the tour page.
  slug: { type: String, unique: true, lowercase: true, trim: true },

  // Full tour description shown to customers.
  description: { type: String, required: true, trim: true },

  // Short summary used in cards and previews.
  shortDescription: { type: String, trim: true, maxlength: 250 },

  // Search and categorization labels associated with the tour.
  tags: [{ type: String, trim: true }],

  // Tour category, such as safari or adventure.
  category: { type: String, trim: true, maxlength: 80, default: "Safari" },

  // Destination record associated with the tour.
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },

  // Country where the tour operates.
  country: { type: String, required: true, trim: true },

  // Human-readable tour location.
  location: { type: String, required: true, trim: true },

  // Pickup or meeting location shown to travelers.
  meetingPoint: { type: String, default: "", trim: true },

  // Optional geographic coordinates used for map features.
  coordinates: { type: { type: String, enum: ["Point"] }, coordinates: { type: [Number], default: undefined } },

  // Human-readable tour duration.
  duration: { type: String, default: "" },

  // Numeric duration used by date-window and scheduling logic.
  durationDays: { type: Number, min: 1, max: 365, default: 1 },

  // Structured day/night duration details.
  durationDetails: { days: { type: Number, min: 1, max: 365, default: 1 }, nights: { type: Number, min: 0, max: 365, default: 0 } },

  // Primary scheduled tour date retained for compatibility.
  date: { type: Date, required: true },

  // Beginning of the tour's offered date window.
  startDate: Date,

  // Optional final date of the tour's offered date window.
  endDate: Date,

  // Fallback aggregate guest capacity when dated inventory is not used.
  capacity: { type: Number, default: 20, min: 1 },

  // Base price per traveler before pricing adjustments.
  price: { type: Number, required: true, min: 0 },

  // Optional price intended for travel agents.
  agentPrice: { type: Number, default: 0 },

  // Tour-wide discount percentage.
  discount: { type: Number, default: 0, min: 0, max: 100 },

  // Legacy/explicit discounted unit price override.
  discountPrice: { type: Number, default: null },

  // Traveler-band pricing and discount rules.
  pricingRules: [pricingRuleSchema],

  // Defines whether the deposit is a fixed amount or percentage.
  depositType: { type: String, enum: ["fixed", "percentage"], default: "fixed" },

  // Controls whether tax is calculated for this tour.
  taxEnabled: { type: Boolean, default: false },

  // Tax classification used by tax/accounting workflows.
  taxCategory: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT"], default: "STANDARD" },

  // Controls whether tax is included in or added to the listed price.
  taxMode: { type: String, enum: ["exclusive", "inclusive"], default: "exclusive" },

  // Optional tour-specific tax percentage override.
  taxRate: { type: Number, min: 0, max: 100, default: null },

  // Primary image used for tour cards and detail pages.
  featuredImage: imageSchema,

  // Additional tour images.
  gallery: [imageSchema],

  // Optional tour video URL and media identifier.
  video: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },

  // Key selling points shown to travelers.
  highlights: [{ type: String, trim: true }],

  // Items/services included in the tour price.
  inclusions: [{ type: String, trim: true }],

  // Items/services not included in the tour price.
  exclusions: [{ type: String, trim: true }],

  // Languages supported by the tour or guide.
  languages: [{ type: String, trim: true }],

  // Minimum traveler age accepted for the tour.
  minimumAge: { type: Number, default: 0 },

  // Maximum traveler age accepted for the tour.
  maximumAge: { type: Number, default: 99 },

  // Difficulty level used to describe the tour.
  difficulty: { type: String, enum: ["easy", "moderate", "hard"], default: "easy" },

  // Day-by-day schedule, activities and accommodation details.
  itinerary: [itinerarySchema],

  // Date-specific inventory entries and booked-slot counts.
  availability: [availabilitySchema],

  // Aggregate capacity and waitlist settings.
  availabilitySettings: { totalSlots: { type: Number, default: 20 }, bookedSlots: { type: Number, default: 0 }, waitlistEnabled: { type: Boolean, default: false } },

  // Configured deposit amount or percentage.
  depositRequired: { type: Number, default: 0 },

  // Cancellation terms shown to customers.
  cancellationPolicy: { type: String, default: "" },

  // Minimum lead time required before the tour starts.
  bookingDeadline: { type: Number, default: 1 },

  // Controls whether bookings can be confirmed immediately.
  instantBooking: { type: Boolean, default: true },

  // Guide assigned to operate the tour.
  assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

  // Driver assigned to operate the tour.
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

  // Vehicle assigned to the tour.
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },

  // Lifecycle state of staff/vehicle assignment.
  assignmentStatus: { type: String, enum: ["pending", "assigned", "completed", "cancelled"], default: "pending" },

  // Tour lifecycle state such as draft, upcoming, ongoing or completed.
  status: { type: String, enum: ["draft", "scheduled", "upcoming", "ongoing", "fully-booked", "completed", "cancelled"], default: "draft" },

  // Controls whether the tour is publicly visible.
  published: { type: Boolean, default: false },

  // Marks the tour for featured/promotional placement.
  featured: { type: Boolean, default: false },

  // Derived availability flag used by booking and listing screens.
  available: { type: Boolean, default: true },

  // Soft-delete flag used to hide a tour without removing its record.
  isDeleted: { type: Boolean, default: false },

  // Timestamp for soft deletion.
  deletedAt: { type: Date, default: null },

  // User who performed the soft deletion.
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Aggregated customer rating.
  averageRating: { type: Number, default: 0, min: 0, max: 5 },

  // Count of reviews associated with the tour.
  totalReviews: { type: Number, default: 0 },

  // Aggregated number of bookings for the tour.
  totalBookings: { type: Number, default: 0 },

  // Count of times users added the tour to wishlists.
  wishlistCount: { type: Number, default: 0 },

  // Aggregate score used to rank popular tours.
  popularity: { type: Number, default: 0 },

  // User who created the tour record.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Tour schema field: seo.
  seo: seoSchema,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

tourSchema.pre("validate", async function (next) { if (this.title && (!this.slug || this.isModified("title"))) { const baseSlug = slugify(this.title, { lower: true, strict: true, trim: true }); let slug = baseSlug; let counter = 1; while (await mongoose.models.Tour.findOne({ slug, _id: { $ne: this._id } })) { counter += 1; slug = `${baseSlug}-${counter}`; } this.slug = slug; } next(); });
tourSchema.pre("validate", function (next) {
  let rawDuration;
  if (this.isModified("durationDays") && this.durationDays != null) rawDuration = this.durationDays;
  else if (this.isModified("durationDetails.days") && this.durationDetails?.days != null) rawDuration = this.durationDetails.days;
  else if (this.isModified("duration") && this.duration) rawDuration = this.duration;
  else rawDuration = this.durationDays ?? this.durationDetails?.days ?? this.duration ?? 1;
  const match = String(rawDuration).match(/\d+(?:\.\d+)?/);
  const parsedDuration = Number(match?.[0]);
  if (!Number.isFinite(parsedDuration) || parsedDuration < 1 || parsedDuration > 365) return next(new Error("Tour duration must be a whole number of days between 1 and 365."));
  this.durationDays = Math.floor(parsedDuration);
  this.durationDetails.days = this.durationDays;
  this.duration = String(this.durationDays);
  const start = this.startDate || this.date;
  const days = this.durationDays;
  if (start) {
    const startDate = new Date(start);
    if (!Number.isNaN(startDate.getTime())) {
      this.startDate = startDate;
      const calculatedEnd = new Date(startDate);
      calculatedEnd.setDate(calculatedEnd.getDate() + days - 1);
      const existingEnd = this.endDate ? new Date(this.endDate) : null;
      if (!existingEnd || Number.isNaN(existingEnd.getTime()) || (days > 1 && existingEnd.getTime() <= startDate.getTime())) this.endDate = calculatedEnd;
    }
  }
  next();
});
tourSchema.virtual("images").get(function () { const result = []; if (this.featuredImage?.url) result.push(this.featuredImage); if (Array.isArray(this.gallery)) result.push(...this.gallery); return result; });
tourSchema.virtual("image").get(function () { return this.featuredImage?.url || this.gallery?.[0]?.url || ""; });
tourSchema.virtual("finalPrice").get(function () { if (this.discountPrice !== null && this.discountPrice !== undefined) return this.discountPrice; if (this.discount > 0) return this.price - (this.price * this.discount) / 100; return this.price; });
tourSchema.virtual("remainingSlots").get(function () { return Math.max(0, this.availabilitySettings.totalSlots - this.availabilitySettings.bookedSlots); });
tourSchema.virtual("isFullyBooked").get(function () { return this.remainingSlots <= 0; });
tourSchema.methods.bookSlot = function (count = 1) { if (this.availabilitySettings.bookedSlots + count > this.availabilitySettings.totalSlots) throw new Error("Tour is fully booked."); this.availabilitySettings.bookedSlots += count; if (this.availabilitySettings.bookedSlots >= this.availabilitySettings.totalSlots) { this.status = "fully-booked"; this.available = false; } return this.save(); };
tourSchema.methods.releaseSlot = function (count = 1) { this.availabilitySettings.bookedSlots = Math.max(0, this.availabilitySettings.bookedSlots - count); if (this.availabilitySettings.bookedSlots < this.availabilitySettings.totalSlots) { if (this.status === "fully-booked") this.status = "upcoming"; this.available = true; } return this.save(); };
tourSchema.statics.getFeatured = function () { return this.find({ featured: true, available: true, isDeleted: false, published: true }); };
tourSchema.statics.getActiveTours = function () { return this.find({ available: true, isDeleted: false, published: true, status: { $in: ["scheduled", "upcoming", "ongoing"] } }); };

tourSchema.index({ destination: 1, status: 1 }); tourSchema.index({ featured: 1, available: 1 }); tourSchema.index({ published: 1 }); tourSchema.index({ createdBy: 1 }); tourSchema.index({ category: 1 }); tourSchema.index({ country: 1 }); tourSchema.index({ price: 1 }); tourSchema.index({ averageRating: -1 }); tourSchema.index({ totalBookings: -1 }); tourSchema.index({ popularity: -1 }); tourSchema.index({ assignedGuide: 1 }); tourSchema.index({ assignedDriver: 1 }); tourSchema.index({ assignedVehicle: 1 }); tourSchema.index({ assignmentStatus: 1 }); tourSchema.index({ isDeleted: 1 }); tourSchema.index({ available: 1 }); tourSchema.index({ status: 1, date: 1 }); tourSchema.index({ title: "text", description: "text", location: "text", country: "text", category: "text", tags: "text" });
tourSchema.plugin(tenantPlugin);
const Tour = mongoose.models.Tour || mongoose.model("Tour", tourSchema);
export default Tour;
