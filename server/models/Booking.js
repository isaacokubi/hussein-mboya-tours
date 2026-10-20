// Mongoose defines booking documents and their validation rules.
import mongoose from "mongoose";
// Apply tenant-aware read/write protections to booking records.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Queue external notifications when booking lifecycle events occur.
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
  // Organization that owns the booking; required for tenant isolation.
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },

  // Human-readable unique booking reference used in emails, receipts and support.
  bookingNumber: { type: String, unique: true, index: true },

  // Optional custom-tour request associated with this booking.
  customTourRequest: { type: mongoose.Schema.Types.ObjectId, ref: "CustomTourRequest", default: null },

  // Customer record associated with the booking.
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false, index: true },

  // Authenticated user who placed the booking, when available.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

  // Snapshot of customer contact details captured when the booking was created.
  customerSnapshot: customerSnapshotSchema,

  // Name, email and phone details used to contact the booking party.
  contact: { name: { type: String, trim: true, default: "" }, email: { type: String, lowercase: true, trim: true, default: "" }, phone: { type: String, trim: true, default: "" } },

  // Travel agent responsible for the booking, when applicable.
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },

  // Channel through which the booking was created.
  bookingSource: { type: String, enum: ["website", "mobile_app", "agent", "admin", "walk_in", "partner", "api"], default: "website" },

  // External partner/system that supplied the booking.
  externalSource: { type: String, trim: true, default: undefined },

  // Identifier assigned to this booking by an external system.
  externalBookingId: { type: String, trim: true, default: undefined },

  // Integration credential record used by an API-originated booking.
  integrationKeyId: { type: mongoose.Schema.Types.ObjectId, ref: "WebsiteIntegrationKey", default: null },

  // Additional external integration data stored with the booking.
  externalMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Classifies the booking as individual, group or corporate.
  bookingType: { type: String, enum: ["individual", "group", "corporate"], default: "individual", index: true },

  // Reference that groups related bookings together.
  groupReference: { type: String, trim: true, default: "" },

  // Corporate customer account billed for the booking.
  corporateAccount: { type: mongoose.Schema.Types.ObjectId, ref: "CorporateAccount", default: null, index: true },

  // Company name snapshot used for corporate booking records.
  corporateCompanyName: { type: String, trim: true, default: "" },

  // Corporate tax/PIN identifier captured for billing.
  corporatePin: { type: String, trim: true, uppercase: true, default: "" },

  // Customer purchase-order reference for invoicing.
  purchaseOrderNumber: { type: String, trim: true, default: "" },

  // Defines when and how payment is expected.
  paymentTerms: { type: String, enum: ["immediate", "deposit", "credit", "staged"], default: "immediate" },

  // Contact details used for billing and invoices.
  billingContact: billingContactSchema,

  // Reference to the group rooming list, when applicable.
  roomingListReference: { type: String, trim: true, default: "" },

  // Tour record selected for this booking.
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: false, default: null, index: true },

  // Date the traveler plans to take the tour.
  travelDate: { type: Date, required: true },

  // Original travel date retained after rescheduling.
  originalTravelDate: { type: Date, default: null },

  // Audit history of previous travel-date changes.
  rescheduleHistory: [{ fromDate: { type: Date }, toDate: { type: Date }, reason: { type: String, default: "" }, requestedAt: { type: Date, default: Date.now } }],

  // Number of times this booking has been rescheduled.
  rescheduleCount: { type: Number, default: 0, min: 0 },

  // Traveler details captured for this booking.
  travelers: { type: [travelerSchema], default: [] },

  // Total number of guests included in the booking.
  numberOfGuests: { type: Number, default: 1, min: 1 },

  // Requested pickup point for the travelers.
  pickupLocation: { type: String, trim: true, default: "" },

  // Scheduled pickup time, when configured.
  pickupTime: Date,

  // Hotel associated with pickup or accommodation.
  hotelName: { type: String, trim: true, default: "" },

  // Room identifier associated with the booking, when applicable.
  roomNumber: { type: String, trim: true, default: "" },

  // Emergency contact information for the booking party.
  emergencyContact: emergencyContactSchema,

  // Special requirements or notes supplied by the customer.
  specialRequests: [{ type: String, trim: true }],

  // Guide assigned to conduct the tour.
  assignedGuide: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

  // Driver assigned to transport the travelers.
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },

  // Vehicle assigned to the booking.
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },

  // Flag indicating whether operational resources have been assigned.
  assigned: { type: Boolean, default: false },

  // Amount before discounts, tax and service fees.
  subtotal: { type: Number, default: 0, min: 0 },

  // Total discount applied to the booking.
  discountAmount: { type: Number, default: 0, min: 0 },

  // Tax amount calculated for the booking.
  taxAmount: { type: Number, default: 0, min: 0 },

  // Additional service fee charged for the booking.
  serviceFee: { type: Number, default: 0, min: 0 },

  // Coupon code applied to the booking, if any.
  couponUsed: { type: String, trim: true, default: "" },

  // Final amount due for the booking.
  totalAmount: { type: Number, required: true, min: 0 },

  // Commission percentage used for agent/partner calculations.
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },

  // Commission amount calculated for the booking.
  commissionAmount: { type: Number, default: 0, min: 0 },

  // Lifecycle status of the booking's commission.
  commissionStatus: { type: String, enum: ["pending", "approved", "paid", "cancelled"], default: "pending" },

  // Timestamp when the commission was paid.
  commissionPaidAt: { type: Date, default: null },

  // Configured initial deposit amount for the booking.
  depositAmount: { type: Number, default: 0, min: 0 },

  // Total payment amount recorded against the booking.
  amountPaid: { type: Number, default: 0, min: 0 },

  // Outstanding balance after recorded payments.
  balanceAmount: { type: Number, default: 0, min: 0 },

  // Payment method associated with the booking.
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "BANK_TRANSFER", "CASH"], default: "MPESA" },

  // Payment lifecycle state for the booking.
  paymentStatus: { type: String, enum: ["pending", "partial", "paid", "failed", "cancelled", "refunded"], default: "pending", index: true },

  // Booking schema field: transactionId.
  transactionId: { type: String, trim: true },

  // Provider or transaction reference for reconciliation.
  paymentReference: { type: String, trim: true },

  // Booking schema field: mpesaReceipt.
  mpesaReceipt: { type: String, trim: true, default: "" },

  // Booking schema field: payments.
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],

  // Booking schema field: refundAmount.
  refundAmount: { type: Number, default: 0, min: 0 },

  // Booking schema field: refundStatus.
  refundStatus: { type: String, enum: ["none", "requested", "approved", "processing", "completed", "rejected"], default: "none" },

  // Booking schema field: refundReason.
  refundReason: { type: String, default: "" },

  // Overall booking lifecycle status.
  status: { type: String, enum: ["pending", "confirmed", "assigned", "ongoing", "completed", "cancelled", "refunded"], default: "pending", index: true },

  // Booking schema field: cancellationReason.
  cancellationReason: { type: String, default: "" },

  // Booking schema field: cancelledAt.
  cancelledAt: { type: Date, default: null },

  // Booking schema field: confirmedAt.
  confirmedAt: { type: Date, default: null },

  // Booking schema field: completedAt.
  completedAt: { type: Date, default: null },

  // Internal booking notes used by authorized staff.
  notes: { type: String, default: "" },

  // Booking schema field: documents.
  documents: [{ name: String, url: String, type: String, uploadedAt: { type: Date, default: Date.now } }],

  // Booking schema field: createdBy.
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Booking schema field: updatedBy.
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Booking schema field: isDeleted.
  isDeleted: { type: Boolean, default: false, index: true },
},
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

