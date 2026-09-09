import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
import Invoice from "./Invoice.js";

/*
|--------------------------------------------------------------------------
| TRAVELER SCHEMA
|--------------------------------------------------------------------------
*/

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
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },
    travelDate: Date,
    returnDate: Date,
    travelers: { type: [travelerSchema], default: [] },
    emergencyContact: { type: emergencyContactSchema, default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    depositAmount: { type: Number, default: 0, min: 0 },
    balanceAmount: { type: Number, default: 0, min: 0 },
    paymentStatus: { type: String, default: "pending" },
    paymentMethod: { type: String, default: "MPESA" },
    paymentReference: { type: String, default: "", trim: true },
    transactionId: { type: String, default: "", trim: true },
    mpesaReceipt: { type: String, default: "", trim: true },
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
    paidAt: { type: Date, default: null },
    status: { type: String, default: "pending" },
    refundStatus: { type: String, default: "none" },
    refundAmount: { type: Number, default: 0, min: 0 },
    commissionRate: { type: Number, default: 0, min: 0, max: 100 },
    commissionAmount: { type: Number, default: 0, min: 0 },
    commissionStatus: { type: String, default: "pending" },
    assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
    cancellationReason: { type: String, default: "", trim: true },
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

bookingSchema.pre("save", function(next) {
  if (!this.bookingNumber) this.bookingNumber = `BK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const total = Math.max(0, Number(this.totalAmount || 0));
  const deposit = Math.min(total, Math.max(0, Number(this.depositAmount || 0)));
  this.depositAmount = deposit;
  this.balanceAmount = Math.max(0, total - deposit);

  if (this.paymentStatus === "paid" || this.balanceAmount <= 0 && deposit > 0 && total > 0) {
    this.paymentStatus = "paid";
    this.depositAmount = total;
    this.balanceAmount = 0;
    this.paidAt = this.paidAt || new Date();
  } else if (deposit > 0) {
    this.paymentStatus = "partial";
  } else if (!["failed", "cancelled", "refunded"].includes(this.paymentStatus)) {
    this.paymentStatus = "pending";
  }

  if (this.status === "cancelled" && !this.cancelledAt) this.cancelledAt = new Date();
  next();
});

/* Keep the tenant invoice synchronized whenever booking financial state changes.
 * This updates an existing invoice only; invoice creation remains explicit so
 * booking creation cannot unexpectedly create financial records. */
bookingSchema.post("save", async function(doc, next) {
  try {
    if (!doc.tenantId) return next();

    const session = typeof doc.$session === "function" ? doc.$session() : null;
    const invoiceQuery = Invoice.findOne({ tenantId: doc.tenantId, booking: doc._id });
    if (session) invoiceQuery.session(session);
    const invoice = await invoiceQuery;
    if (!invoice) return next();

    const total = Math.max(0, Number(doc.totalAmount || 0));
    const paid = Math.min(total, Math.max(0, Number(doc.depositAmount || 0)));
    invoice.amountPaid = paid;
    invoice.balance = Math.max(0, total - paid);

    if (doc.status === "refunded" || doc.paymentStatus === "refunded") invoice.status = "refunded";
    else if (invoice.balance <= 0 && total > 0) invoice.status = "paid";
    else if (paid > 0) invoice.status = "partial";
    else invoice.status = "pending";

    if (doc.paymentMethod) invoice.paymentMethod = String(doc.paymentMethod).toUpperCase() === "BANK" ? "BANK_TRANSFER" : doc.paymentMethod;
    if (doc.paymentReference || doc.transactionId) invoice.paymentReference = doc.paymentReference || doc.transactionId;

    await invoice.save(session ? { session } : undefined);
    return next();
  } catch (error) {
    return next(error);
  }
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
  if (!this.tour && !this.customTourRequest) return next(new Error("Booking must have either a tour or a custom tour request."));
  next();
});

if (!mongoose.models.Booking) bookingSchema.plugin(tenantPlugin);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
