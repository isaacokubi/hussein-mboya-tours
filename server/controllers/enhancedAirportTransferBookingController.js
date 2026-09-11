import AirportTransfer from "../models/AirportTransfer.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Customer from "../models/Customer.js";
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
const clean = (value) => String(value ?? "").trim();
const bookingReference = () => `TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

async function resolveCustomer(req, body) {
  if (!req.user?._id) return null;

  const tenantId = tenantIdOf(req);
  let customer = await Customer.findOne({ tenantId, user: req.user._id });
  if (customer) return customer;

  const nameParts = clean(body.passengerName || req.user.name || "Guest")
    .split(/\s+/)
    .filter(Boolean);
  const firstName = clean(body.firstName || req.user.firstName || nameParts[0] || "Guest");
  const lastName = clean(body.lastName || req.user.lastName || nameParts.slice(1).join(" ") || "Customer");
  const phone = clean(body.passengerPhone || body.phone || req.user.phone);

  if (!phone) return null;

  return Customer.create({
    tenantId,
    user: req.user._id,
    firstName,
    lastName,
    email: clean(body.passengerEmail || body.email || req.user.email),
    phone,
    createdBy: req.user._id,
    updatedBy: req.user._id,
  });
}

export async function createEnhancedTransferBooking(req, res, next) {
  try {
    const tenantId = tenantIdOf(req);
    const { transferId } = req.body;

    if (!tenantId || !transferId) {
      return res.status(400).json({
        success: false,
        message: "Transfer and tenant context are required.",
      });
    }

    const transfer = await AirportTransfer.findOne({
      _id: transferId,
      tenantId,
      status: "active",
    }).lean();

    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfer service not found." });
    }

    const passengers = Number(req.body.passengers || 1);
    const luggage = Number(req.body.luggage || 0);
    const pickupDateTime = new Date(req.body.pickupDateTime);
    const arrivalDateTime = req.body.flightArrivalDateTime
      ? new Date(req.body.flightArrivalDateTime)
      : null;
    const departureDateTime = req.body.flightDepartureDateTime
      ? new Date(req.body.flightDepartureDateTime)
      : null;
    const childSeats = Number(req.body.childSeats || 0);
    const boosterSeats = Number(req.body.boosterSeats || 0);

    if (!Number.isInteger(passengers) || passengers < 1 || passengers > Number(transfer.passengerCapacity || 0)) {
      return res.status(400).json({
        success: false,
        message: `This vehicle supports up to ${transfer.passengerCapacity} passenger(s).`,
      });
    }

    if (!Number.isInteger(luggage) || luggage < 0 || luggage > Number(transfer.luggageCapacity || 0)) {
      return res.status(400).json({
        success: false,
        message: `This vehicle supports up to ${transfer.luggageCapacity} luggage item(s).`,
      });
    }

    if (Number.isNaN(pickupDateTime.getTime())) {
      return res.status(400).json({ success: false, message: "A valid pickup date and time are required." });
    }

    if (arrivalDateTime && Number.isNaN(arrivalDateTime.getTime())) {
      return res.status(400).json({ success: false, message: "Enter a valid flight arrival time." });
    }

    if (departureDateTime && Number.isNaN(departureDateTime.getTime())) {
      return res.status(400).json({ success: false, message: "Enter a valid flight departure time." });
    }

    if (childSeats < 0 || boosterSeats < 0 || childSeats + boosterSeats > passengers) {
      return res.status(400).json({
        success: false,
        message: "Child and booster seats cannot exceed passenger count.",
      });
    }

    const customer = await resolveCustomer(req, req.body);

    if (req.user?.role === "customer" && !customer) {
      return res.status(400).json({
        success: false,
        message: "A passenger phone number is required to complete the booking.",
      });
    }

    const basePrice = Number(transfer.price || 0);
    const subtotal = transfer.pricingModel === "per_passenger" ? basePrice * passengers : basePrice;
    const taxes = Number(req.body.taxes || 0);
    const fees = Number(req.body.fees || 0);
    const totalAmount = subtotal + taxes + fees;

    const booking = await AirportTransferBooking.create({
      tenantId,
      reference: bookingReference(),
      transfer: transfer._id,
      customer: customer?._id || null,
      user: req.user?._id || null,
      linkedBooking: req.body.linkedBooking || null,
      pickupDateTime,
      pickupLocation: clean(req.body.pickupLocation || transfer.pickupLocation),
      dropoffLocation: clean(req.body.dropoffLocation || transfer.dropoffLocation),
      flightNumber: clean(req.body.flightNumber),
      airline: clean(req.body.airline),
      terminal: clean(req.body.terminal),
      flightArrivalDateTime: arrivalDateTime,
      flightDepartureDateTime: departureDateTime,
      meetAndGreet: req.body.meetAndGreet !== false,
      signboardName: clean(req.body.signboardName || req.body.passengerName),
      whatsappContact: clean(req.body.whatsappContact || req.body.passengerPhone),
      childSeats,
      boosterSeats,
      wheelchairAccessible: Boolean(req.body.wheelchairAccessible),
      accommodationName: clean(req.body.accommodationName),
      passengerName: clean(req.body.passengerName),
      passengerPhone: clean(req.body.passengerPhone),
      passengerEmail: clean(req.body.passengerEmail),
      passengers,
      luggage,
      specialRequests: clean(req.body.specialRequests),
      status: "pending",
      paymentStatus: "pending",
      subtotal,
      taxes,
      fees,
      totalAmount,
      currency: transfer.currency || "KES",
      source: req.body.source || "website",
      notes: clean(req.body.notes),
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    const invoice = await ensureHospitalityInvoice({ type: "airport_transfer", booking });

    return res.status(201).json({
      success: true,
      data: booking,
      invoice: invoice || null,
      paymentRequired: totalAmount > 0,
    });
  } catch (error) {
    return next(error);
  }
}
