/**
 * Purpose: staging Qa Seed Core operational script. Main declarations: validateStagingQaEnvironment, ensure, assertMarkerTenant, seedStagingQaData, verifyStagingQaData.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Declare QA_TENANT_ID for use by the surrounding module or function.
export const QA_TENANT_ID = "6ab82dce30c1fd52b9dc3e80";
// Declare QA_TENANT_SLUG for use by the surrounding module or function.
export const QA_TENANT_SLUG = "staging-demo-tours";
// Declare QA_DATABASE_NAME for use by the surrounding module or function.
export const QA_DATABASE_NAME = "global_tours_test";
// Declare QA_EMAIL for use by the surrounding module or function.
export const QA_EMAIL = "qa-staging-customer@example.com";
// Declare QA_TOUR_SLUG for use by the surrounding module or function.
export const QA_TOUR_SLUG = "qa-staging-maasai-mara";
// Declare QA_BOOKING_NUMBER for use by the surrounding module or function.
export const QA_BOOKING_NUMBER = "QA-STAGING-BOOKING-001";
// Declare QA_SEED_MARKER_ID for use by the surrounding module or function.
export const QA_SEED_MARKER_ID = "staging-qa-fixture-v1";

// Define validateStagingQaEnvironment; its parameters and body implement this operation.
export function validateStagingQaEnvironment(environment) {
  // Check the condition (environment.NODE_ENV !== "production") and run the matching branch.
  if (environment.NODE_ENV !== "production") throw new Error("NODE_ENV must be production.");
  // Check the condition (environment.DEPLOYMENT_ENV !== "staging") and run the matching branch.
  if (environment.DEPLOYMENT_ENV !== "staging") throw new Error("DEPLOYMENT_ENV must be staging.");
  // Check the condition (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) and run the matching branch.
  if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) throw new Error("STAGING_DATABASE_NAME must be global_tours_test.");
  // Check the condition (typeof environment.MONGODB_URI !== "string" || !environment.MONGODB_UR) and run the matching branch.
  if (typeof environment.MONGODB_URI !== "string" || !environment.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  // Declare dbName for use by the surrounding module or function.
  let dbName;
  // Declare host for use by the surrounding module or function.
  let host;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare parsed for use by the surrounding module or function.
    const parsed = new URL(environment.MONGODB_URI);
    // Check the condition (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) and run the matching branch.
    if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) throw new Error();
    // Perform the side effect or state update expressed on the following line.
    dbName = decodeURIComponent(parsed.pathname.slice(1));
    // Perform the side effect or state update expressed on the following line.
    host = parsed.hostname.toLowerCase();
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error("MONGODB_URI must identify a staging MongoDB database.");
  }
  // Check the condition (dbName === "husseindb") and run the matching branch.
  if (dbName === "husseindb") throw new Error("husseindb is explicitly forbidden.");
  // Check the condition (dbName !== QA_DATABASE_NAME) and run the matching branch.
  if (dbName !== QA_DATABASE_NAME) throw new Error("MONGODB_URI must target global_tours_test.");
  // Check the condition (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender) and run the matching branch.
  if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(host)) throw new Error("Production hostnames are forbidden.");
  // Declare deploymentHost for use by the surrounding module or function.
  const deploymentHost = String(environment.RENDER_EXTERNAL_HOSTNAME || "").trim().toLowerCase();
  // Check the condition (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender) and run the matching branch.
  if (["hussein-mboya-tours.onrender.com", "www.hussein-mboya-tours.onrender.com"].includes(deploymentHost)) throw new Error("Production hostnames are forbidden.");
  // Return the object assembled below to the caller.
  return { dbName };
}

// Declare ensure for use by the surrounding module or function.
const ensure = async (Model, filter, values) => {
  // Declare record for use by the surrounding module or function.
  let record = await Model.findOne(filter);
  // Declare created for use by the surrounding module or function.
  const created = !record;
  // Check the condition (!record) and run the matching branch.
  if (!record) record = new Model({ ...filter, ...values });
  else Object.assign(record, values);
  // Perform the side effect or state update expressed on the following line.
  await record.save();
  // Return the object assembled below to the caller.
  return { record, created };
};

// Define assertMarkerTenant; its parameters and body implement this operation.
async function assertMarkerTenant(Model, filter) {
  // Check the condition (!Model.collection?.findOne) and run the matching branch.
  if (!Model.collection?.findOne) return;
  // Declare existing for use by the surrounding module or function.
  const existing = await Model.collection.findOne(filter);
  // Check the condition (existing && String(existing.tenantId) !== QA_TENANT_ID) and run the matching branch.
  if (existing && String(existing.tenantId) !== QA_TENANT_ID) throw new Error("A deterministic QA marker is already attached to another tenant.");
}

// Define seedStagingQaData; its parameters and body implement this operation.
export async function seedStagingQaData({ environment = process.env, dbName, models = {}, tenantRunner = runWithTenant } = {}) {
  // Perform the side effect or state update expressed on the following line.
  validateStagingQaEnvironment(environment);
  // Check the condition (dbName !== QA_DATABASE_NAME || dbName === "husseindb") and run the matching branch.
  if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");
  // Declare { Organization, User, Customer, Destination, Tour, Booking } for use by the surrounding module or function.
  const { Organization, User, Customer, Destination, Tour, Booking } = models;
  // Check the condition (![Organization, User, Customer, Destination, Tour, Booking].every(Bool) and run the matching branch.
  if (![Organization, User, Customer, Destination, Tour, Booking].every(Boolean)) throw new Error("QA seed models are unavailable.");
  // Declare tenant for use by the surrounding module or function.
  const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });
  // Check the condition (!tenant || String(tenant._id) !== QA_TENANT_ID || tenant.slug !== QA_T) and run the matching branch.
  if (!tenant || String(tenant._id) !== QA_TENANT_ID || tenant.slug !== QA_TENANT_SLUG) throw new Error("Expected staging tenant was not found.");
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Customer, { email: QA_EMAIL });
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Destination, { slug: "qa-staging-maasai-mara-destination" });
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });
  // Declare context for use by the surrounding module or function.
  const context = { tenantId, tenant, role: "admin", bypass: false };
  // Declare admin for use by the surrounding module or function.
  const admin = await tenantRunner(context, () => User.findOne({ email: "staging-tenant-admin@example.com", tenantId }));
  // Check the condition (!admin || String(admin.tenantId) !== QA_TENANT_ID) and run the matching branch.
  if (!admin || String(admin.tenantId) !== QA_TENANT_ID) throw new Error("Existing staging tenant admin was not found.");

  // Declare results for use by the surrounding module or function.
  const results = await tenantRunner(context, async () => {
    // Declare customer for use by the surrounding module or function.
    const customer = await ensure(Customer, { tenantId, email: QA_EMAIL }, {
      firstName: "QA Staging", lastName: "Customer", phone: "0700000001", nationality: "Kenyan", country: "Kenya", city: "Nairobi", notes: "Disposable staging QA record.", tags: ["qa-staging-seed"], status: "active", isDeleted: false,
    });
    // Declare destination for use by the surrounding module or function.
    const destination = await ensure(Destination, { tenantId, slug: "qa-staging-maasai-mara-destination" }, {
      name: "Maasai Mara", country: "Kenya", region: "Narok County", shortDescription: "Synthetic staging QA destination.", description: "Synthetic staging QA destination in Kenya.", currency: "KES", timezone: "Africa/Nairobi", bestSeason: "All Year", featured: false, popular: false, status: "active", active: true, isDeleted: false,
    });
    // Declare start for use by the surrounding module or function.
    const start = new Date(Date.now() + 30 * 86400000);
    // Declare tour for use by the surrounding module or function.
    const tour = await ensure(Tour, { tenantId, slug: QA_TOUR_SLUG }, {
      title: "QA Maasai Mara Safari", description: "Disposable synthetic staging safari data.", shortDescription: "Staging QA Maasai Mara safari.", category: "Safari", destination: destination.record._id, country: "Kenya", location: "Maasai Mara, Narok County", meetingPoint: "Nairobi CBD", duration: "3 Days", durationDays: 3, durationDetails: { days: 3, nights: 2 }, date: start, startDate: start, endDate: new Date(start.getTime() + 2 * 86400000), capacity: 8, price: 25000, agentPrice: 25000, featuredImage: { url: "https://images.unsplash.com/photo-1516426122078-c23e76319801" }, highlights: ["Wildlife viewing", "Synthetic staging QA"], inclusions: ["Guide"], exclusions: ["Flights"], languages: ["English", "Swahili"], itinerary: [{ day: 1, title: "Arrival", description: "Synthetic QA itinerary." }], availabilitySettings: { totalSlots: 8, bookedSlots: 0, waitlistEnabled: false }, status: "upcoming", published: true, available: true, isDeleted: false,
    });
    // Declare booking for use by the surrounding module or function.
    const booking = await ensure(Booking, { tenantId, bookingNumber: QA_BOOKING_NUMBER }, {
      customer: customer.record._id, tour: tour.record._id, travelDate: start, travelers: [{ name: "QA Staging Customer" }], numberOfGuests: 1, contact: { name: "QA Staging Customer", email: QA_EMAIL, phone: "0700000001" }, customerSnapshot: { name: "QA Staging Customer", email: QA_EMAIL, phone: "0700000001" }, bookingSource: "admin", subtotal: 25000, totalAmount: 25000, depositAmount: 0, amountPaid: 0, balanceAmount: 25000, paymentMethod: "MPESA", paymentStatus: "pending", status: "pending", notes: "Disposable staging QA booking; no payment initiated.", isDeleted: false,
    });
    // Check the condition (String(customer.record.tenantId) !== QA_TENANT_ID || String(tour.recor) and run the matching branch.
    if (String(customer.record.tenantId) !== QA_TENANT_ID || String(tour.record.tenantId) !== QA_TENANT_ID || String(booking.record.tenantId) !== QA_TENANT_ID) throw new Error("QA record tenant verification failed.");
    // Check the condition (String(booking.record.customer) !== String(customer.record._id) || Str) and run the matching branch.
    if (String(booking.record.customer) !== String(customer.record._id) || String(booking.record.tour) !== String(tour.record._id)) throw new Error("QA booking references are invalid.");
    // Check the condition (booking.record.paymentStatus !== "pending" || booking.record.status !=) and run the matching branch.
    if (booking.record.paymentStatus !== "pending" || booking.record.status !== "pending" || Number(booking.record.amountPaid) !== 0) throw new Error("QA booking must remain unpaid and pending.");
    // Return the object assembled below to the caller.
    return { customer: customer.created, tour: tour.created, booking: booking.created };
  });
  // Return the object assembled below to the caller.
  return { dbName: QA_DATABASE_NAME, tenant: "verified", ...results };
}

// Define verifyStagingQaData; its parameters and body implement this operation.
export async function verifyStagingQaData({ environment = process.env, dbName, models = {}, tenantRunner = runWithTenant } = {}) {
  // Perform the side effect or state update expressed on the following line.
  validateStagingQaEnvironment(environment);
  // Check the condition (dbName !== QA_DATABASE_NAME || dbName === "husseindb") and run the matching branch.
  if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");
  // Declare { Organization, User, Customer, Tour, Booking, Payment } for use by the surrounding module or function.
  const { Organization, User, Customer, Tour, Booking, Payment } = models;
  // Declare tenant for use by the surrounding module or function.
  const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });
  // Check the condition (!tenant || String(tenant._id) !== QA_TENANT_ID) and run the matching branch.
  if (!tenant || String(tenant._id) !== QA_TENANT_ID) throw new Error("Staging tenant verification failed.");
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Customer, { email: QA_EMAIL });
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });
  // Perform the side effect or state update expressed on the following line.
  await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });
  // Return the result of tenantRunner() to the caller.
  return tenantRunner({ tenantId, tenant, role: "admin", bypass: false }, async () => {
    // Declare admin for use by the surrounding module or function.
    const admin = await User.findOne({ email: "staging-tenant-admin@example.com", tenantId });
    // Declare customer for use by the surrounding module or function.
    const customer = await Customer.findOne({ tenantId, email: QA_EMAIL });
    // Declare tour for use by the surrounding module or function.
    const tour = await Tour.findOne({ tenantId, slug: QA_TOUR_SLUG });
    // Declare booking for use by the surrounding module or function.
    const booking = await Booking.findOne({ tenantId, bookingNumber: QA_BOOKING_NUMBER });
    // Check the condition (!admin || !customer || !tour || !booking) and run the matching branch.
    if (!admin || !customer || !tour || !booking) throw new Error("One or more staging QA records are missing or attached to another tenant.");
    // Check the condition (String(customer.tenantId) !== QA_TENANT_ID || String(tour.tenantId) !=) and run the matching branch.
    if (String(customer.tenantId) !== QA_TENANT_ID || String(tour.tenantId) !== QA_TENANT_ID || String(booking.tenantId) !== QA_TENANT_ID) throw new Error("A QA record has an unexpected tenant.");
    // Check the condition (String(booking.customer) !== String(customer._id) || String(booking.to) and run the matching branch.
    if (String(booking.customer) !== String(customer._id) || String(booking.tour) !== String(tour._id)) throw new Error("Staging QA booking references do not match.");
    // Check the condition (booking.paymentStatus !== "pending" || booking.status !== "pending" ||) and run the matching branch.
    if (booking.paymentStatus !== "pending" || booking.status !== "pending" || Number(booking.amountPaid) !== 0) throw new Error("Staging QA booking is not unpaid and pending.");
    // Check the condition (Payment) and run the matching branch.
    if (Payment) {
      // Declare successful for use by the surrounding module or function.
      const successful = Payment.collection?.countDocuments
        ? await Payment.collection.countDocuments({ booking: booking._id, status: { $in: ["completed", "refunded"] } })
        : await Payment.countDocuments({ tenantId, booking: booking._id, status: { $in: ["completed", "refunded"] } });
      // Check the condition (successful) and run the matching branch.
      if (successful) throw new Error("Staging QA booking has a successful payment record.");
    }
    // Return the object assembled below to the caller.
    return { dbName: QA_DATABASE_NAME, tenant: "verified", customer: "verified", tour: "verified", booking: "verified", payment: "unpaid" };
  });
}

/** Run the fixed QA seed once per staging database using a durable marker. */
// Define runStagingQaSeedOnce; its parameters and body implement this operation.
export async function runStagingQaSeedOnce({
  environment = process.env,
  mongooseClient = mongoose,
  models,
  seed = seedStagingQaData,
  verify = verifyStagingQaData,
} = {}) {
  // Perform the side effect or state update expressed on the following line.
  validateStagingQaEnvironment(environment);
  // Declare databaseName for use by the surrounding module or function.
  const databaseName = mongooseClient.connection?.db?.databaseName;
  // Check the condition (databaseName !== QA_DATABASE_NAME || databaseName === "husseindb") and run the matching branch.
  if (databaseName !== QA_DATABASE_NAME || databaseName === "husseindb") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Connected database must be global_tours_test.");
  }
  // Declare markers for use by the surrounding module or function.
  const markers = mongooseClient.connection.db.collection("staging_qa_seed_markers");
  // Declare existing for use by the surrounding module or function.
  const existing = await markers.findOne({ _id: QA_SEED_MARKER_ID });
  // Check the condition (existing && (String(existing.tenantId) !== QA_TENANT_ID || existing.da) and run the matching branch.
  if (existing && (String(existing.tenantId) !== QA_TENANT_ID || existing.databaseName !== QA_DATABASE_NAME)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Staging QA completion marker has an unexpected target.");
  }
  // Check the condition (existing?.completedAt) and run the matching branch.
  if (existing?.completedAt) return { seeded: false, alreadyComplete: true };

  // Perform the side effect or state update expressed on the following line.
  await seed({ environment, dbName: databaseName, models });
  // Perform the side effect or state update expressed on the following line.
  await verify({ environment, dbName: databaseName, models });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await markers.insertOne({
      _id: QA_SEED_MARKER_ID,
      tenantId: QA_TENANT_ID,
      databaseName: QA_DATABASE_NAME,
      completedAt: new Date(),
    });
  } catch (error) {
    // Another staging instance may have completed the same deterministic seed.
    // Check the condition (error?.code !== 11000) and run the matching branch.
    if (error?.code !== 11000) throw error;
    // Declare concurrentMarker for use by the surrounding module or function.
    const concurrentMarker = await markers.findOne({ _id: QA_SEED_MARKER_ID, tenantId: QA_TENANT_ID });
    // Check the condition (!concurrentMarker?.completedAt) and run the matching branch.
    if (!concurrentMarker?.completedAt) throw error;
  }
  // Return the object assembled below to the caller.
  return { seeded: true, alreadyComplete: false };
}
