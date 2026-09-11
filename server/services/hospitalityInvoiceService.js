import Invoice from "../models/Invoice.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Payment from "../models/Payment.js";

const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };

export const getHospitalityInvoiceModel = (type) => MODELS[String(type || "").trim().toLowerCase()] || null;

export const ensureHospitalityInvoice = async ({ type, booking, customerSnapshot = null }) => {
  if (!booking?.tenantId || !booking?._id) throw new Error("Hospitality booking is required.");
  const normalizedType = String(type || "").trim().toLowerCase();
  if (!getHospitalityInvoiceModel(normalizedType)) throw new Error("Invalid hospitality invoice type.");

  const existing = await Invoice.findOne({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: normalizedType, isDeleted: { $ne: true } });
  if (existing) return existing;

  const snapshot = customerSnapshot || {
    name: normalizedType === "airport_transfer" ? booking.passengerName : booking.guests?.[0] ? `${booking.guests[0].firstName || ""} ${booking.guests[0].lastName || ""}`.trim() : "Guest",
    email: normalizedType === "airport_transfer" ? booking.passengerEmail : booking.guests?.[0]?.email || "",
    phone: normalizedType === "airport_transfer" ? booking.passengerPhone : booking.guests?.[0]?.phone || "",
  };

  const invoice = await Invoice.create({
    tenantId: booking.tenantId,
    hospitalityBooking: booking._id,
    hospitalityBookingModel: normalizedType === "hotel" ? "HotelBooking" : "AirportTransferBooking",
    hospitalityType: normalizedType,
    customer: booking.customer || null,
    user: booking.user || null,
    issueDate: new Date(),
    dueDate: new Date(),
    subtotal: Number(booking.subtotal || 0),
    tax: Number(booking.taxes || 0),
    taxableAmount: Math.max(0, Number(booking.subtotal || 0)),
    totalAmount: Number(booking.totalAmount || 0),
    paymentMethod: "MPESA",
    status: "pending",
    customerSnapshot: snapshot,
    notes: `${normalizedType === "hotel" ? "Hotel" : "Airport transfer"} reservation ${booking.reference}`,
  });
  return invoice;
};

export const syncHospitalityInvoicePayments = async ({ type, booking }) => {
  const invoice = await ensureHospitalityInvoice({ type, booking });
  const payments = await Payment.find({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["completed", "refunded"] } }).select("amount refundedAmount paymentMethod transactionReference transactionId mpesaReceiptNumber updatedAt").lean();
  const paid = payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0);
  const totalRefunded = payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0);
  invoice.amountPaid = Math.min(Number(invoice.totalAmount || 0), paid);
  invoice.balance = Math.max(0, Number(invoice.totalAmount || 0) - invoice.amountPaid);
  invoice.status = totalRefunded > 0 && invoice.amountPaid <= 0 ? "refunded" : invoice.balance <= 0 && invoice.totalAmount > 0 ? "paid" : invoice.amountPaid > 0 ? "partial" : "pending";
  const latest = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0];
  if (latest) invoice.paymentMethod = latest.paymentMethod || invoice.paymentMethod;
  if (latest) invoice.paymentReference = latest.mpesaReceiptNumber || latest.transactionReference || latest.transactionId || invoice.paymentReference;
  await invoice.save();
  return invoice;
};
