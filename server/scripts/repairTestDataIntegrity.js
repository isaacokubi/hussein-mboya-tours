import "dotenv/config";
import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import Vehicle from "../models/Vehicle.js";
import Organization from "../models/Organization.js";

const TARGET = Math.max(10, Number(process.env.TEST_SEED_COUNT || 10));
const ALLOW = String(process.env.ALLOW_TEST_SEED || "false").toLowerCase() === "true";
const MIN_AVAILABLE_VEHICLES = Math.min(2, TARGET);

const tenantRead = (tenantId, fn) => runWithTenant({ tenantId, role: "admin" }, fn);

async function ensureTourPrerequisite(tenant, user) {
  const existingTour = await Tour.findOne({
    tenantId: tenant._id,
    isDeleted: { $ne: true },
  }).sort({ createdAt: 1 });
  if (existingTour) return existingTour;

  let destination = await Destination.findOne({
    tenantId: tenant._id,
    isDeleted: { $ne: true },
  }).sort({ createdAt: 1 });

  if (!destination) {
    destination = new Destination({
      tenantId: tenant._id,
      name: `${tenant.name} Test Destination`,
      country: "Kenya",
      region: "Nairobi",
      city: "Nairobi",
      shortDescription: "Test destination for dashboard and booking validation.",
      description: `Tenant-safe test destination created for ${tenant.name}.`,
      featuredImage: "",
      images: [],
      attractions: ["Nairobi National Park", "Karen", "Giraffe Centre"],
      activities: ["Safari", "City Tour"],
      languages: ["English", "Swahili"],
      currency: "KES",
      timezone: "Africa/Nairobi",
      bestSeason: "All Year",
      weather: "Warm and sunny",
      averageTemperature: 22,
      coordinates: { latitude: -1.2921, longitude: 36.8219 },
      featured: true,
      popular: true,
      status: "active",
      active: true,
      isDeleted: false,
    });
    await destination.save();
  }

  const date = new Date();
  date.setDate(date.getDate() + 14);
  const tour = new Tour({
    tenantId: tenant._id,
    title: `${tenant.name} Test Safari`,
    description: `Tenant-safe test tour created for ${tenant.name}.`,
    shortDescription: "A seeded test safari for dashboard and booking validation.",
    category: "Safari",
    destination: destination._id,
    country: "Kenya",
    location: destination.city || "Nairobi",
    meetingPoint: "Nairobi CBD",
    duration: "3 Days",
    durationDetails: { days: 3, nights: 2 },
    date,
    startDate: date,
    capacity: 20,
    price: 25000,
    agentPrice: 23000,
    discount: 0,
    highlights: ["Wildlife viewing", "Professional guide", "Comfortable transport"],
    inclusions: ["Transport", "Guide", "Bottled water"],
    exclusions: ["Personal expenses"],
    languages: ["English", "Swahili"],
    difficulty: "easy",
    itinerary: [],
    availabilitySettings: { totalSlots: 20, bookedSlots: 0, waitlistEnabled: false },
    depositRequired: 12500,
    cancellationPolicy: "Standard test policy",
    bookingDeadline: 1,
    instantBooking: true,
    assignedGuide: null,
    assignedDriver: null,
    assignedVehicle: null,
    assignmentStatus: "pending",
    status: "upcoming",
    published: true,
    featured: true,
    available: true,
    isDeleted: false,
    createdBy: user?._id || null,
  });
  await tour.save();
  return tour;
}

