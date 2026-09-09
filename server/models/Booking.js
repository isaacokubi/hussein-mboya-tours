import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const travelerSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    passportNumber: { type: String, trim: true, uppercase: true, default: "" },
    nationality: { type: String, trim: true, default: "" },
    dateOfBirth: Date,
    emergencyContactName: { type: String, trim: true, default: "" },
    emergencyContactPhone: { type: String, trim: true, default: "" },
    dietaryRequirements: { type: String, default: "" },
    medicalConditions: { type: String, default: "" },
  },
  { _id: false },
);

const customerSnapshotSchema = new mongoose.Schema(
  { name: String, email: String, phone: String },
  { _id: false },
);

const emergencyContactSchema = new mongoose.Schema(
  { name: String, phone: String, relationship: String },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, unique: true, index: true },
    customTourRequest: { type: mongoose.Schema.Types.ObjectId, ref: "CustomTourRequest", default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    customerSnapshot: customerSnapshotSchema,
    contact: {
      name: { type: String, trim: true, default: "" },
      email: { type: String, lowercase: true, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
    },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },
    bookingSource: { type: String, enum: ["website", "mobile_app", "agent", "admin", "walk_in", "partner", "api"], default: "website" },
    externalSource: { type: String, trim: true, default: undefined },
    externalBookingId: { type: String, trim: true, default: undefined },
    integrationKeyId: { type: mongoose.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", default: null },
    externalMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: false, default: null, index: true },
    travelDate: { type: Date, required: true },
    originalTravelDate: { type: Date, default: null },
    rescheduleHistory: [{
      fromDate: { type: Date },
      toDate: { type: Date },
      reason: { type: String, default: "" },
      requestedAt: { type: Date, default: Date.now },
    }],
    rescheduleCount: { type: Number, default: 0, min: 0 },
    travelers: { type: [travelerSchema], default: [] },
    numberOfGuests: { type: Number, default: 1, min: 1 },
    pickupLocation: { type: String, trim: true, default: "" },
    pickupTime: Date,
    hotelName: { type: String, trim: true, default: "" },
    roomNumber: { type: String, trim: true, default: "" },
    emergencyContact: emergencyContactSchema,
    specialRequests: [{ type: String, trim: true }],
    assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    assigned: { type: Boolean, default: false },
    subtotal: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    couponUsed: { type: String, trim: true, default: "" },
    totalAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, default: 0, min: 0, max: 100 },
    commissionAmount: { type: Number, default: 0, min: 0 },
    commissionStatus: { type: String, enum: ["pending", "approved", "paid", "cancelled"], default: "pending" },
    commissionPaidAt: { type: Date, default: null },
    depositAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "BANK_TRANSFER", "CASH"], default: "MPESA" },
    paymentStatus: { type: String, enum: ["pending", "partial", "paid", "failed", "cancelled", "refunded"], default: "pending", index: true },
    transactionId: { type: String, trim: true },
    paymentReference: { type: String, trim: true },
    mpesaReceipt: { type: String, trim: true, default: "" },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    refundAmount: { type: Number, default: 0, min: 0 },
    refundStatus: { type: String, enum: ["none", "requested", "approved", "processing", "completed", "rejected"], default: "none" },
    refundReason: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"], default: "pending", index: true },
    cancellationReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    documents: [{ name: String, url: String, type: String, uploadedAt: { type: Date, default: Date.now } }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

bookingSchema.pre("save", function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = "BK-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  }

  if (this.isModified("status") && this.status === "confirmed" && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }

  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.isModified("status") && this.status === "cancelled" && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }

  next();
});

bookingSchema.virtual("remainingBalance").get(function () { return Math.max(0, this.totalAmount - this.depositAmount); });
bookingSchema.virtual("isPaid").get(function () { return this.paymentStatus === "paid"; });
bookingSchema.virtual("isAssigned").get(function () { return Boolean(this.assignedGuide || this.assignedDriver || this.assignedVehicle); });
bookingSchema.virtual("isCompleted").get(function () { return this.status === "completed"; });
bookingSchema.virtual("isCancelled").get(function () { return this.status === "cancelled"; });

bookingSchema.methods.calculateCommission = function () { return (this.totalAmount * this.commissionRate) / 100; };
bookingSchema.methods.calculateBalance = function () { return Math.max(0, this.totalAmount - this.depositAmount); };
bookingSchema.methods.markPaid = function () { this.paymentStatus = "paid"; this.depositAmount = this.totalAmount; this.balanceAmount = 0; return this.save(); };
bookingSchema.methods.markCompleted = function () { this.status = "completed"; this.completedAt = new Date(); return this.save(); };
bookingSchema.methods.cancelBooking = function (reason = "") { this.status = "cancelled"; this.cancellationReason = reason; this.cancelledAt = new Date(); return this.save(); };

bookingSchema.statics.findUpcoming = function () { return this.find({ status: { $in: ["confirmed", "assigned", "ongoing"] }, travelDate: { $gte: new Date() }, isDeleted: false }); };
bookingSchema.statics.findCompleted = function () { return this.find({ status: "completed", isDeleted: false }); };
bookingSchema.statics.findPendingPayments = function () { return this.find({ paymentStatus: { $in: ["pending", "partial"] }, isDeleted: false }); };

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ agent: 1 });
bookingSchema.index({ travelDate: 1 });
bookingSchema.index({ paymentReference: 1 });
bookingSchema.index({ transactionId: 1 });
bookingSchema.index({ assignedGuide: 1 });
bookingSchema.index({ assignedDriver: 1 });
bookingSchema.index({ assignedVehicle: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ tenantId: 1, externalSource: 1, externalBookingId: 1 }, { unique: true, sparse: true, partialFilterExpression: { externalBookingId: { $gt: "" } } });
bookingSchema.index({ isDeleted: 1 });
bookingSchema.index({ refundStatus: 1 });
bookingSchema.index({ commissionStatus: 1 });
bookingSchema.index({ customer: 1, travelDate: 1 });
bookingSchema.index({ tour: 1, travelDate: 1 });

bookingSchema.pre("validate", function(next) {
  if (!this.tour && !this.customTourRequest) {
    return next(new Error("Booking must have either a tour or a custom tour request."));
  }
  next();
});

if (!mongoose.models.Booking) bookingSchema.plugin(tenantPlugin);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
