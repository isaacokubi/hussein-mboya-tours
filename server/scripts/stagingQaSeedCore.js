import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";

export const QA_TENANT_ID = "6ab82dce30c1fd52b9dc3e80";
export const QA_TENANT_SLUG = "staging-demo-tours";
export const QA_DATABASE_NAME = "global_tours_test";
export const QA_EMAIL = "qa-staging-customer@example.com";
export const QA_TOUR_SLUG = "qa-staging-maasai-mara";
export const QA_BOOKING_NUMBER = "QA-STAGING-BOOKING-001";

export function validateStagingQaEnvironment(environment) {
  if (environment.NODE_ENV !== "production") throw new Error("NODE_ENV must be production.");
  if (environment.DEPLOYMENT_ENV !== "staging") throw new Error("DEPLOYMENT_ENV must be staging.");
  if (environment.STAGING_DATABASE_NAME !== QA_DATABASE_NAME) throw new Error("STAGING_DATABASE_NAME must be global_tours_test.");
  if (typeof environment.MONGODB_URI !== "string" || !environment.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  let dbName;
  let host;
  try {
    const parsed = new URL(environment.MONGODB_URI);
    if (!["mongodb:", "mongodb+srv:"].includes(parsed.protocol)) throw new Error();
    dbName = decodeURIComponent(parsed.pathname.slice(1));
    host = parsed.hostname.toLowerCase();
  } catch {
    throw new Error("MONGODB_URI must identify a staging MongoDB database.");
  }
  if (dbName === "husseindb") throw new Error("husseindb is explicitly forbidden.");
  if (dbName !== QA_DATABASE_NAME) throw new Error("MONGODB_URI must target global_tours_test.");
  if (host === "hussein-mboya-tours.onrender.com") throw new Error("Production hostnames are forbidden.");
  return { dbName };
}

const ensure = async (Model, filter, values) => {
  let record = await Model.findOne(filter);
  const created = !record;
  if (!record) record = new Model({ ...filter, ...values });
  else Object.assign(record, values);
  await record.save();
  return { record, created };
};

async function assertMarkerTenant(Model, filter) {
  if (!Model.collection?.findOne) return;
  const existing = await Model.collection.findOne(filter);
  if (existing && String(existing.tenantId) !== QA_TENANT_ID) throw new Error("A deterministic QA marker is already attached to another tenant.");
}

export async function seedStagingQaData({ environment = process.env, dbName, models = {}, tenantRunner = runWithTenant } = {}) {
  validateStagingQaEnvironment(environment);
  if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");
  const { Organization, User, Customer, Destination, Tour, Booking } = models;
  if (![Organization, User, Customer, Destination, Tour, Booking].every(Boolean)) throw new Error("QA seed models are unavailable.");
  const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });
  if (!tenant || String(tenant._id) !== QA_TENANT_ID || tenant.slug !== QA_TENANT_SLUG) throw new Error("Expected staging tenant was not found.");
  const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);
  await assertMarkerTenant(Customer, { email: QA_EMAIL });
  await assertMarkerTenant(Destination, { slug: "qa-staging-maasai-mara-destination" });
  await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });
  await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });
  const context = { tenantId, tenant, role: "admin", bypass: false };
  const admin = await tenantRunner(context, () => User.findOne({ email: "staging-tenant-admin@example.com", tenantId }));
  if (!admin || String(admin.tenantId) !== QA_TENANT_ID) throw new Error("Existing staging tenant admin was not found.");

  const results = await tenantRunner(context, async () => {
    const customer = await ensure(Customer, { tenantId, email: QA_EMAIL }, {
      firstName: "QA Staging", lastName: "Customer", phone: "0700000001", nationality: "Kenyan", country: "Kenya", city: "Nairobi", notes: "Disposable staging QA record.", tags: ["qa-staging-seed"], status: "active", isDeleted: false,
    });
    const destination = await ensure(Destination, { tenantId, slug: "qa-staging-maasai-mara-destination" }, {
      name: "Maasai Mara", country: "Kenya", region: "Narok County", shortDescription: "Synthetic staging QA destination.", description: "Synthetic staging QA destination in Kenya.", currency: "KES", timezone: "Africa/Nairobi", bestSeason: "All Year", featured: false, popular: false, status: "active", active: true, isDeleted: false,
    });
    const start = new Date(Date.now() + 30 * 86400000);
    const tour = await ensure(Tour, { tenantId, slug: QA_TOUR_SLUG }, {
      title: "QA Maasai Mara Safari", description: "Disposable synthetic staging safari data.", shortDescription: "Staging QA Maasai Mara safari.", category: "Safari", destination: destination.record._id, country: "Kenya", location: "Maasai Mara, Narok County", meetingPoint: "Nairobi CBD", duration: "3 Days", durationDays: 3, durationDetails: { days: 3, nights: 2 }, date: start, startDate: start, endDate: new Date(start.getTime() + 2 * 86400000), capacity: 8, price: 25000, agentPrice: 25000, featuredImage: { url: "https://images.unsplash.com/photo-1516426122078-c23e76319801" }, highlights: ["Wildlife viewing", "Synthetic staging QA"], inclusions: ["Guide"], exclusions: ["Flights"], languages: ["English", "Swahili"], itinerary: [{ day: 1, title: "Arrival", description: "Synthetic QA itinerary." }], availabilitySettings: { totalSlots: 8, bookedSlots: 0, waitlistEnabled: false }, status: "upcoming", published: true, available: true, isDeleted: false,
    });
    const booking = await ensure(Booking, { tenantId, bookingNumber: QA_BOOKING_NUMBER }, {
      customer: customer.record._id, tour: tour.record._id, travelDate: start, travelers: [{ name: "QA Staging Customer" }], numberOfGuests: 1, contact: { name: "QA Staging Customer", email: QA_EMAIL, phone: "0700000001" }, customerSnapshot: { name: "QA Staging Customer", email: QA_EMAIL, phone: "0700000001" }, bookingSource: "admin", subtotal: 25000, totalAmount: 25000, depositAmount: 0, amountPaid: 0, balanceAmount: 25000, paymentMethod: "MPESA", paymentStatus: "pending", status: "pending", notes: "Disposable staging QA booking; no payment initiated.", isDeleted: false,
    });
    if (String(customer.record.tenantId) !== QA_TENANT_ID || String(tour.record.tenantId) !== QA_TENANT_ID || String(booking.record.tenantId) !== QA_TENANT_ID) throw new Error("QA record tenant verification failed.");
    if (String(booking.record.customer) !== String(customer.record._id) || String(booking.record.tour) !== String(tour.record._id)) throw new Error("QA booking references are invalid.");
    if (booking.record.paymentStatus !== "pending" || booking.record.status !== "pending" || Number(booking.record.amountPaid) !== 0) throw new Error("QA booking must remain unpaid and pending.");
    return { customer: customer.created, tour: tour.created, booking: booking.created };
  });
  return { dbName: QA_DATABASE_NAME, tenant: "verified", ...results };
}

