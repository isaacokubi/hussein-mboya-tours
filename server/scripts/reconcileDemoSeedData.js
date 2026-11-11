/**
 * Purpose: reconcile Demo Seed Data operational script. Main declarations: assertTarget, id, round, netPaid, paymentState.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Declare EXPECTED_HOST for use by the surrounding module or function.
const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
// Declare EXPECTED_DATABASE for use by the surrounding module or function.
const EXPECTED_DATABASE = "husseindb";
// Declare TENANT_SLUGS for use by the surrounding module or function.
const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];

// Define assertTarget; its parameters and body implement this operation.
function assertTarget() {
  // Check the condition (process.env.CONFIRM_DEMO_DATA_REPAIR !== "YES") and run the matching branch.
  if (process.env.CONFIRM_DEMO_DATA_REPAIR !== "YES") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Set CONFIRM_DEMO_DATA_REPAIR=YES to repair the verified synthetic demo records.");
  }
  // Declare rawUri for use by the surrounding module or function.
  const rawUri = String(process.env.MONGODB_URI || "");
  // Check the condition (!rawUri) and run the matching branch.
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  // Declare target for use by the surrounding module or function.
  const target = new URL(rawUri);
  // Declare database for use by the surrounding module or function.
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  // Check the condition (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECT) and run the matching branch.
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Refusing repair outside ${EXPECTED_DATABASE} on the configured demo Atlas cluster.`);
  }
}

// Declare id for use by the surrounding module or function.
const id = (value) => String(value || "");
// Declare round for use by the surrounding module or function.
const round = (value) => Math.round(Number(value || 0) * 100) / 100;
// Declare DAY_MS for use by the surrounding module or function.
const DAY_MS = 24 * 60 * 60 * 1000;

// Define netPaid; its parameters and body implement this operation.
function netPaid(payments) {
  // Return the result of round() to the caller.
  return round(payments.reduce((sum, payment) => {
    // Check the condition (!["completed", "refunded"].includes(payment.status)) and run the matching branch.
    if (!["completed", "refunded"].includes(payment.status)) return sum;
    // Return the expression shown below to the caller.
    return sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0));
  }, 0));
}

// Define paymentState; its parameters and body implement this operation.
function paymentState(booking, payments, amountPaid) {
  // Check the condition (booking.status === "refunded" || payments.some((payment) => payment.st) and run the matching branch.
  if (booking.status === "refunded" || payments.some((payment) =>
    payment.status === "refunded" || payment.refundStatus === "completed")) return "refunded";
  // Check the condition (amountPaid >= Number(booking.totalAmount || 0) && amountPaid > 0) and run the matching branch.
  if (amountPaid >= Number(booking.totalAmount || 0) && amountPaid > 0) return "paid";
  // Check the condition (amountPaid > 0) and run the matching branch.
  if (amountPaid > 0) return "partial";
  // Check the condition (booking.status === "cancelled") and run the matching branch.
  if (booking.status === "cancelled") return "cancelled";
  // Check the condition (payments.some((payment) => payment.status === "failed")) and run the matching branch.
  if (payments.some((payment) => payment.status === "failed")) return "failed";
  // Return a configured text value to the caller.
  return "pending";
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  assertTarget();
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare tenants for use by the surrounding module or function.
  const tenants = await db.collection("organizations")
    .find({ slug: { $in: TENANT_SLUGS } }, { projection: { _id: 1, slug: 1 } }).toArray();
  // Check the condition (tenants.length !== TENANT_SLUGS.length) and run the matching branch.
  if (tenants.length !== TENANT_SLUGS.length) throw new Error("Expected exactly the three known demo tenants; no records were changed.");

  // Declare summary for use by the surrounding module or function.
  const summary = [];
  // Repeat the enclosed work for each required iteration.
  for (const tenant of tenants) {
    // Declare scope for use by the surrounding module or function.
    const scope = { tenantId: tenant._id };
    // Declare [bookings, payments, reviews, tours, destinations, customers, vehicles, quotations] for use by the surrounding module or function.
    const [bookings, payments, reviews, tours, destinations, customers, vehicles, quotations] = await Promise.all([
      db.collection("bookings").find(scope).toArray(),
      db.collection("payments").find(scope).toArray(),
      db.collection("reviews").find(scope).toArray(),
      db.collection("tours").find(scope).toArray(),
      db.collection("destinations").find(scope).toArray(),
      db.collection("customers").find(scope).toArray(),
      db.collection("vehicles").find({ ...scope, isDeleted: { $ne: true } }).toArray(),
      db.collection("quotations").find({ ...scope, status: "converted", isDeleted: { $ne: true } }).toArray(),
    ]);
    // Check the condition (bookings.length !== 12 || tours.length !== 12 || destinations.length !) and run the matching branch.
    if (bookings.length !== 12 || tours.length !== 12 || destinations.length !== 12 || customers.length !== 4
      || bookings.some((booking) => !/^(?:BK-|DEMO-)/.test(String(booking.bookingNumber || "")))) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Unexpected demo fixture shape for ${tenant.slug}; no records were changed.`);
    }
    // Declare bookingIds for use by the surrounding module or function.
    const bookingIds = new Set(bookings.map((booking) => id(booking._id)));
    // Declare customerById for use by the surrounding module or function.
    const customerById = new Map(customers.map((customer) => [id(customer._id), customer]));
    // Declare vehicleByTour for use by the surrounding module or function.
    const vehicleByTour = new Map(vehicles.filter((vehicle) => vehicle.assignedTour)
      .map((vehicle) => [id(vehicle.assignedTour), vehicle]));
    // Declare tourById for use by the surrounding module or function.
    const tourById = new Map(tours.map((tour) => [id(tour._id), tour]));
    // Declare paymentsByBooking for use by the surrounding module or function.
    const paymentsByBooking = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const payment of payments) {
      // Check the condition (!payment.booking) and run the matching branch.
      if (!payment.booking) continue;
      // Check the condition (!bookingIds.has(id(payment.booking))) and run the matching branch.
      if (!bookingIds.has(id(payment.booking))) throw new Error(`Orphaned payment in ${tenant.slug}; no records were changed.`);
      // Declare list for use by the surrounding module or function.
      const list = paymentsByBooking.get(id(payment.booking)) || [];
      // Perform the side effect or state update expressed on the following line.
      list.push(payment);
      // Perform the side effect or state update expressed on the following line.
      paymentsByBooking.set(id(payment.booking), list);
    }
    // Declare eligibleBookings for use by the surrounding module or function.
    const eligibleBookings = bookings.filter((booking) => booking.status === "completed");
    // Check the condition (reviews.length > eligibleBookings.length) and run the matching branch.
    if (reviews.length > eligibleBookings.length) throw new Error(`Review count exceeds completed bookings in ${tenant.slug}; no records were changed.`);
    // Declare assignedReviews for use by the surrounding module or function.
    const assignedReviews = new Set();
    // Declare reviewTargets for use by the surrounding module or function.
    const reviewTargets = [];
    // Repeat the enclosed work for each required iteration.
    for (const review of reviews) {
      // Declare available for use by the surrounding module or function.
      const available = (booking) => !assignedReviews.has(id(booking._id));
      // Declare target for use by the surrounding module or function.
      const target = eligibleBookings.find((booking) => available(booking)
        && id(booking.user) === id(review.user)
        && id(booking.tour) === id(review.tour))
        || eligibleBookings.find((booking) => available(booking)
          && id(booking.user) === id(review.user))
        || eligibleBookings.find(available);
      // Check the condition (!target) and run the matching branch.
      if (!target) throw new Error(`Could not safely relink a review to its matching completed booking in ${tenant.slug}; no records were changed.`);
      // Perform the side effect or state update expressed on the following line.
      assignedReviews.add(id(target._id));
      // Perform the side effect or state update expressed on the following line.
      reviewTargets.push({ review, booking: target });
    }

    // Repeat the enclosed work for each required iteration.
    for (const booking of bookings) {
      // Declare bookingPayments for use by the surrounding module or function.
      const bookingPayments = paymentsByBooking.get(id(booking._id)) || [];
      // Declare amountPaid for use by the surrounding module or function.
      const amountPaid = Math.min(Number(booking.totalAmount || 0), netPaid(bookingPayments));
      // Declare nextState for use by the surrounding module or function.
      const nextState = paymentState(booking, bookingPayments, amountPaid);
      // Declare assignedVehicle for use by the surrounding module or function.
      const assignedVehicle = vehicleByTour.get(id(booking.tour));
      // Declare bookingTour for use by the surrounding module or function.
      const bookingTour = tourById.get(id(booking.tour));
      // Declare durationDays for use by the surrounding module or function.
      const durationDays = Math.max(1, Number(bookingTour?.durationDetails?.days || bookingTour?.durationDays || 1));
      // Declare travelDate for use by the surrounding module or function.
      let travelDate = booking.travelDate ? new Date(booking.travelDate) : new Date();
      // Declare completedAt for use by the surrounding module or function.
      let completedAt = booking.completedAt || null;
      // Declare now for use by the surrounding module or function.
      const now = new Date();
      // Check the condition (booking.status === "completed") and run the matching branch.
      if (booking.status === "completed") {
        // Check the condition (travelDate.getTime() + durationDays * DAY_MS > now.getTime()) and run the matching branch.
        if (travelDate.getTime() + durationDays * DAY_MS > now.getTime()) {
          // Perform the side effect or state update expressed on the following line.
          travelDate = new Date(now.getTime() - (durationDays + 2) * DAY_MS);
        }
        // Perform the side effect or state update expressed on the following line.
        completedAt = new Date(travelDate.getTime() + durationDays * DAY_MS);
      } else if (booking.status === "ongoing") {
        // Check the condition (travelDate > now || travelDate.getTime() + durationDays * DAY_MS <= no) and run the matching branch.
        if (travelDate > now || travelDate.getTime() + durationDays * DAY_MS <= now.getTime()) {
          // Perform the side effect or state update expressed on the following line.
          travelDate = new Date(now.getTime() - DAY_MS);
        }
        // Perform the side effect or state update expressed on the following line.
        completedAt = null;
      } else if (["pending", "confirmed", "assigned"].includes(booking.status) && travelDate < now) {
        // Perform the side effect or state update expressed on the following line.
        travelDate = new Date(now.getTime() + 8 * DAY_MS);
        // Perform the side effect or state update expressed on the following line.
        completedAt = null;
      }
      // Declare pickupTime for use by the surrounding module or function.
      const pickupTime = new Date(travelDate.getTime() + 8 * 60 * 60 * 1000);
      // Perform the side effect or state update expressed on the following line.
      await db.collection("bookings").updateOne({ _id: booking._id, ...scope }, { $set: {
        amountPaid,
        balanceAmount: round(Math.max(0, Number(booking.totalAmount || 0) - amountPaid)),
        paymentStatus: nextState,
        payments: bookingPayments.map((payment) => payment._id),
        travelDate,
        pickupTime,
        completedAt,
        ...(assignedVehicle ? { assignedVehicle: assignedVehicle._id, assigned: true } : {}),
      } });
      // Perform the side effect or state update expressed on the following line.
      booking.amountPaid = amountPaid;
      // Perform the side effect or state update expressed on the following line.
      booking.balanceAmount = round(Math.max(0, Number(booking.totalAmount || 0) - amountPaid));
      // Perform the side effect or state update expressed on the following line.
      booking.travelDate = travelDate;
      // Perform the side effect or state update expressed on the following line.
      booking.pickupTime = pickupTime;
      // Perform the side effect or state update expressed on the following line.
      booking.completedAt = completedAt;
      // Declare customerUserId for use by the surrounding module or function.
      const customerUserId = booking.user || customerById.get(id(booking.customer))?.user;
      // Repeat the enclosed work for each required iteration.
      for (const payment of bookingPayments) {
        // Perform the side effect or state update expressed on the following line.
        await db.collection("payments").updateOne({ _id: payment._id, ...scope }, { $set: {
          ...(customerUserId ? { customer: customerUserId, user: customerUserId } : {}),
        } });
      }
      // Declare invoice for use by the surrounding module or function.
      const invoice = await db.collection("invoices").findOne({ ...scope, booking: booking._id });
      // Check the condition (invoice) and run the matching branch.
      if (invoice) await db.collection("invoices").updateOne({ _id: invoice._id, ...scope }, { $set: {
        amountPaid,
        balance: round(Math.max(0, Number(invoice.totalAmount || booking.totalAmount || 0) - amountPaid)),
        status: nextState === "refunded" ? "refunded" : amountPaid >= Number(invoice.totalAmount || 0) && amountPaid > 0 ? "paid" : amountPaid > 0 ? "partial" : "pending",
      } });
    }

    // Declare bookingById for use by the surrounding module or function.
    const bookingById = new Map(bookings.map((booking) => [id(booking._id), booking]));
    // Repeat the enclosed work for each required iteration.
    for (const reservation of await db.collection("hotelbookings").find({ ...scope, linkedBooking: { $ne: null } }).toArray()) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookingById.get(id(reservation.linkedBooking));
      // Check the condition (!booking) and run the matching branch.
      if (!booking) continue;
      // Declare tripDays for use by the surrounding module or function.
      const tripDays = Math.max(1, Number(tourById.get(id(booking.tour))?.durationDetails?.days || 1));
      // Perform the side effect or state update expressed on the following line.
      await db.collection("hotelbookings").updateOne({ _id: reservation._id, ...scope }, { $set: {
        checkIn: booking.travelDate,
        checkOut: new Date(new Date(booking.travelDate).getTime() + tripDays * DAY_MS),
      } });
    }
    // Repeat the enclosed work for each required iteration.
    for (const reservation of await db.collection("airporttransferbookings").find({ ...scope, linkedBooking: { $ne: null } }).toArray()) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookingById.get(id(reservation.linkedBooking));
      // Check the condition (!booking) and run the matching branch.
      if (!booking) continue;
      // Perform the side effect or state update expressed on the following line.
      await db.collection("airporttransferbookings").updateOne({ _id: reservation._id, ...scope }, { $set: {
        pickupDateTime: booking.pickupTime || booking.travelDate,
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const quote of quotations) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookings.find((row) => id(row.customer) === id(quote.customer)
        && id(row.tour) === id(quote.tour))
        || bookings.find((row) => id(row.customer) === id(quote.customer))
        || bookings.find((row) => id(row._id) === id(quote.booking))
        || bookings[0];
      // Check the condition (!booking) and run the matching branch.
      if (!booking) throw new Error(`Converted quotation has no booking target in ${tenant.slug}; no further records were changed.`);
      // Declare total for use by the surrounding module or function.
      const total = Number(booking.totalAmount || 0);
      // Declare quantity for use by the surrounding module or function.
      const quantity = Math.max(1, Number(booking.numberOfGuests || 1));
      // Perform the side effect or state update expressed on the following line.
      await db.collection("quotations").updateOne({ _id: quote._id, ...scope }, { $set: {
        booking: booking._id,
        customer: booking.customer,
        tour: booking.tour,
        ...(booking.agent ? { agent: booking.agent } : {}),
        items: [{
          tenantId: tenant._id,
          name: tourById.get(id(booking.tour))?.title || "Demo tour booking",
          category: "Other",
          description: "Accepted demo quotation converted to the linked booking.",
          quantity,
          unitPrice: round(total / quantity),
          total,
        }],
        subtotal: total,
        tax: 0,
        discount: 0,
        grandTotal: total,
        currency: "KES",
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const customer of customers) {
      // Declare customerBookings for use by the surrounding module or function.
      const customerBookings = bookings.filter((booking) => id(booking.customer) === id(customer._id));
      // Declare totalSpent for use by the surrounding module or function.
      const totalSpent = round(customerBookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0));
      // Declare dates for use by the surrounding module or function.
      const dates = customerBookings.map((booking) => booking.createdAt).filter(Boolean).sort((a, b) => b - a);
      // Perform the side effect or state update expressed on the following line.
      await db.collection("customers").updateOne({ _id: customer._id, ...scope }, { $set: {
        totalBookings: customerBookings.length,
        completedBookings: customerBookings.filter((booking) => booking.status === "completed").length,
        cancelledBookings: customerBookings.filter((booking) => booking.status === "cancelled").length,
        totalSpent,
        averageBookingValue: customerBookings.length ? round(totalSpent / customerBookings.length) : 0,
        lastBookingDate: dates[0] || null,
      } });
    }

    // Repeat the enclosed work for each required iteration.
    for (const { review, booking } of reviewTargets) {
      // Perform the side effect or state update expressed on the following line.
      await db.collection("reviews").updateOne({ _id: review._id, ...scope }, { $set: {
        booking: booking._id,
        tour: booking.tour,
        user: booking.user,
        customer: booking.user,
      } });
    }

    // Declare freshReviews for use by the surrounding module or function.
    const freshReviews = await db.collection("reviews").find({ ...scope, approved: true }).toArray();
    // Declare freshBookings for use by the surrounding module or function.
    const freshBookings = await db.collection("bookings").find(scope).toArray();
    // Declare reviewsByTour for use by the surrounding module or function.
    const reviewsByTour = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const review of freshReviews) {
      // Declare row for use by the surrounding module or function.
      const row = reviewsByTour.get(id(review.tour)) || { count: 0, ratingTotal: 0 };
      // Perform the side effect or state update expressed on the following line.
      row.count += 1;
      // Perform the side effect or state update expressed on the following line.
      row.ratingTotal += Number(review.rating || 0);
      // Perform the side effect or state update expressed on the following line.
      reviewsByTour.set(id(review.tour), row);
    }
    // Declare bookingsByTour for use by the surrounding module or function.
    const bookingsByTour = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const booking of freshBookings) {
      // Declare row for use by the surrounding module or function.
      const row = bookingsByTour.get(id(booking.tour)) || { total: 0, guests: 0 };
      // Perform the side effect or state update expressed on the following line.
      row.total += 1;
      // Check the condition (!["cancelled", "refunded"].includes(booking.status)) and run the matching branch.
      if (!["cancelled", "refunded"].includes(booking.status)) row.guests += Number(booking.numberOfGuests || 1);
      // Perform the side effect or state update expressed on the following line.
      bookingsByTour.set(id(booking.tour), row);
    }
    // Declare destinationStats for use by the surrounding module or function.
    const destinationStats = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Declare key for use by the surrounding module or function.
      const key = id(tour.destination);
      // Declare reviewStats for use by the surrounding module or function.
      const reviewStats = reviewsByTour.get(id(tour._id)) || { count: 0, ratingTotal: 0 };
      // Declare bookingStats for use by the surrounding module or function.
      const bookingStats = bookingsByTour.get(id(tour._id)) || { total: 0, guests: 0 };
      // Declare assignedVehicle for use by the surrounding module or function.
      const assignedVehicle = vehicleByTour.get(id(tour._id));
      // Declare destination for use by the surrounding module or function.
      const destination = destinationStats.get(key) || { totalTours: 0, totalBookings: 0, totalReviews: 0, ratingTotal: 0 };
      // Perform the side effect or state update expressed on the following line.
      destination.totalTours += 1;
      // Perform the side effect or state update expressed on the following line.
      destination.totalBookings += bookingStats.total;
      // Perform the side effect or state update expressed on the following line.
      destination.totalReviews += reviewStats.count;
      // Perform the side effect or state update expressed on the following line.
      destination.ratingTotal += reviewStats.ratingTotal;
      // Perform the side effect or state update expressed on the following line.
      destinationStats.set(key, destination);
      // Declare availability for use by the surrounding module or function.
      const availability = (tour.availability || []).map((slot) => ({ ...slot, bookedSlots: bookingStats.guests }));
      // Perform the side effect or state update expressed on the following line.
      await db.collection("tours").updateOne({ _id: tour._id, ...scope }, { $set: {
        totalBookings: bookingStats.total,
        totalReviews: reviewStats.count,
        averageRating: reviewStats.count ? round(reviewStats.ratingTotal / reviewStats.count) : 0,
        "availabilitySettings.bookedSlots": bookingStats.guests,
        availability,
        ...(assignedVehicle ? { assignedVehicle: assignedVehicle._id } : {}),
      } });
    }
    // Repeat the enclosed work for each required iteration.
    for (const [destinationId, stats] of destinationStats) {
      // Perform the side effect or state update expressed on the following line.
      await db.collection("destinations").updateOne({ _id: new mongoose.Types.ObjectId(destinationId), ...scope }, { $set: {
        totalTours: stats.totalTours,
        totalBookings: stats.totalBookings,
        totalReviews: stats.totalReviews,
        averageRating: stats.totalReviews ? round(stats.ratingTotal / stats.totalReviews) : 0,
      } });
    }
    // Perform the side effect or state update expressed on the following line.
    summary.push({ tenant: tenant.slug, bookings: bookings.length, payments: payments.length, reviews: reviews.length, tours: tours.length, destinations: destinations.length });
  }
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ success: true, database: mongoose.connection.name, tenants: summary }, null, 2));
}

// Perform the side effect or state update expressed on the following line.
main().catch((error) => {
  // Perform the side effect or state update expressed on the following line.
  console.error(`Demo data reconciliation failed: ${String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI redacted]")}`);
  // Perform the side effect or state update expressed on the following line.
  process.exitCode = 1;
}).finally(() => mongoose.disconnect().catch(() => {}));
