import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";

const travelerSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, name: { type: String, required: true, trim: true, maxlength: 100 }, age: { type: Number, min: 0, max: 120 }, gender: { type: String, enum: ["male", "female", "other"], default: "other" }, passportNumber: { type: String, trim: true, uppercase: true, default: "" }, nationality: { type: String, trim: true, default: "" }, dateOfBirth: Date, emergencyContactName: { type: String, trim: true, default: "" }, emergencyContactPhone: { type: String, trim: true, default: "" }, dietaryRequirements: { type: String, default: "" }, medicalConditions: { type: String, default: "" },
  }, { _id: false }
);
const customerSnapshotSchema = new mongoose.Schema({ name: String, email: String, phone: String }, { _id: false });
const emergencyContactSchema = new mongoose.Schema({ name: String, phone: String, relationship: String }, { _id: false });
const billingContactSchema = new mongoose.Schema({ name: String, email: String, phone: String }, { _id: false });

const bookingSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, bookingNumber: { type: String, unique: true, index: true }, customTourRequest: { type: mongoose.Schema.Types.ObjectId, ref: "CustomTourRequest", default: null }, customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false, index: true }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true }, customerSnapshot: customerSnapshotSchema, contact: { name: { type: String, trim: true, default: "" }, email: { type: String, lowercase: true, trim: true, default: "" }, phone: { type: String, trim: true, default: "" } }, agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null }, bookingSource: { type: String, enum: ["website", "mobile_app", "agent", "admin", "walk_in", "partner", "api"], default: "website" }, externalSource: { type: String, trim: true, default: undefined }, externalBookingId: { type: String, trim: true, default: undefined }, integrationKeyId: { type: mongoose.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", default: null }, externalMetadata: { type: mongoose.Schema.Types.Mixed, default: {} }, bookingType: { type: String, enum: ["individual", "group", "corporate"], default: "individual", index: true }, groupReference: { type: String, trim: true, default: "" }, corporateAccount: { type: mongoose.Schema.Types.ObjectId, ref: "CorporateAccount", default: null, index: true }, corporateCompanyName: { type: String, trim: true, default: "" }, corporatePin: { type: String, trim: true, uppercase: true, default: "" }, purchaseOrderNumber: { type: String, trim: true, default: "" }, paymentTerms: { type: String, enum: ["immediate", "deposit", "credit", "staged"], default: "immediate" }, billingContact: billingContactSchema, roomingListReference: { type: String, trim: true, default: "" }, tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: false, default: null, index: true }, travelDate: { type: Date, required: true }, originalTravelDate: { type: Date, default: null }, rescheduleHistory: [{ fromDate: { type: Date }, toDate: { type: Date }, reason: { type: String, default: "" }, requestedAt: { type: Date, default: Date.now } }], rescheduleCount: { type: Number, default: 0, min: 0 }, travelers: { type: [travelerSchema], default: [] }, numberOfGuests: { type: Number, default: 1, min: 1 }, pickupLocation: { type: String, trim: true, default: "" }, pickupTime: Date, hotelName: { type: String, trim: true, default: "" }, roomNumber: { type: String, trim: true, default: "" }, emergencyContact: emergencyContactSchema, specialRequests: [{ type: String, trim: true }], assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null }, assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null }, assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null }, assigned: { type: Boolean, default: false }, subtotal: { type: Number, default: 0, min: 0 }, discountAmount: { type: Number, default: 0, min: 0 }, taxAmount: { type: Number, default: 0, min: 0 }, serviceFee: { type: Number, default: 0, min: 0 }, couponUsed: { type: String, trim: true, default: "" }, totalAmount: { type: Number, required: true, min: 0 }, commissionRate: { type: Number, default: 0, min: 0, max: 100 }, commissionAmount: { type: Number, default: 0, min: 0 }, commissionStatus: { type: String, enum: ["pending", "approved", "paid", "cancelled"], default: "pending" }, commissionPaidAt: { type: Date, default: null }, depositAmount: { type: Number, default: 0, min: 0 }, balanceAmount: { type: Number, default: 0, min: 0 }, paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "BANK_TRANSFER", "CASH"], default: "MPESA" }, paymentStatus: { type: String, enum: ["pending", "partial", "paid", "failed", "cancelled", "refunded"], default: "pending", index: true }, transactionId: { type: String, trim: true }, paymentReference: { type: String, trim: true }, mpesaReceipt: { type: String, trim: true, default: "" }, payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }], refundAmount: { type: Number, default: 0, min: 0 }, refundStatus: { type: String, enum: ["none", "requested", "approved", "processing", "completed", "rejected"], default: "none" }, refundReason: { type: String, default: "" }, status: { type: String, enum: ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"], default: "pending", index: true }, cancellationReason: { type: String, default: "" }, cancelledAt: { type: Date, default: null }, confirmedAt: { type: Date, default: null }, completedAt: { type: Date, default: null }, notes: { type: String, default: "" }, documents: [{ name: String, url: String, type: String, uploadedAt: { type: Date, default: Date.now } }], createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookingSchema.pre("save", function(next) {
  this.$wasNew = this.isNew;
  if (!this.bookingNumber) this.bookingNumber = "BK-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  if (this.isModified("status") && this.status === "confirmed" && !this.confirmedAt) this.confirmedAt = new Date();
  if (this.isModified("status") && this.status === "completed" && !this.completedAt) this.completedAt = new Date();
  if (this.isModified("status") && this.status === "cancelled" && !this.cancelledAt) this.cancelledAt = new Date();
  if (this.bookingType === "corporate" && !this.corporateCompanyName) return next(new Error("Corporate booking requires a company name."));
  next();
});
bookingSchema.pre("validate", function(next) { if (!this.tour && !this.customTourRequest) return next(new Error("Booking must have either a tour or a custom tour request.")); next(); });

bookingSchema.post("save", async function() {
  try {
    if (this.tenantId) {
      const event = this.$wasNew ? "booking.created" : "booking.updated";
      await queueWebhookEvent({
        tenantId: this.tenantId,
        event,
        sourceId: String(this._id),
        data: {
          id: this._id,
          bookingNumber: this.bookingNumber,
          status: this.status,
          paymentStatus: this.paymentStatus,
          bookingSource: this.bookingSource,
          tour: this.tour,
          travelDate: this.travelDate,
          numberOfGuests: this.numberOfGuests,
          totalAmount: this.totalAmount,
          depositAmount: this.depositAmount,
          balanceAmount: this.balanceAmount,
          currency: "KES",
          updatedAt: this.updatedAt,
        },
      });
    }
  } catch (error) { console.error("BOOKING WEBHOOK QUEUE ERROR:", error.message); }
  try {
    if (!this.tenantId || !this.corporateAccount) return;
    const PaymentModel = mongoose.models.Payment;
    const CorporateAccountModel = mongoose.models.CorporateAccount;
    if (!PaymentModel || !CorporateAccountModel) return;
    const bookings = await this.constructor.find({ tenantId: this.tenantId, corporateAccount: this.corporateAccount, isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } }).select("_id totalAmount").lean();
    const bookingIds = bookings.map((item) => item._id);
    const payments = bookingIds.length ? await PaymentModel.aggregate([{ $match: { tenantId: this.tenantId, booking: { $in: bookingIds }, status: { $in: ["completed", "refunded"] } } }, { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } }, { $group: { _id: null, total: { $sum: "$net" } } }]) : [];
    const exposure = Math.max(0, bookings.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) - Number(payments[0]?.total || 0));
    await CorporateAccountModel.updateOne({ tenantId: this.tenantId, _id: this.corporateAccount }, { $set: { currentBalance: Math.round(exposure * 100) / 100 } });
  } catch (error) { console.error("CORPORATE BOOKING BALANCE SYNC ERROR:", error.message); }
});

bookingSchema.virtual("remainingBalance").get(function () { return Math.max(0, this.totalAmount - this.depositAmount); }); bookingSchema.virtual("isPaid").get(function () { return this.paymentStatus === "paid"; }); bookingSchema.virtual("isAssigned").get(function () { return Boolean(this.assignedGuide || this.assignedDriver || this.assignedVehicle); }); bookingSchema.virtual("isCompleted").get(function () { return this.status === "completed"; }); bookingSchema.virtual("isCancelled").get(function () { return this.status === "cancelled"; }); bookingSchema.methods.calculateCommission = function () { return (this.totalAmount * this.commissionRate) / 100; }; bookingSchema.methods.calculateBalance = function () { return Math.max(0, this.totalAmount - this.depositAmount); }; bookingSchema.methods.markPaid = function () { this.paymentStatus = "paid"; this.depositAmount = this.totalAmount; this.balanceAmount = 0; return this.save(); }; bookingSchema.methods.markCompleted = function () { this.status = "completed"; this.completedAt = new Date(); return this.save(); }; bookingSchema.methods.cancelBooking = function (reason = "") { this.status = "cancelled"; this.cancellationReason = reason; this.cancelledAt = new Date(); return this.save(); }; bookingSchema.statics.findUpcoming = function () { return this.find({ status: { $in: ["confirmed", "assigned", "ongoing"] }, travelDate: { $gte: new Date() }, isDeleted: false }); }; bookingSchema.statics.findCompleted = function () { return this.find({ status: "completed", isDeleted: false }); }; bookingSchema.statics.findPendingPayments = function () { return this.find({ paymentStatus: { $in: ["pending", "partial"] }, isDeleted: false }); };
bookingSchema.index({ customer: 1, createdAt: -1 }); bookingSchema.index({ agent: 1 }); bookingSchema.index({ travelDate: 1 }); bookingSchema.index({ paymentReference: 1 }); bookingSchema.index({ transactionId: 1 }); bookingSchema.index({ assignedGuide: 1 }); bookingSchema.index({ assignedDriver: 1 }); bookingSchema.index({ assignedVehicle: 1 }); bookingSchema.index({ createdAt: -1 }); bookingSchema.index({ tenantId: 1, externalSource: 1, externalBookingId: 1 }, { unique: true, sparse: true, partialFilterExpression: { externalBookingId: { $gt: "" } } }); bookingSchema.index({ refundStatus: 1 }); bookingSchema.index({ commissionStatus: 1 }); bookingSchema.index({ customer: 1, travelDate: 1 }); bookingSchema.index({ tour: 1, travelDate: 1 }); bookingSchema.index({ tenantId: 1, bookingType: 1, travelDate: 1 }); bookingSchema.index({ tenantId: 1, corporatePin: 1 }); bookingSchema.index({ tenantId: 1, corporateAccount: 1, travelDate: 1 });

const tenantBookingSchema = bookingSchema.plugin(tenantPlugin);
const Booking = mongoose.models.Booking || mongoose.model("Booking", tenantBookingSchema);
export default Booking;
