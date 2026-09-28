import "dotenv/config";
import mongoose from "mongoose";

const EXPECTED_HOST = "cluster0.cdtxzts.mongodb.net";
const EXPECTED_DATABASE = "husseindb";
const TENANT_SLUGS = ["hussein-mboya", "amani-trails", "demo-safari"];

function assertTarget() {
  if (process.env.CONFIRM_DEMO_DATA_REPAIR !== "YES") {
    throw new Error("Set CONFIRM_DEMO_DATA_REPAIR=YES to repair the verified synthetic demo records.");
  }
  const rawUri = String(process.env.MONGODB_URI || "");
  if (!rawUri) throw new Error("MONGODB_URI is required.");
  const target = new URL(rawUri);
  const database = decodeURIComponent(target.pathname.replace(/^\//, "").split("/")[0] || "");
  if (target.hostname.toLowerCase() !== EXPECTED_HOST || database !== EXPECTED_DATABASE) {
    throw new Error(`Refusing repair outside ${EXPECTED_DATABASE} on the configured demo Atlas cluster.`);
  }
}

const id = (value) => String(value || "");
const round = (value) => Math.round(Number(value || 0) * 100) / 100;
const DAY_MS = 24 * 60 * 60 * 1000;

function netPaid(payments) {
  return round(payments.reduce((sum, payment) => {
    if (!["completed", "refunded"].includes(payment.status)) return sum;
    return sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0));
  }, 0));
}

function paymentState(booking, payments, amountPaid) {
  if (booking.status === "refunded" || payments.some((payment) =>
    payment.status === "refunded" || payment.refundStatus === "completed")) return "refunded";
  if (amountPaid >= Number(booking.totalAmount || 0) && amountPaid > 0) return "paid";
  if (amountPaid > 0) return "partial";
  if (booking.status === "cancelled") return "cancelled";
  if (payments.some((payment) => payment.status === "failed")) return "failed";
  return "pending";
}

