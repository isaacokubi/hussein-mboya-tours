/**
 * Purpose: hospitality Developer Seed database seed module. Main declarations: daysFromNow, clean, seedTenant, guestFromCustomer, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load node:crypto so this module can use its exported dependencies.
import crypto from "node:crypto";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Hotel.js so this module can use its exported dependencies.
import Hotel from "../models/Hotel.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/HospitalityRatePlan.js so this module can use its exported dependencies.
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransfer.js so this module can use its exported dependencies.
import AirportTransfer from "../models/AirportTransfer.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";
// Load ../models/ApiKey.js so this module can use its exported dependencies.
import ApiKey from "../models/ApiKey.js";
// Load ../models/Webhook.js so this module can use its exported dependencies.
import Webhook from "../models/Webhook.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { protectWebhookSecret } from "../services/webhookDeliveryService.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare daysFromNow for use by the surrounding module or function.
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
// Declare clean for use by the surrounding module or function.
const clean = (v) => String(v || "").trim();

// Define seedTenant; its parameters and body implement this operation.
async function seedTenant(tenant, tenantIndex) {
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {
    // Declare [users, customers, bookings] for use by the surrounding module or function.
    const [users, customers, bookings] = await Promise.all([
      User.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(100).lean(),
      Customer.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).limit(30).lean(),
      Booking.find({ tenantId: tenant._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    // Declare actor for use by the surrounding module or function.
    const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(clean(u.role).toLowerCase())) || users[0] || null;
    // Declare customer for use by the surrounding module or function.
    const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;
    // Declare linkedBooking for use by the surrounding module or function.
    const linkedBooking = bookings[tenantIndex % Math.max(bookings.length, 1)] || null;

    // Declare hotelDefs for use by the surrounding module or function.
    const hotelDefs = [
      { name: "Global Demo Nairobi Hotel", slug: "global-demo-nairobi-hotel", city: "Nairobi", county: "Nairobi", stars: 4, featured: true },
      { name: "Global Demo Coast Resort", slug: "global-demo-coast-resort", city: "Mombasa", county: "Mombasa", stars: 5, featured: true },
    ];
    // Declare hotels for use by the surrounding module or function.
    const hotels = [];
    // Repeat the enclosed work for each required iteration.
    for (const d of hotelDefs) {
      // Declare hotel for use by the surrounding module or function.
      const hotel = await Hotel.findOneAndUpdate(
        { tenantId: tenant._id, slug: d.slug },
        { $set: {
          name: d.name, description: "Synthetic hotel inventory for Global Tours dashboard demonstration.",
          location: d.city, address: `${d.city} demo hospitality district`, city: d.city, county: d.county,
          country: "Kenya", starRating: d.stars, featured: d.featured,
          amenities: ["Wi-Fi", "24-hour reception", "Restaurant", "Airport transfer", "Housekeeping"],
          contactPhone: "0712000000", contactEmail: `reservations${tenantIndex + 1}@demo.globaltours.co.ke`,
          checkInTime: "14:00", checkOutTime: "11:00",
          cancellationPolicy: "Synthetic demo policy: free cancellation before the demo deadline.",
          status: "active", currency: "KES", createdBy: actor?._id || null, updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Perform the side effect or state update expressed on the following line.
      hotels.push(hotel);
    }

    // Declare roomDefs for use by the surrounding module or function.
    const roomDefs = [
      [hotels[0], "Standard Room", 2, 1, 24, 17, 8500, ["room_only", "breakfast"]],
      [hotels[0], "Executive Room", 2, 2, 10, 7, 12500, ["breakfast", "half_board"]],
      [hotels[1], "Ocean View Room", 2, 2, 20, 13, 12000, ["breakfast", "half_board"]],
      [hotels[1], "Family Suite", 4, 2, 8, 5, 19500, ["breakfast", "full_board"]],
    ];
    // Declare roomTypes for use by the surrounding module or function.
    const roomTypes = [];
    // Repeat the enclosed work for each required iteration.
    for (const [hotel, name, maxAdults, maxChildren, totalRooms, availableRooms, nightlyRate, mealPlans] of roomDefs) {
      // Declare room for use by the surrounding module or function.
      const room = await HotelRoomType.findOneAndUpdate(
        { tenantId: tenant._id, hotel: hotel._id, name },
        { $set: {
          description: `Synthetic ${name.toLowerCase()} inventory for dashboard demonstration.`, maxAdults, maxChildren,
          beds: [maxAdults > 2 ? "2 queen beds" : "1 king bed"], amenities: ["Wi-Fi", "Air conditioning", "TV", "Workspace"],
          totalRooms, availableRooms, nightlyRate, mealPlans, currency: "KES", status: "active",
          updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Perform the side effect or state update expressed on the following line.
      roomTypes.push(room);
      // Perform the side effect or state update expressed on the following line.
      await HospitalityRatePlan.findOneAndUpdate(
        { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, code: `DEMO-${tenantIndex + 1}-${name.replace(/[^A-Za-z]/g, "").slice(0, 6).toUpperCase()}` },
        { $set: {
          name: `${name} Flexible Rate`, nightlyRate, currency: "KES", mealPlan: mealPlans[0], minNights: 1,
          maxNights: 14, validFrom: daysFromNow(-30), validTo: daysFromNow(365), refundable: true,
          cancellationPolicy: "Synthetic flexible cancellation policy.", stopSell: false, status: "active", createdBy: actor?._id || null, updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Declare transferDefs for use by the surrounding module or function.
    const transferDefs = [
      { name: "JKIA → Nairobi CBD Executive Transfer", code: "JKIA", direction: "airport_to_destination", pickup: "JKIA Terminal 1", dropoff: "Nairobi CBD", vehicleType: "Executive Van", capacity: 6, luggage: 6, price: 3500 },
      { name: "JKIA → Westlands Family Transfer", code: "JKIA", direction: "airport_to_destination", pickup: "JKIA Terminal 1", dropoff: "Westlands", vehicleType: "SUV", capacity: 4, luggage: 4, price: 2800 },
      { name: "Nairobi CBD → JKIA Departure Transfer", code: "JKIA", direction: "destination_to_airport", pickup: "Nairobi CBD", dropoff: "JKIA Terminal 1", vehicleType: "Executive Van", capacity: 6, luggage: 6, price: 3500 },
    ];
    // Declare transfers for use by the surrounding module or function.
    const transfers = [];
    // Repeat the enclosed work for each required iteration.
    for (const d of transferDefs) {
      // Declare transfer for use by the surrounding module or function.
      const transfer = await AirportTransfer.findOneAndUpdate(
        { tenantId: tenant._id, name: d.name },
        { $set: {
          airportName: "Jomo Kenyatta International Airport", airportCode: d.code, direction: d.direction,
          pickupLocation: d.pickup, dropoffLocation: d.dropoff, vehicleType: d.vehicleType,
          passengerCapacity: d.capacity, luggageCapacity: d.luggage, pricingModel: "per_vehicle", price: d.price,
          currency: "KES", durationMinutes: 60, amenities: ["Meet & greet", "Flight monitoring", "Bottled water"], operatingHours: "24/7",
          notes: "Synthetic airport transfer product for dashboard demonstration.", status: "active", createdBy: actor?._id || null, updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Perform the side effect or state update expressed on the following line.
      transfers.push(transfer);
    }

    // Declare guestFromCustomer for use by the surrounding module or function.
    const guestFromCustomer = (c) => ({
      firstName: c?.firstName || "Demo", lastName: c?.lastName || "Guest", email: c?.email || `guest${tenantIndex + 1}@demo.co.ke`,
      phone: c?.phone || "0712000000", nationality: "Kenyan", specialRequests: "Synthetic dashboard reservation.",
    });

    // Declare hotelStatuses for use by the surrounding module or function.
    const hotelStatuses = ["confirmed", "checked_in", "pending", "checked_out"];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 4; i += 1) {
      // Declare room for use by the surrounding module or function.
      const room = roomTypes[i % roomTypes.length];
      // Declare hotel for use by the surrounding module or function.
      const hotel = hotels.find((h) => String(h._id) === String(room.hotel)) || hotels[0];
      // Declare c for use by the surrounding module or function.
      const c = customers[i % Math.max(customers.length, 1)] || customer;
      // Declare checkIn for use by the surrounding module or function.
      const checkIn = daysFromNow(i - 2);
      // Declare checkOut for use by the surrounding module or function.
      const checkOut = daysFromNow(i + 1);
      // Declare nights for use by the surrounding module or function.
      const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000));
      // Declare subtotal for use by the surrounding module or function.
      const subtotal = room.nightlyRate * nights;
      // Perform the side effect or state update expressed on the following line.
      await HotelBooking.findOneAndUpdate(
        { tenantId: tenant._id, reference: `HDB-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` },
        { $set: {
          hotel: hotel._id, roomType: room._id, customer: c?._id || null, user: c?.user || null, linkedBooking: linkedBooking?._id || null,
          checkIn, checkOut, estimatedArrivalTime: i % 2 ? "18:30" : "14:30", rooms: 1, adults: 1 + (i % 2), children: i % 3 === 0 ? 1 : 0,
          guests: [guestFromCustomer(c)], mealPlan: ["breakfast", "half_board", "room_only", "full_board"][i], bedPreference: "King bed",
          dietaryRequirements: i === 1 ? "Vegetarian option" : "", accessibilityNeeds: i === 2 ? "Ground-floor preference" : "",
          airportTransferRequired: i % 2 === 0, specialRequests: "Synthetic reservation for hospitality dashboard coverage.",
          status: hotelStatuses[i], paymentStatus: ["paid", "partial", "pending", "paid"][i], source: ["website", "booking", "api", "admin"][i],
          subtotal, taxes: 0, fees: Math.round(subtotal * 0.025), totalAmount: Math.round(subtotal * 1.025), currency: "KES",
          notes: "Synthetic hospitality reservation — not a real customer transaction.", createdBy: actor?._id || null, updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Declare transferStatuses for use by the surrounding module or function.
    const transferStatuses = ["confirmed", "assigned", "driver_en_route", "completed"];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 4; i += 1) {
      // Declare transfer for use by the surrounding module or function.
      const transfer = transfers[i % transfers.length];
      // Declare c for use by the surrounding module or function.
      const c = customers[(i + 1) % Math.max(customers.length, 1)] || customer;
      // Declare pickupDateTime for use by the surrounding module or function.
      const pickupDateTime = daysFromNow(i + 0.5);
      // Perform the side effect or state update expressed on the following line.
      await AirportTransferBooking.findOneAndUpdate(
        { tenantId: tenant._id, reference: `ATB-${tenantIndex + 1}-${String(i + 1).padStart(3, "0")}` },
        { $set: {
          transfer: transfer._id, customer: c?._id || null, user: c?.user || null, linkedBooking: linkedBooking?._id || null,
          pickupDateTime, pickupLocation: transfer.pickupLocation, dropoffLocation: transfer.dropoffLocation,
          flightNumber: `KQ ${410 + i}`, airline: "Kenya Airways", terminal: "Terminal 1A", flightArrivalDateTime: daysFromNow(i + 0.35),
          meetAndGreet: true, signboardName: `${c?.firstName || "Demo"} ${c?.lastName || "Guest"}`, whatsappContact: c?.phone || "0712000000",
          childSeats: i % 3 === 0 ? 1 : 0, boosterSeats: 0, wheelchairAccessible: i === 3, accommodationName: hotels[i % hotels.length].name,
          passengerName: `${c?.firstName || "Demo"} ${c?.lastName || "Guest"}`, passengerPhone: c?.phone || "0712000000", passengerEmail: c?.email || `guest${i + 1}@demo.co.ke`,
          passengers: 1 + (i % 4), luggage: 1 + (i % 5), specialRequests: "Synthetic airport transfer for customer dashboard and operations coverage.",
          status: transferStatuses[i], paymentStatus: ["paid", "partial", "pending", "paid"][i], source: ["website", "booking", "api", "admin"][i],
          subtotal: transfer.price, taxes: 0, fees: Math.round(transfer.price * 0.025), totalAmount: Math.round(transfer.price * 1.025), currency: "KES",
          notes: "Synthetic transfer reservation — not a real customer transaction.", createdBy: actor?._id || null, updatedBy: actor?._id || null,
        } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Declare apiRaw for use by the surrounding module or function.
    const apiRaw = `gt_demo_${crypto.randomBytes(24).toString("base64url")}`;
    // Perform the side effect or state update expressed on the following line.
    await ApiKey.findOneAndUpdate(
      { tenantId: tenant._id, name: "Global Tours Demo API" },
      { $set: {
        prefix: apiRaw.slice(0, 11), secretHash: ApiKey.hashSecret(apiRaw),
        scopes: ["read", "booking:create", "customer:create"], expiresAt: daysFromNow(180), createdBy: actor?._id || null,
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Declare encryptedSecret for use by the surrounding module or function.
    const encryptedSecret = await protectWebhookSecret(`demo-webhook-${tenant._id}-${tenantIndex}`);
    // Perform the side effect or state update expressed on the following line.
    await Webhook.findOneAndUpdate(
      { tenantId: tenant._id, name: "Global Tours Demo Webhook" },
      { $set: {
        url: "https://example.com/global-tours/demo-webhook", secret: encryptedSecret,
        events: ["booking.created", "booking.updated", "payment.completed", "invoice.created"], active: true,
        lastDeliveryAt: daysFromNow(-1), lastStatus: 200, failureCount: 0,
      } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Return the object assembled below to the caller.
    return {
      tenant: tenant.name || String(tenant._id),
      hotels: await Hotel.countDocuments({ tenantId: tenant._id }),
      roomTypes: await HotelRoomType.countDocuments({ tenantId: tenant._id }),
      ratePlans: await HospitalityRatePlan.countDocuments({ tenantId: tenant._id }),
      hotelReservations: await HotelBooking.countDocuments({ tenantId: tenant._id }),
      airportTransfers: await AirportTransfer.countDocuments({ tenantId: tenant._id }),
      transferReservations: await AirportTransferBooking.countDocuments({ tenantId: tenant._id }),
      apiKeys: await ApiKey.countDocuments({ tenantId: tenant._id }),
      webhooks: await Webhook.countDocuments({ tenantId: tenant._id }),
    };
  });
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);
  // Declare tenants for use by the surrounding module or function.
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  // Check the condition (tenants.length !== 3) and run the matching branch.
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.`);

  // Declare results for use by the surrounding module or function.
  const results = [];
  // Repeat the enclosed work for each required iteration.
  for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));
  // Perform the side effect or state update expressed on the following line.
  console.table(results);
  // Perform the side effect or state update expressed on the following line.
  console.log("Hospitality/developer seed complete. Synthetic records only; existing master and transactional data were preserved.");
}

// Perform the side effect or state update expressed on the following line.
main()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Hospitality/developer seed failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });
