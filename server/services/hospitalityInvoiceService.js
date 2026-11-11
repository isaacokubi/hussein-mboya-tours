/**
 * Purpose: hospitality Invoice Service business-logic service. Main declarations: getHospitalityInvoiceModel, ensureHospitalityInvoice, syncHospitalityInvoicePayments.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Invoice from "../models/Invoice.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";

// Declare MODELS for use by the surrounding module or function.
const MODELS = { hotel: HotelBooking, airport_transfer: AirportTransferBooking };

// Declare getHospitalityInvoiceModel for use by the surrounding module or function.
export const getHospitalityInvoiceModel = (type) => MODELS[String(type || "").trim().toLowerCase()] || null;

// Declare ensureHospitalityInvoice for use by the surrounding module or function.
export const ensureHospitalityInvoice = async ({ type, booking, customerSnapshot = null, session = null }) => {
  // Check the condition (!booking?.tenantId || !booking?._id) and run the matching branch.
  if (!booking?.tenantId || !booking?._id) throw new Error("Hospitality booking is required.");
  // Declare normalizedType for use by the surrounding module or function.
  const normalizedType = String(type || "").trim().toLowerCase();
  // Check the condition (!getHospitalityInvoiceModel(normalizedType)) and run the matching branch.
  if (!getHospitalityInvoiceModel(normalizedType)) throw new Error("Invalid hospitality invoice type.");

  // Declare existingQuery for use by the surrounding module or function.
  const existingQuery = Invoice.findOne({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: normalizedType, isDeleted: { $ne: true } });
  // Check the condition (session) and run the matching branch.
  if (session) existingQuery.session(session);
  // Declare existing for use by the surrounding module or function.
  const existing = await existingQuery;
  // Check the condition (existing) and run the matching branch.
  if (existing) return existing;

  // Declare snapshot for use by the surrounding module or function.
  const snapshot = customerSnapshot || {
    name: normalizedType === "airport_transfer" ? booking.passengerName : booking.guests?.[0] ? `${booking.guests[0].firstName || ""} ${booking.guests[0].lastName || ""}`.trim() : "Guest",
    email: normalizedType === "airport_transfer" ? booking.passengerEmail : booking.guests?.[0]?.email || "",
    phone: normalizedType === "airport_transfer" ? booking.passengerPhone : booking.guests?.[0]?.phone || "",
  };

  // Declare invoiceData for use by the surrounding module or function.
  const invoiceData = {
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
  };
  // Declare invoice for use by the surrounding module or function.
  const invoice = session ? (await Invoice.create([invoiceData], { session }))[0] : await Invoice.create(invoiceData);
  // Return the value of invoice to the caller.
  return invoice;
};

// Declare syncHospitalityInvoicePayments for use by the surrounding module or function.
export const syncHospitalityInvoicePayments = async ({ type, booking, session = null }) => {
  // Declare invoice for use by the surrounding module or function.
  const invoice = await ensureHospitalityInvoice({ type, booking, session });
  // Declare paymentQuery for use by the surrounding module or function.
  const paymentQuery = Payment.find({ tenantId: booking.tenantId, hospitalityBooking: booking._id, hospitalityType: type, status: { $in: ["completed", "refunded"] } });
  // Check the condition (session) and run the matching branch.
  if (session) paymentQuery.session(session);
  // Declare payments for use by the surrounding module or function.
  const payments = await paymentQuery.select("amount refundedAmount paymentMethod transactionReference transactionId mpesaReceiptNumber updatedAt").lean();
  // Declare paid for use by the surrounding module or function.
  const paid = payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0);
  // Declare totalRefunded for use by the surrounding module or function.
  const totalRefunded = payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0);
  // Perform the side effect or state update expressed on the following line.
  invoice.amountPaid = Math.min(Number(invoice.totalAmount || 0), paid);
  // Perform the side effect or state update expressed on the following line.
  invoice.balance = Math.max(0, Number(invoice.totalAmount || 0) - invoice.amountPaid);
  // Perform the side effect or state update expressed on the following line.
  invoice.status = totalRefunded > 0 && invoice.amountPaid <= 0 ? "refunded" : invoice.balance <= 0 && invoice.totalAmount > 0 ? "paid" : invoice.amountPaid > 0 ? "partial" : "pending";
  // Declare latest for use by the surrounding module or function.
  const latest = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0];
  // Check the condition (latest) and run the matching branch.
  if (latest) invoice.paymentMethod = latest.paymentMethod || invoice.paymentMethod;
  // Check the condition (latest) and run the matching branch.
  if (latest) invoice.paymentReference = latest.mpesaReceiptNumber || latest.transactionReference || latest.transactionId || invoice.paymentReference;
  // Perform the side effect or state update expressed on the following line.
  await invoice.save(session ? { session } : undefined);
  // Return the value of invoice to the caller.
  return invoice;
};