export async function verifyStagingQaData({ environment = process.env, dbName, models = {}, tenantRunner = runWithTenant } = {}) {
  validateStagingQaEnvironment(environment);
  if (dbName !== QA_DATABASE_NAME || dbName === "husseindb") throw new Error("Connected database must be global_tours_test.");
  const { Organization, User, Customer, Tour, Booking, Payment } = models;
  const tenant = await Organization.collection.findOne({ _id: new mongoose.Types.ObjectId(QA_TENANT_ID), slug: QA_TENANT_SLUG });
  if (!tenant || String(tenant._id) !== QA_TENANT_ID) throw new Error("Staging tenant verification failed.");
  const tenantId = new mongoose.Types.ObjectId(QA_TENANT_ID);
  await assertMarkerTenant(Customer, { email: QA_EMAIL });
  await assertMarkerTenant(Tour, { slug: QA_TOUR_SLUG });
  await assertMarkerTenant(Booking, { bookingNumber: QA_BOOKING_NUMBER });
  return tenantRunner({ tenantId, tenant, role: "admin", bypass: false }, async () => {
    const admin = await User.findOne({ email: "staging-tenant-admin@example.com", tenantId });
    const customer = await Customer.findOne({ tenantId, email: QA_EMAIL });
    const tour = await Tour.findOne({ tenantId, slug: QA_TOUR_SLUG });
    const booking = await Booking.findOne({ tenantId, bookingNumber: QA_BOOKING_NUMBER });
    if (!admin || !customer || !tour || !booking) throw new Error("One or more staging QA records are missing or attached to another tenant.");
    if (String(customer.tenantId) !== QA_TENANT_ID || String(tour.tenantId) !== QA_TENANT_ID || String(booking.tenantId) !== QA_TENANT_ID) throw new Error("A QA record has an unexpected tenant.");
    if (String(booking.customer) !== String(customer._id) || String(booking.tour) !== String(tour._id)) throw new Error("Staging QA booking references do not match.");
    if (booking.paymentStatus !== "pending" || booking.status !== "pending" || Number(booking.amountPaid) !== 0) throw new Error("Staging QA booking is not unpaid and pending.");
    if (Payment) {
      const successful = Payment.collection?.countDocuments
        ? await Payment.collection.countDocuments({ booking: booking._id, status: { $in: ["completed", "refunded"] } })
        : await Payment.countDocuments({ tenantId, booking: booking._id, status: { $in: ["completed", "refunded"] } });
      if (successful) throw new Error("Staging QA booking has a successful payment record.");
    }
    return { dbName: QA_DATABASE_NAME, tenant: "verified", customer: "verified", tour: "verified", booking: "verified", payment: "unpaid" };
  });
}
