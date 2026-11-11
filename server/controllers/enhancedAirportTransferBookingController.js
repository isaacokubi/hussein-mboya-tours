/**
 * Purpose: enhanced Airport Transfer Booking Controller HTTP controller. Main declarations: tenantIdOf, clean, bookingReference, resolveCustomer, createEnhancedTransferBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import AirportTransfer from "../models/AirportTransfer.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../services/hospitalityInvoiceService.js so this module can use its exported dependencies.
import { ensureHospitalityInvoice } from "../services/hospitalityInvoiceService.js";

// Declare tenantIdOf for use by the surrounding module or function.
const tenantIdOf = (req) => req.tenantId || req.user?.tenantId;
// Declare clean for use by the surrounding module or function.
const clean = (value) => String(value ?? "").trim();
// Declare bookingReference for use by the surrounding module or function.
const bookingReference = () => `TRF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// Define resolveCustomer; its parameters and body implement this operation.
async function resolveCustomer(req, body) {
  // Check the condition (!req.user?._id) and run the matching branch.
  if (!req.user?._id) return null;

  // Declare tenantId for use by the surrounding module or function.
  const tenantId = tenantIdOf(req);
  // Declare customer for use by the surrounding module or function.
  let customer = await Customer.findOne({ tenantId, user: req.user._id });
  // Check the condition (customer) and run the matching branch.
  if (customer) return customer;

  // Declare nameParts for use by the surrounding module or function.
  const nameParts = clean(body.passengerName || req.user.name || "Guest")
    .split(/\s+/)
    .filter(Boolean);
  // Declare firstName for use by the surrounding module or function.
  const firstName = clean(body.firstName || req.user.firstName || nameParts[0] || "Guest");
  // Declare lastName for use by the surrounding module or function.
  const lastName = clean(body.lastName || req.user.lastName || nameParts.slice(1).join(" ") || "Customer");
  // Declare phone for use by the surrounding module or function.
  const phone = clean(body.passengerPhone || body.phone || req.user.phone);

  // Check the condition (!phone) and run the matching branch.
  if (!phone) return null;

  // Return the result of Customer.create() to the caller.
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

// Define createEnhancedTransferBooking; its parameters and body implement this operation.
export async function createEnhancedTransferBooking(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = tenantIdOf(req);
    // Declare { transferId } for use by the surrounding module or function.
    const { transferId } = req.body;

    // Check the condition (!tenantId || !transferId) and run the matching branch.
    if (!tenantId || !transferId) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Transfer and tenant context are required.",
      });
    }

    // Declare transfer for use by the surrounding module or function.
    const transfer = await AirportTransfer.findOne({
      _id: transferId,
      tenantId,
      status: "active",
    }).lean();

    // Check the condition (!transfer) and run the matching branch.
    if (!transfer) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({ success: false, message: "Transfer service not found." });
    }

    // Declare passengers for use by the surrounding module or function.
    const passengers = Number(req.body.passengers || 1);
    // Declare luggage for use by the surrounding module or function.
    const luggage = Number(req.body.luggage || 0);
    // Declare pickupDateTime for use by the surrounding module or function.
    const pickupDateTime = new Date(req.body.pickupDateTime);
    // Declare arrivalDateTime for use by the surrounding module or function.
    const arrivalDateTime = req.body.flightArrivalDateTime
      ? new Date(req.body.flightArrivalDateTime)
      : null;
    // Declare departureDateTime for use by the surrounding module or function.
    const departureDateTime = req.body.flightDepartureDateTime
      ? new Date(req.body.flightDepartureDateTime)
      : null;
    // Declare childSeats for use by the surrounding module or function.
    const childSeats = Number(req.body.childSeats || 0);
    // Declare boosterSeats for use by the surrounding module or function.
    const boosterSeats = Number(req.body.boosterSeats || 0);

    // Check the condition (!Number.isInteger(passengers) || passengers < 1 || passengers > Number) and run the matching branch.
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > Number(transfer.passengerCapacity || 0)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `This vehicle supports up to ${transfer.passengerCapacity} passenger(s).`,
      });
    }

    // Check the condition (!Number.isInteger(luggage) || luggage < 0 || luggage > Number(transfer) and run the matching branch.
    if (!Number.isInteger(luggage) || luggage < 0 || luggage > Number(transfer.luggageCapacity || 0)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: `This vehicle supports up to ${transfer.luggageCapacity} luggage item(s).`,
      });
    }

    // Check the condition (Number.isNaN(pickupDateTime.getTime())) and run the matching branch.
    if (Number.isNaN(pickupDateTime.getTime())) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "A valid pickup date and time are required." });
    }

    // Check the condition (arrivalDateTime && Number.isNaN(arrivalDateTime.getTime())) and run the matching branch.
    if (arrivalDateTime && Number.isNaN(arrivalDateTime.getTime())) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Enter a valid flight arrival time." });
    }

    // Check the condition (departureDateTime && Number.isNaN(departureDateTime.getTime())) and run the matching branch.
    if (departureDateTime && Number.isNaN(departureDateTime.getTime())) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Enter a valid flight departure time." });
    }

    // Check the condition (childSeats < 0 || boosterSeats < 0 || childSeats + boosterSeats > pass) and run the matching branch.
    if (childSeats < 0 || boosterSeats < 0 || childSeats + boosterSeats > passengers) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Child and booster seats cannot exceed passenger count.",
      });
    }

    // Declare customer for use by the surrounding module or function.
    const customer = await resolveCustomer(req, req.body);

    // Check the condition (req.user?.role === "customer" && !customer) and run the matching branch.
    if (req.user?.role === "customer" && !customer) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "A passenger phone number is required to complete the booking.",
      });
    }

    // Declare basePrice for use by the surrounding module or function.
    const basePrice = Number(transfer.price || 0);
    // Declare subtotal for use by the surrounding module or function.
    const subtotal = transfer.pricingModel === "per_passenger" ? basePrice * passengers : basePrice;
    // Declare taxes for use by the surrounding module or function.
    const taxes = Number(req.body.taxes || 0);
    // Declare fees for use by the surrounding module or function.
    const fees = Number(req.body.fees || 0);
    // Declare totalAmount for use by the surrounding module or function.
    const totalAmount = subtotal + taxes + fees;

    // Declare booking for use by the surrounding module or function.
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

    // Declare invoice for use by the surrounding module or function.
    const invoice = await ensureHospitalityInvoice({ type: "airport_transfer", booking });

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      data: booking,
      invoice: invoice || null,
      paymentRequired: totalAmount > 0,
    });
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
}