bookingSchema.pre("save", function(next) {
  if (!Number.isFinite(Number(this.amountPaid)) || Number(this.amountPaid) < 0) this.amountPaid = 0;
  if (Number.isFinite(Number(this.totalAmount))) this.balanceAmount = Math.max(0, Number(this.totalAmount) - Number(this.amountPaid || 0));
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
  // Transactional booking creation defers external/webhook side effects until commit.
  if (this.$session?.()) return;
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
    if (process.env.DEMO_SEED_MODE !== "true" && this.tenantId && this.paymentStatus === "paid" && Number(this.totalAmount || 0) > 0 && this.user) {
      const { default: PaymentModel } = await import("./Payment.js");
      const existingPayments = await PaymentModel.find({
        tenantId: this.tenantId,
        booking: this._id,
        status: { $in: ["completed", "refunded"] },
      }).select("amount refundedAmount").lean();
      const netPaid = existingPayments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
      const outstanding = Math.max(0, Number(this.totalAmount || 0) - netPaid);
      if (outstanding > 0) {
        const paymentMethod = String(this.paymentMethod || "MPESA").toUpperCase();
        const provider = paymentMethod === "BANK_TRANSFER" ? "BANK" : ["CARD", "PAYPAL", "MPESA", "CASH"].includes(paymentMethod) ? paymentMethod : "CASH";
        const createdPayment = await PaymentModel.create({
          tenantId: this.tenantId,
          customer: this.user,
          user: this.user,
          booking: this._id,
          provider,
          method: paymentMethod === "BANK_TRANSFER" ? "bank" : paymentMethod.toLowerCase(),
          paymentMethod,
          amount: outstanding,
          currency: "KES",
          status: "completed",
          transactionReference: this.paymentReference || ("BOOKING-MANUAL-" + this.bookingNumber + "-" + Date.now()),
          transactionId: this.transactionId || "",
          mpesaReceiptNumber: this.mpesaReceipt || "",
          paidAt: new Date(),
          notes: "Payment ledger synchronized from paid booking status.",
        });
        if (!Array.isArray(this.payments)) this.payments = [];
        if (!this.payments.some((id) => String(id) === String(createdPayment._id))) {
          await this.constructor.updateOne({ _id: this._id }, { $addToSet: { payments: createdPayment._id } });
        }
      }
    }
  } catch (error) { console.error("BOOKING PAYMENT LEDGER SYNC ERROR:", error.message); }
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

bookingSchema.virtual("remainingBalance").get(function () { return Math.max(0, this.totalAmount - Number(this.amountPaid || 0)); }); bookingSchema.virtual("isPaid").get(function () { return this.paymentStatus === "paid"; }); bookingSchema.virtual("isAssigned").get(function () { return Boolean(this.assignedGuide || this.assignedDriver || this.assignedVehicle); }); bookingSchema.virtual("isCompleted").get(function () { return this.status === "completed"; }); bookingSchema.virtual("isCancelled").get(function () { return this.status === "cancelled"; }); bookingSchema.methods.calculateCommission = function () { return (this.totalAmount * this.commissionRate) / 100; }; bookingSchema.methods.calculateBalance = function () { return Math.max(0, this.totalAmount - Number(this.amountPaid || 0)); }; bookingSchema.methods.markPaid = function () { this.paymentStatus = "paid"; this.amountPaid = this.totalAmount; this.balanceAmount = 0; return this.save(); }; bookingSchema.methods.markCompleted = function () { this.status = "completed"; this.completedAt = new Date(); return this.save(); }; bookingSchema.methods.cancelBooking = function (reason = "") { this.status = "cancelled"; this.cancellationReason = reason; this.cancelledAt = new Date(); return this.save(); }; bookingSchema.statics.findUpcoming = function () { return this.find({ status: { $in: ["confirmed", "assigned", "ongoing"] }, travelDate: { $gte: new Date() }, isDeleted: false }); }; bookingSchema.statics.findCompleted = function () { return this.find({ status: "completed", isDeleted: false }); }; bookingSchema.statics.findPendingPayments = function () { return this.find({ paymentStatus: { $in: ["pending", "partial"] }, isDeleted: false }); };
bookingSchema.index({ customer: 1, createdAt: -1 }); bookingSchema.index({ agent: 1 }); bookingSchema.index({ travelDate: 1 }); bookingSchema.index({ paymentReference: 1 }); bookingSchema.index({ transactionId: 1 }); bookingSchema.index({ assignedGuide: 1 }); bookingSchema.index({ assignedDriver: 1 }); bookingSchema.index({ assignedVehicle: 1 }); bookingSchema.index({ createdAt: -1 }); bookingSchema.index({ tenantId: 1, externalSource: 1, externalBookingId: 1 }, { unique: true, name: "tenantId_1_externalSource_1_externalBookingId_1", partialFilterExpression: { externalBookingId: { $type: "string", $gt: "" } } }); bookingSchema.index({ refundStatus: 1 }); bookingSchema.index({ commissionStatus: 1 }); bookingSchema.index({ customer: 1, travelDate: 1 }); bookingSchema.index({ tour: 1, travelDate: 1 }); bookingSchema.index({ tenantId: 1, bookingType: 1, travelDate: 1 }); bookingSchema.index({ tenantId: 1, corporatePin: 1 }); bookingSchema.index({ tenantId: 1, corporateAccount: 1, travelDate: 1 });

const tenantBookingSchema = bookingSchema.plugin(tenantPlugin);
const Booking = mongoose.models.Booking || mongoose.model("Booking", tenantBookingSchema);
export default Booking;