async function repairTenant(tenant) {
  return tenantRead(tenant._id, async () => {
    const users = await User.find({ tenantId: tenant._id }).sort({ createdAt: 1 }).limit(TARGET).lean();
    if (!users.length) throw new Error(`Tenant ${tenant.name} has no users available for customer relationships.`);

    const repairUser = users[0];
    const prerequisiteTour = await ensureTourPrerequisite(tenant, repairUser);
    const tours = await Tour.find({ tenantId: tenant._id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 })
      .limit(TARGET)
      .lean();

    const customers = await Customer.find({ tenantId: tenant._id }).sort({ createdAt: 1 });
    const assignedUsers = new Set(
      customers.map((customer) => customer.user).filter(Boolean).map((id) => String(id)),
    );

    let customerUpdates = 0;
    for (const customer of customers) {
      if (customer.user) continue;
      const availableUser = users.find((user) => !assignedUsers.has(String(user._id)));
      if (!availableUser) break;
      customer.user = availableUser._id;
      assignedUsers.add(String(availableUser._id));
      await customer.save();
      customerUpdates += 1;
    }

    const repairedCustomers = await Customer.find({ tenantId: tenant._id }).sort({ createdAt: 1 }).limit(TARGET).lean();
    const customerPool = repairedCustomers.filter((customer) => customer.user && customer.phone);
    if (!customerPool.length) throw new Error(`Tenant ${tenant.name} still has no valid customer records.`);

    const existingBookings = await Booking.find({ tenantId: tenant._id }).sort({ createdAt: 1 }).limit(TARGET);
    const tourIds = tours.length ? tours.map((tour) => tour._id) : [prerequisiteTour._id];
    const customerIds = customerPool.map((customer) => customer._id);

    let bookingUpdates = 0;
    for (const [index, booking] of existingBookings.entries()) {
      let changed = false;
      if (!booking.tour || !tourIds.some((id) => String(id) === String(booking.tour))) {
        booking.tour = tourIds[index % tourIds.length];
        changed = true;
      }
      if (!booking.customer || !customerIds.some((id) => String(id) === String(booking.customer))) {
        booking.customer = customerIds[index % customerIds.length];
        changed = true;
      }
      if (!booking.travelDate) {
        const travelDate = new Date();
        travelDate.setDate(travelDate.getDate() + 10 + index);
        booking.travelDate = travelDate;
        changed = true;
      }
      if (!booking.totalAmount || booking.totalAmount < 0) {
        booking.totalAmount = 5000 + index * 500;
        changed = true;
      }
      if (changed) {
        await booking.save();
        bookingUpdates += 1;
      }
    }

    const count = await Booking.countDocuments({ tenantId: tenant._id });
    let bookingCreated = 0;
    for (let index = count; index < TARGET; index += 1) {
      const total = 5000 + index * 500;
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() + 10 + index);
      const booking = new Booking({
        tenantId: tenant._id,
        bookingNumber: `TEST-${String(tenant._id).slice(-8)}-${String(index + 1).padStart(4, "0")}`,
        customer: customerIds[index % customerIds.length],
        user: customerPool[index % customerPool.length].user,
        tour: tourIds[index % tourIds.length],
        bookingSource: "admin",
        travelDate,
        numberOfGuests: 1 + (index % 4),
        contact: {
          name: `${customerPool[index % customerPool.length].firstName} ${customerPool[index % customerPool.length].lastName}`,
          email: customerPool[index % customerPool.length].email || `customer-${index + 1}@example.test`,
          phone: customerPool[index % customerPool.length].phone,
        },
        subtotal: total,
        totalAmount: total,
        depositAmount: Math.round(total / 2),
        balanceAmount: Math.round(total / 2),
        paymentMethod: "MPESA",
        paymentStatus: "partial",
        status: index % 2 ? "pending" : "confirmed",
      });
      await booking.save();
      bookingCreated += 1;
    }

    const vehicles = await Vehicle.find({ tenantId: tenant._id, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 })
      .limit(TARGET);
    const currentlyAvailable = vehicles.filter((vehicle) => vehicle.status === "available" && vehicle.isActive).length;
    const neededVehicles = Math.max(0, MIN_AVAILABLE_VEHICLES - currentlyAvailable);
    let vehicleUpdates = 0;

    if (neededVehicles > 0) {
      const candidates = vehicles.filter((vehicle) => vehicle.status !== "available");
      for (const vehicle of candidates.slice(0, neededVehicles)) {
        vehicle.status = "available";
        vehicle.driver = null;
        vehicle.assignedTour = null;
        vehicle.isActive = true;
        await vehicle.save();
        vehicleUpdates += 1;
      }
    }

    const availableVehicles = await Vehicle.countDocuments({
      tenantId: tenant._id,
      isDeleted: { $ne: true },
      isActive: true,
      status: "available",
    });

    return {
      tenantId: String(tenant._id),
      tenantName: tenant.name,
      users: users.length,
      tours: await Tour.countDocuments({ tenantId: tenant._id, isDeleted: { $ne: true } }),
      customers: await Customer.countDocuments({ tenantId: tenant._id }),
      customerUpdates,
      bookings: await Booking.countDocuments({ tenantId: tenant._id }),
      bookingUpdates,
      bookingCreated,
      availableVehicles,
      vehicleUpdates,
    };
  });
}

async function main() {
  if (!ALLOW) throw new Error("Set ALLOW_TEST_SEED=true before repairing test data.");
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is missing.");
  await mongoose.connect(uri);
  try {
    const tenants = await runWithTenant({ role: "super_admin", bypass: true }, () =>
      Organization.find({ status: { $in: ["active", "trial"] } }).sort({ createdAt: 1 }).lean());
    if (!tenants.length) throw new Error("No active or trial tenants found.");
    const results = [];
    for (const tenant of tenants) results.push(await repairTenant(tenant));
    console.log(JSON.stringify({ success: true, targetPerTenant: TARGET, minimumAvailableVehicles: MIN_AVAILABLE_VEHICLES, tenants: results }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Test-data repair failed: ${error.message}`);
  process.exitCode = 1;
});