async function main() {
  assertTarget();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  const db = mongoose.connection.db;
  const tenants = await db.collection("organizations")
    .find({ slug: { $in: TENANT_SLUGS } }, { projection: { _id: 1, slug: 1 } }).toArray();
  if (tenants.length !== TENANT_SLUGS.length) throw new Error("Expected exactly the three known demo tenants; no records were changed.");

  const summary = [];
  for (const tenant of tenants) {
    const scope = { tenantId: tenant._id };
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
    if (bookings.length !== 12 || tours.length !== 12 || destinations.length !== 12 || customers.length !== 4
      || bookings.some((booking) => !/^(?:BK-|DEMO-)/.test(String(booking.bookingNumber || "")))) {
      throw new Error(`Unexpected demo fixture shape for ${tenant.slug}; no records were changed.`);
    }
    const bookingIds = new Set(bookings.map((booking) => id(booking._id)));
    const customerById = new Map(customers.map((customer) => [id(customer._id), customer]));
    const vehicleByTour = new Map(vehicles.filter((vehicle) => vehicle.assignedTour)
      .map((vehicle) => [id(vehicle.assignedTour), vehicle]));
    const tourById = new Map(tours.map((tour) => [id(tour._id), tour]));
    const paymentsByBooking = new Map();
    for (const payment of payments) {
      if (!payment.booking) continue;
      if (!bookingIds.has(id(payment.booking))) throw new Error(`Orphaned payment in ${tenant.slug}; no records were changed.`);
      const list = paymentsByBooking.get(id(payment.booking)) || [];
      list.push(payment);
      paymentsByBooking.set(id(payment.booking), list);
    }
    const eligibleBookings = bookings.filter((booking) => booking.status === "completed");
    if (reviews.length > eligibleBookings.length) throw new Error(`Review count exceeds completed bookings in ${tenant.slug}; no records were changed.`);
    const assignedReviews = new Set();
    const reviewTargets = [];
    for (const review of reviews) {
      const available = (booking) => !assignedReviews.has(id(booking._id));
      const target = eligibleBookings.find((booking) => available(booking)
        && id(booking.user) === id(review.user)
        && id(booking.tour) === id(review.tour))
        || eligibleBookings.find((booking) => available(booking)
          && id(booking.user) === id(review.user))
        || eligibleBookings.find(available);
      if (!target) throw new Error(`Could not safely relink a review to its matching completed booking in ${tenant.slug}; no records were changed.`);
      assignedReviews.add(id(target._id));
      reviewTargets.push({ review, booking: target });
    }

    for (const booking of bookings) {
      const bookingPayments = paymentsByBooking.get(id(booking._id)) || [];
      const amountPaid = Math.min(Number(booking.totalAmount || 0), netPaid(bookingPayments));
      const nextState = paymentState(booking, bookingPayments, amountPaid);
      const assignedVehicle = vehicleByTour.get(id(booking.tour));
      const bookingTour = tourById.get(id(booking.tour));
      const durationDays = Math.max(1, Number(bookingTour?.durationDetails?.days || bookingTour?.durationDays || 1));
      let travelDate = booking.travelDate ? new Date(booking.travelDate) : new Date();
      let completedAt = booking.completedAt || null;
      const now = new Date();
      if (booking.status === "completed") {
        if (travelDate.getTime() + durationDays * DAY_MS > now.getTime()) {
          travelDate = new Date(now.getTime() - (durationDays + 2) * DAY_MS);
        }
        completedAt = new Date(travelDate.getTime() + durationDays * DAY_MS);
      } else if (booking.status === "ongoing") {
        if (travelDate > now || travelDate.getTime() + durationDays * DAY_MS <= now.getTime()) {
          travelDate = new Date(now.getTime() - DAY_MS);
        }
        completedAt = null;
      } else if (["pending", "confirmed", "assigned"].includes(booking.status) && travelDate < now) {
        travelDate = new Date(now.getTime() + 8 * DAY_MS);
        completedAt = null;
      }
      const pickupTime = new Date(travelDate.getTime() + 8 * 60 * 60 * 1000);
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
      booking.amountPaid = amountPaid;
      booking.balanceAmount = round(Math.max(0, Number(booking.totalAmount || 0) - amountPaid));
      booking.travelDate = travelDate;
      booking.pickupTime = pickupTime;
      booking.completedAt = completedAt;
      const customerUserId = booking.user || customerById.get(id(booking.customer))?.user;
      for (const payment of bookingPayments) {
        await db.collection("payments").updateOne({ _id: payment._id, ...scope }, { $set: {
          ...(customerUserId ? { customer: customerUserId, user: customerUserId } : {}),
        } });
      }
      const invoice = await db.collection("invoices").findOne({ ...scope, booking: booking._id });
      if (invoice) await db.collection("invoices").updateOne({ _id: invoice._id, ...scope }, { $set: {
        amountPaid,
        balance: round(Math.max(0, Number(invoice.totalAmount || booking.totalAmount || 0) - amountPaid)),
        status: nextState === "refunded" ? "refunded" : amountPaid >= Number(invoice.totalAmount || 0) && amountPaid > 0 ? "paid" : amountPaid > 0 ? "partial" : "pending",
      } });
    }

    const bookingById = new Map(bookings.map((booking) => [id(booking._id), booking]));
    for (const reservation of await db.collection("hotelbookings").find({ ...scope, linkedBooking: { $ne: null } }).toArray()) {
      const booking = bookingById.get(id(reservation.linkedBooking));
      if (!booking) continue;
      const tripDays = Math.max(1, Number(tourById.get(id(booking.tour))?.durationDetails?.days || 1));
      await db.collection("hotelbookings").updateOne({ _id: reservation._id, ...scope }, { $set: {
        checkIn: booking.travelDate,
        checkOut: new Date(new Date(booking.travelDate).getTime() + tripDays * DAY_MS),
      } });
    }
    for (const reservation of await db.collection("airporttransferbookings").find({ ...scope, linkedBooking: { $ne: null } }).toArray()) {
      const booking = bookingById.get(id(reservation.linkedBooking));
      if (!booking) continue;
      await db.collection("airporttransferbookings").updateOne({ _id: reservation._id, ...scope }, { $set: {
        pickupDateTime: booking.pickupTime || booking.travelDate,
      } });
    }

    for (const quote of quotations) {
      const booking = bookings.find((row) => id(row.customer) === id(quote.customer)
        && id(row.tour) === id(quote.tour))
        || bookings.find((row) => id(row.customer) === id(quote.customer))
        || bookings.find((row) => id(row._id) === id(quote.booking))
        || bookings[0];
      if (!booking) throw new Error(`Converted quotation has no booking target in ${tenant.slug}; no further records were changed.`);
      const total = Number(booking.totalAmount || 0);
      const quantity = Math.max(1, Number(booking.numberOfGuests || 1));
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

    for (const customer of customers) {
      const customerBookings = bookings.filter((booking) => id(booking.customer) === id(customer._id));
      const totalSpent = round(customerBookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0));
      const dates = customerBookings.map((booking) => booking.createdAt).filter(Boolean).sort((a, b) => b - a);
      await db.collection("customers").updateOne({ _id: customer._id, ...scope }, { $set: {
        totalBookings: customerBookings.length,
        completedBookings: customerBookings.filter((booking) => booking.status === "completed").length,
        cancelledBookings: customerBookings.filter((booking) => booking.status === "cancelled").length,
        totalSpent,
        averageBookingValue: customerBookings.length ? round(totalSpent / customerBookings.length) : 0,
        lastBookingDate: dates[0] || null,
      } });
    }

    for (const { review, booking } of reviewTargets) {
      await db.collection("reviews").updateOne({ _id: review._id, ...scope }, { $set: {
        booking: booking._id,
        tour: booking.tour,
        user: booking.user,
        customer: booking.user,
      } });
    }

    const freshReviews = await db.collection("reviews").find({ ...scope, approved: true }).toArray();
    const freshBookings = await db.collection("bookings").find(scope).toArray();
    const reviewsByTour = new Map();
    for (const review of freshReviews) {
      const row = reviewsByTour.get(id(review.tour)) || { count: 0, ratingTotal: 0 };
      row.count += 1;
      row.ratingTotal += Number(review.rating || 0);
      reviewsByTour.set(id(review.tour), row);
    }
    const bookingsByTour = new Map();
    for (const booking of freshBookings) {
      const row = bookingsByTour.get(id(booking.tour)) || { total: 0, guests: 0 };
      row.total += 1;
      if (!["cancelled", "refunded"].includes(booking.status)) row.guests += Number(booking.numberOfGuests || 1);
      bookingsByTour.set(id(booking.tour), row);
    }
    const destinationStats = new Map();
    for (const tour of tours) {
      const key = id(tour.destination);
      const reviewStats = reviewsByTour.get(id(tour._id)) || { count: 0, ratingTotal: 0 };
      const bookingStats = bookingsByTour.get(id(tour._id)) || { total: 0, guests: 0 };
      const assignedVehicle = vehicleByTour.get(id(tour._id));
      const destination = destinationStats.get(key) || { totalTours: 0, totalBookings: 0, totalReviews: 0, ratingTotal: 0 };
      destination.totalTours += 1;
      destination.totalBookings += bookingStats.total;
      destination.totalReviews += reviewStats.count;
      destination.ratingTotal += reviewStats.ratingTotal;
      destinationStats.set(key, destination);
      const availability = (tour.availability || []).map((slot) => ({ ...slot, bookedSlots: bookingStats.guests }));
      await db.collection("tours").updateOne({ _id: tour._id, ...scope }, { $set: {
        totalBookings: bookingStats.total,
        totalReviews: reviewStats.count,
        averageRating: reviewStats.count ? round(reviewStats.ratingTotal / reviewStats.count) : 0,
        "availabilitySettings.bookedSlots": bookingStats.guests,
        availability,
        ...(assignedVehicle ? { assignedVehicle: assignedVehicle._id } : {}),
      } });
    }
    for (const [destinationId, stats] of destinationStats) {
      await db.collection("destinations").updateOne({ _id: new mongoose.Types.ObjectId(destinationId), ...scope }, { $set: {
        totalTours: stats.totalTours,
        totalBookings: stats.totalBookings,
        totalReviews: stats.totalReviews,
        averageRating: stats.totalReviews ? round(stats.ratingTotal / stats.totalReviews) : 0,
      } });
    }
    summary.push({ tenant: tenant.slug, bookings: bookings.length, payments: payments.length, reviews: reviews.length, tours: tours.length, destinations: destinations.length });
  }
  console.log(JSON.stringify({ success: true, database: mongoose.connection.name, tenants: summary }, null, 2));
}

main().catch((error) => {
  console.error(`Demo data reconciliation failed: ${String(error.message || error).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, "[MongoDB URI redacted]")}`);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect().catch(() => {}));
