import "dotenv/config";
import mongoose from "mongoose";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Organization from "../models/Organization.js";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Destination from "../models/Destination.js";
import Tour from "../models/Tour.js";
import TourPackage from "../models/TourPackage.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Expense from "../models/Expense.js";
import TourCost from "../models/TourCost.js";
import Commission from "../models/Commission.js";
import Vehicle from "../models/Vehicle.js";
import Hotel from "../models/Hotel.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransfer from "../models/AirportTransfer.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";
import Review from "../models/Review.js";
import Lead from "../models/Lead.js";
import CustomTourRequest from "../models/CustomTourRequest.js";
import TravelServiceRequest from "../models/TravelServiceRequest.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import JournalEntry from "../models/JournalEntry.js";
import AccountingPeriod from "../models/AccountingPeriod.js";
import FinanceBudget from "../models/FinanceBudget.js";
import TaxRule from "../models/TaxRule.js";
import TaxProfile from "../models/TaxProfile.js";
import CorporateAccount from "../models/CorporateAccount.js";
import ComplianceRecord from "../models/ComplianceRecord.js";
import PrivacyRequest from "../models/PrivacyRequest.js";
import Notification from "../models/Notification.js";
import CustomerProfile from "../models/CustomerProfile.js";
import StaffProfile from "../models/StaffProfile.js";
import UserPreference from "../models/UserPreference.js";
import Coupon from "../models/Coupon.js";
import Promotion from "../models/Promotion.js";
import Campaign from "../models/Campaign.js";
import Loyalty from "../models/Loyalty.js";
import LoyaltyAccount from "../models/LoyaltyAccount.js";
import Wishlist from "../models/Wishlist.js";
import Referral from "../models/Referral.js";
import Refund from "../models/Refund.js";
import CreditDebitNote from "../models/CreditDebitNote.js";
import SupplierPayable from "../models/SupplierPayable.js";
import FixedAsset from "../models/FixedAsset.js";
import OperationalAsset from "../models/OperationalAsset.js";
import AccommodationInventory from "../models/AccommodationInventory.js";
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
import HospitalityDeposit from "../models/HospitalityDeposit.js";
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
import EtimsSubmission from "../models/EtimsSubmission.js";
import ApiKey from "../models/ApiKey.js";
import WebsiteIntegrationKey from "../models/WebsiteIntegrationKey.js";
import WebsiteIntegrationEvent from "../models/WebsiteIntegrationEvent.js";
import Webhook from "../models/Webhook.js";
import WebhookDelivery from "../models/WebhookDelivery.js";
import Subscription from "../models/Subscription.js";
import TourCategory from "../models/TourCategory.js";
import Itinerary from "../models/Itinerary.js";
import Gallery from "../models/Gallery.js";
import Media from "../models/Media.js";
import HospitalitySupplierContract from "../models/HospitalitySupplierContract.js";
import TourGallery from "../models/TourGallery.js";
import TourReport from "../models/TourReport.js";
import HeroSlide from "../models/HeroSlide.js";
import Quotation from "../models/Quotation.js";
import PaymentLink from "../models/PaymentLink.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import WithholdingTax from "../models/WithholdingTax.js";
import AccountingReconciliation from "../models/AccountingReconciliation.js";
import AccountingSubledger from "../models/AccountingSubledger.js";
import { runWithTenant } from "../tenancy/context.js";
import { assertSupportedMongoVersion } from "../utils/mongodbVersion.js";

export const NAMESPACE = "TEST-SEED-GLOBAL-TOURS-2026";
export const TEST_PASSWORD_ENV = "TEST_DEMO_SEED_PASSWORD";
export function getTestPassword() {
  const password = String(process.env[TEST_PASSWORD_ENV] || "");
  if (password.length < 12) throw new Error(`${TEST_PASSWORD_ENV} must contain at least 12 characters for disposable test accounts.`);
  return password;
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportFile = path.resolve(__dirname, "../reports/test-seed-report.json");
const tenantsSpec = [
  { key: "amani", slug: "test-seed-amani-trails-2026", name: "Amani Trails Safaris", legalName: "Amani Trails Safaris TEST Limited", county: "Nairobi", email: "admin.amani@test.globaltours.co.ke", prefix: "amani" },
  { key: "savanna", slug: "test-seed-savanna-crown-2026", name: "Savanna Crown Safaris", legalName: "Savanna Crown Safaris TEST Limited", county: "Narok", email: "admin.savanna@test.globaltours.co.ke", prefix: "savanna" },
  { key: "coastal", slug: "test-seed-coastal-horizon-2026", name: "Coastal Horizon Adventures", legalName: "Coastal Horizon Adventures TEST Limited", county: "Mombasa", email: "admin.coastal@test.globaltours.co.ke", prefix: "coastal" },
];
const publicImage = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80";
const TEST_LOGIN_EMAILS = ["superadmin@test.globaltours.co.ke", ...tenantsSpec.flatMap(({ prefix }) => ["admin", "manager", "agent1", "agent2", "guide1", "guide2", "driver1", "driver2", "customer1", "customer2", "customer3", "customer4"].map((name) => `${name}.${prefix}@test.globaltours.co.ke`))];
const dates = (days = 30) => new Date(Date.now() + days * 86400000);
const stablePhone = (tenantIndex, accountIndex) => String(7100000000 + tenantIndex * 1000 + accountIndex).slice(0, 10);

function databaseTarget() {
  const raw = String(process.env.MONGODB_URI || "");
  if (!raw) throw new Error("MONGODB_URI is missing.");
  let parsed;
  try { parsed = new URL(raw); } catch { throw new Error("MONGODB_URI is not a valid MongoDB URL."); }
  return { dbName: decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] || ""), host: parsed.hostname.toLowerCase() };
}

export function safeTarget(target = databaseTarget()) {
  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") throw new Error("Refusing test seed because NODE_ENV=production.");
  const { dbName, host } = target;
  if (!new Set(["127.0.0.1", "localhost", "[::1]", "::1"]).has(String(host || "").toLowerCase())) {
    throw new Error("Refusing test seed: MongoDB host must be loopback; remote databases are never seeded.");
  }
  const configText = [process.env.NODE_ENV, process.env.PLATFORM_HOST, process.env.CLIENT_URL, process.env.CLIENT_ORIGINS, host, dbName].join(" ").toLowerCase();
  if (!/(^|[-_])(test|testing|demo|disposable|seed)([-_]|$)/.test(dbName)) throw new Error(`Refusing seed: configured database name "${dbName || "(default)"}" is not explicitly test/demo/disposable. No writes were made.`);
  if (/prod|production|render\.com|vercel\.app|mongodb\+srv:.*prod/.test(configText)) throw new Error("Refusing test seed because production-looking configuration was detected.");
  if ([process.env.ALLOW_GLOBAL_MPESA_FALLBACK, process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK].some((value) => String(value || "").trim().toLowerCase() === "true")) throw new Error("Refusing test seed while an unsafe M-Pesa fallback is enabled.");
  return { dbName, host };
}

export function assertSeedConfirmation() {
  if (process.env.CONFIRM_TEST_SEED !== "YES") throw new Error("Set CONFIRM_TEST_SEED=YES to confirm this disposable TEST seed.");
}

function assertRequiredSchemaFields(Model, doc) {
  const errors = [];
  for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {
    if (!schemaPath.isRequired || field === "_id" || field === "__v") continue;
    const values = collectPathValues(doc, field.split("."));
    if (!values.length || values.some((value) => value === undefined || value === null || (typeof value === "string" && !value.trim()))) errors.push(`${Model.modelName}.${field}`);
  }
  return errors;
}

function collectPathValues(value, parts) {
  if (value == null) return [];
  if (!parts.length) return Array.isArray(value) ? value.flatMap((item) => collectPathValues(item, [])) : [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectPathValues(item, parts));
  return collectPathValues(value[parts[0]], parts.slice(1));
}

function safeErrorMessage(error) {
  return String(error?.message || "Seed failed.")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]")
    .replace(/(password|secret|token|credential)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");
}

async function inspectReferences(Model, docs, tenantId, failures) {
  for (const doc of docs) {
    for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {
      const refName = schemaPath.options?.ref || schemaPath.caster?.options?.ref;
      const refPath = schemaPath.options?.refPath;
      const modelName = refName || (refPath ? doc[refPath] : null);
      const RefModel = modelName && mongoose.models[modelName];
      if (!RefModel) continue;
      const refs = collectPathValues(doc, field.split(".")).filter((value) => value != null && value !== "");
      for (const reference of refs) {
        const id = reference?._id || reference;
        const filter = { _id: id };
        const platformOwner = Model === User && ["super_admin", "superadmin"].includes(String(doc.role || "").toLowerCase());
        if (tenantId && RefModel.schema.path("tenantId") && !["Organization", "Permission", "Currency"].includes(modelName)) filter.tenantId = platformOwner ? null : (doc.tenantId || tenantId);
        if (!(await RefModel.exists(filter))) failures.push(`${Model.modelName}.${field} points to missing or cross-tenant ${modelName}:${String(id)}`);
      }
    }
  }
}

async function upsert(Model, filter, fields) {
  let doc = await Model.findOne(filter);
  if (!doc) doc = new Model({ ...filter, ...fields });
  else Object.assign(doc, fields);
  const missing = assertRequiredSchemaFields(Model, doc);
  if (missing.length) throw new Error(`Required fields missing: ${missing.join(", ")}`);
  await doc.validate();
  await doc.save();
  return doc;
}

async function upsertPlain(Model, filter, fields) {
  const doc = await Model.findOneAndUpdate(filter, { $set: fields }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
  return doc;
}

async function createUsers(tenant, roleMap, prefix, ti, platform = false, platformRole = null) {
  const testPassword = getTestPassword();
  const accountSpecs = [
    ["admin", "admin", "Administrator"], ["manager", "tour_manager", "Tour Manager"],
    ["agent1", "agent", "Travel Agent"], ["agent2", "agent", "Travel Agent"],
    ["guide1", "tour_guide", "Tour Guide"], ["guide2", "tour_guide", "Tour Guide"],
    ["driver1", "driver", "Driver"], ["driver2", "driver", "Driver"],
    ["customer1", "customer", "Customer"], ["customer2", "customer", "Customer"],
    ["customer3", "customer", "Customer"], ["customer4", "customer", "Customer"],
  ];
  if (platform) accountSpecs.unshift(["superadmin", "super_admin", "Platform Owner"]);
  const users = [];
  for (let i = 0; i < accountSpecs.length; i++) {
    const [local, role, title] = accountSpecs[i];
    const email = platform && local === "superadmin" ? "superadmin@test.globaltours.co.ke" : `${local}.${prefix}@test.globaltours.co.ke`;
    const id = platform && local === "superadmin" ? null : tenant._id;
    const filter = id ? { tenantId: id, email } : { email, tenantId: null };
    const provision = async () => {
      let user = await User.findOne(filter).select("+password");
      if (!user) user = new User({ ...filter, email });
      user.name = `${title} TEST ${prefix.toUpperCase()} ${local}`;
      user.phone = stablePhone(ti, i + (platform ? 100 : 1));
      user.role = role;
      user.roleId = platform && local === "superadmin" ? platformRole._id : roleMap.get(role)._id;
      user.legacyRole = role;
      user.status = "active";
      user.isVerified = true;
      user.password = testPassword;
      await user.save();
      return User.findById(user._id).select("+password");
    };
    const saved = id ? await provision() : await runWithTenant({ role: "super_admin", bypass: true }, provision);
    if (!saved || !(await saved.matchPassword(testPassword))) throw new Error(`Seed password verification failed for ${email}`);
    users.push(saved);
  }
  return users;
}

async function seedTenant(spec, index, globalPermissionIds, platformRole = null) {
  const tenant = await upsertPlain(Organization, { slug: spec.slug }, {
    name: spec.name, legalName: spec.legalName, supportEmail: `contact.${spec.prefix}@test.globaltours.co.ke`, supportPhone: stablePhone(index, 950),
    address: `TEST Seed Office, ${spec.county}, Kenya`, country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", status: "active",
    subscription: { plan: "professional", seats: 30, trialEndsAt: dates(90) },
    features: { payments: false, mpesa: false, stripe: false, ai: false, customDomain: false },
    settings: { publicBranding: { displayName: `${spec.name} DEMO`, description: "Synthetic test tenant." }, payments: { mode: "disabled" }, etims: { environment: "sandbox", status: "not_configured" }, testSeedNamespace: NAMESPACE },
  });

  const permissions = globalPermissionIds;
  const roleDefs = [
    ["super_admin", "Platform Owner", 100], ["admin", "Tenant Administrator", 90], ["tour_manager", "Tour Manager", 70],
    ["agent", "Travel Agent", 60], ["tour_guide", "Tour Guide", 50], ["driver", "Driver", 40], ["customer", "Customer", 10],
  ];
  const roleMap = new Map();
  let seededUsers = [];
  await runWithTenant({ tenantId: tenant._id, role: "admin", bypass: true }, async () => {
    for (const provider of ["MPESA", "STRIPE", "BANK"]) await upsert(PaymentGatewayConfig, { tenantId: tenant._id, provider }, { tenantId: tenant._id, provider, environment: "sandbox", enabled: false, accountName: `TEST ${provider} disabled`, updatedBy: null });
    for (const [name, displayName, level] of roleDefs) {
      const allowedModules = { super_admin: null, admin: null, tour_manager: new Set(["dashboard", "destination", "tour", "booking", "customer", "report"]), agent: new Set(["dashboard", "tour", "booking", "customer"]), tour_guide: new Set(["dashboard", "tour", "booking"]), driver: new Set(["dashboard", "tour", "booking"]), customer: new Set() }[name];
      const rolePermissions = permissions.filter((permission) => allowedModules === null || allowedModules.has(permission.module));
      roleMap.set(name, await upsert(Role, { tenantId: tenant._id, name }, { displayName, description: `TEST/DEMO ${displayName} role`, level, status: "active", isSystem: true, isDefault: name === "customer", permissions: rolePermissions.map((permission) => permission._id) }));
    }
    const users = await createUsers(tenant, roleMap, spec.prefix, index, Boolean(platformRole), platformRole);
    seededUsers = users;
    const byEmail = new Map(users.map((u) => [u.email, u]));
    const staffByKind = new Map();
    for (const [kind, position, roleName, nth] of [["manager", "tour_manager", "manager", 1], ["guide1", "guide", "guide", 1], ["guide2", "guide", "guide", 2], ["driver1", "driver", "driver", 1], ["driver2", "driver", "driver", 2]]) {
      const accountLocal = kind === "manager" ? "manager" : kind;
      const account = byEmail.get(`${accountLocal}.${spec.prefix}@test.globaltours.co.ke`);
      const staff = await upsert(Staff, { tenantId: tenant._id, email: account.email }, { name: account.name, email: account.email, phone: account.phone, position, role: roleName, status: "active", availability: "available", employmentType: "full_time", languages: ["English", "Swahili"], certifications: ["TEST/DEMO operational induction"], licenseNumber: position === "driver" ? `TEST-KEN-DRV-${index}${nth}` : "", employeeNumber: `TEST-${spec.prefix.toUpperCase()}-STAFF-${kind.toUpperCase()}`, address: `${spec.county}, Kenya`, user: account._id });
      staffByKind.set(kind, staff);
      await upsert(StaffProfile, { tenantId: tenant._id, user: account._id }, { user: account._id, staff: staff._id, bio: `TEST/DEMO ${position} profile.`, address: `${spec.county}, Kenya`, city: spec.county, country: "Kenya", emergencyContact: { name: "TEST Emergency Contact", relationship: "Friend", phone: stablePhone(index, 650 + nth) }, education: ["Tourism operations TEST"], certifications: ["TEST/DEMO induction"], skills: ["Customer service", "Safety"], languages: ["English", "Swahili"], profileCompleted: true });
    }
    const agentUsers = ["agent1", "agent2"].map((local) => byEmail.get(`${local}.${spec.prefix}@test.globaltours.co.ke`));
    const agents = [];
    for (const [i, account] of agentUsers.entries()) agents.push(await upsert(Agent, { tenantId: tenant._id, user: account._id }, { user: account._id, companyName: `TEST ${spec.name} Agent ${i + 1}`, email: account.email, phone: account.phone, commissionRate: 8, status: "active", isApproved: true, approvedBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, approvedAt: new Date(), location: `${spec.county}, Kenya`, description: "Synthetic test travel agent profile.", licenseNumber: `TEST-${spec.prefix.toUpperCase()}-AGENT-LIC-${i + 1}` }));

    const customerUsers = [1, 2, 3, 4].map((n) => byEmail.get(`customer${n}.${spec.prefix}@test.globaltours.co.ke`));
    const customers = [];
    for (const [i, account] of customerUsers.entries()) customers.push(await upsert(Customer, { tenantId: tenant._id, user: account._id }, { user: account._id, agent: agents[i % agents.length]._id, firstName: `Demo${i + 1}`, lastName: `Traveler${spec.prefix}`, email: account.email, phone: account.phone, nationality: "Kenyan", country: "Kenya", county: spec.county, city: spec.county, address: `TEST Seed ${spec.county}, Kenya`, customerType: "individual", status: "active", preferredContactMethod: "email", marketingConsent: false }));
    for (const [i, account] of customerUsers.entries()) await upsert(CustomerProfile, { tenantId: tenant._id, user: account._id }, { tenantId: tenant._id, user: account._id, gender: "other", nationality: "Kenyan", address: `TEST ${spec.county}, Kenya`, city: spec.county, country: "Kenya", emergencyContact: { name: "TEST Emergency Contact", relationship: "Friend", phone: stablePhone(index, 600 + i) }, travelPreferences: { destinations: [spec.county], activities: ["wildlife", "culture"], travelStyle: "family", budgetRange: "medium", preferredAccommodation: "standard", preferredTransport: "road", dietaryRequirements: ["None"], accessibilityNeeds: "None" }, loyaltyPoints: 100 * (i + 1), loyaltyTier: "bronze", totalBookings: 0, completedBookings: 0, cancelledBookings: 0, totalSpent: 0, averageBookingValue: 0, customerType: "new", marketingPreferences: { email: false, sms: false, whatsapp: false, promotions: false }, notes: "TEST/DEMO customer profile.", isActive: true, isDeleted: false });

    const vehicles = [];
    const vehicleSpecs = [["Safari Land Cruiser", "LAND_CRUISER", "KDA TEST 01"], ["Safari Van", "VAN", "KDB TEST 02"], ["Toyota Hiace", "VAN", "KDC TEST 03"], ["Toyota Prado", "SUV", "KDD TEST 04"], ["Transfer Sedan", "SEDAN", "KDE TEST 05"], ["Minibus", "MINIBUS", "KDF TEST 06"]];
    for (const [i, [name, type, registrationNumber]] of vehicleSpecs.entries()) vehicles.push(await upsert(Vehicle, { tenantId: tenant._id, registrationNumber }, { name: `TEST ${name}`, registrationNumber, model: name, manufacturer: name.startsWith("Toyota") ? "Toyota" : "Land Rover", year: 2024, type, capacity: type === "SEDAN" ? 4 : type === "MINIBUS" ? 18 : 7, driver: staffByKind.get(i % 2 ? "driver2" : "driver1")._id, status: i === 5 ? "maintenance" : i === 1 ? "assigned" : "available", isActive: true, isDeleted: false, fuelType: "Diesel", transmission: "Automatic", description: "TEST/DEMO fleet record", nextServiceDate: dates(90) }));

    const destinations = [];
    const dests = ["Maasai Mara", "Amboseli", "Tsavo East", "Tsavo West", "Lake Naivasha", "Lake Nakuru", "Samburu", "Mount Kenya", "Watamu", "Diani", "Lamu", "Nairobi National Park"];
    for (const [i, name] of dests.entries()) destinations.push(await upsert(Destination, { tenantId: tenant._id, slug: `test-${spec.prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }, { name: `TEST ${name}`, slug: `test-${spec.prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, country: "Kenya", region: spec.county, city: spec.county, description: `TEST/DEMO destination fixture ${i + 1} in Kenya.`, shortDescription: `TEST ${name} visit`, featuredImage: publicImage, images: [{ url: publicImage }], attractions: ["Wildlife", "Culture"], activities: ["Guided tour", "Photography"], languages: ["English", "Swahili"], currency: "KES", timezone: "Africa/Nairobi", status: "active", active: true, isDeleted: false }));
    for (const [i, account] of customerUsers.entries()) await upsert(UserPreference, { tenantId: tenant._id, user: account._id }, { user: account._id, interests: ["wildlife", "culture"], preferredCountries: ["Kenya"], preferredDestinations: [destinations[i]._id], preferredCategories: ["Safari", "Cultural"], travelStyle: ["Family", "Group"], budgetRange: { min: 30000, max: 200000 }, preferredAccommodation: "Standard", preferredTransport: "Road", language: "English", receivePromotions: false, receiveNewsletters: false });

    const category = await upsert(TourCategory, { tenantId: tenant._id, slug: `test-${spec.prefix}-safari` }, { tenantId: tenant._id, name: `TEST ${spec.name} Safari`, slug: `test-${spec.prefix}-safari`, icon: "Map", description: "Synthetic safari category.", image: publicImage, active: true });
    const tours = [];
    for (let i = 0; i < 8; i++) {
      const destination = destinations[i % destinations.length];
      const title = `TEST ${spec.name} Safari ${String(i + 1).padStart(2, "0")}`;
      tours.push(await upsert(Tour, { tenantId: tenant._id, slug: `test-${spec.prefix}-safari-${i + 1}` }, {
        title, slug: `test-${spec.prefix}-safari-${i + 1}`, description: `TEST/DEMO guided itinerary for ${destination.name}, Kenya.`, shortDescription: `TEST Kenya safari ${i + 1}`,
        destination: destination._id, country: "Kenya", location: destination.region || spec.county, category: "Safari", tags: ["TEST", "DEMO", "Kenya"], meetingPoint: "Nairobi CBD TEST pickup", duration: "3", durationDays: 3, durationDetails: { days: 3, nights: 2 }, date: dates(45 + i), startDate: dates(45 + i), capacity: 40,
        price: 45000 + i * 2500, agentPrice: 42000 + i * 2500, discount: 5, taxEnabled: false, taxCategory: "NON_VAT", taxMode: "exclusive", featuredImage: { url: publicImage }, gallery: [{ url: publicImage }], highlights: ["TEST wildlife viewing", "Kenyan guide"], inclusions: ["Transport", "Guide"], exclusions: ["International flights"], languages: ["English", "Swahili"], difficulty: "easy",
        itinerary: [1, 2, 3].map((day) => ({ day, title: `TEST Day ${day}`, description: "Synthetic sample itinerary day in Kenya.", activities: ["Guided sightseeing"], meals: ["Breakfast"] })), availability: [{ date: dates(45 + i), totalSlots: 40, bookedSlots: 0 }], availabilitySettings: { totalSlots: 40, bookedSlots: 0, waitlistEnabled: true }, bookingDeadline: 1, cancellationPolicy: "TEST/DEMO cancellation policy; no real booking is created.", status: "upcoming", published: true, featured: i < 2, available: true, isDeleted: false, assignedGuide: staffByKind.get("guide1")._id, assignedDriver: staffByKind.get("driver1")._id, assignedVehicle: vehicles[0]._id,
      }));
    }
    for (const tour of tours) await upsert(Itinerary, { tenantId: tenant._id, tour: tour._id }, { tenantId: tenant._id, tour: tour._id, days: [1, 2, 3].map((dayNumber) => ({ dayNumber, title: `TEST Day ${dayNumber}`, summary: "Synthetic Kenya itinerary day.", activities: [{ title: "Guided sightseeing", startTime: "09:00", endTime: "12:00", description: "Demo itinerary activity.", location: spec.county, meal: dayNumber === 1 ? "lunch" : "breakfast", transport: "TEST safari vehicle", image: publicImage }] })), overview: "TEST/DEMO multi-day itinerary.", highlights: ["Wildlife", "Culture"], included: ["Guide", "Transport"], excluded: ["International airfare"], status: "published", createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id });
    for (const tour of tours) await upsert(TourGallery, { tenantId: tenant._id, tour: tour._id }, { tenantId: tenant._id, tour: tour._id, images: [{ url: publicImage, caption: "TEST/DEMO safari gallery image", alt: "Synthetic Kenya safari image", uploadedBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, featured: true, order: 0 }], active: true, isDeleted: false, createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id });
    await upsert(Gallery, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari gallery` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari gallery`, image: { url: publicImage, publicId: "" }, category: "Safari", featured: false, active: true });
    await upsert(Media, { tenantId: tenant._id, fileName: `test-${spec.prefix}-safari-image.jpg` }, { tenantId: tenant._id, fileName: `test-${spec.prefix}-safari-image.jpg`, originalName: `TEST ${spec.name} safari image`, url: publicImage, publicId: "", fileType: "image", mimeType: "image/jpeg", extension: "jpg", size: 0, folder: "test-demo", category: "tour", tags: ["TEST", "DEMO"], relatedModel: "Tour", relatedId: tours[0]._id, uploadedBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, visibility: "public", isDeleted: false });
    const packages = [];
    for (let i = 0; i < 3; i++) packages.push(await upsert(TourPackage, { tenantId: tenant._id, slug: `test-${spec.prefix}-package-${i + 1}` }, {
      title: `TEST ${spec.name} Package ${i + 1}`, slug: `test-${spec.prefix}-package-${i + 1}`, description: "Synthetic sample multi-day Kenya safari package.", destination: destinations[i].name, category: "Safari", duration: String(3 + i), numberOfDays: 3 + i, basePrice: 75000 + i * 5000, agentPrice: 70000 + i * 5000, createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, status: "active", published: true, inclusions: ["Transport", "Guide"], exclusions: ["Airfare"], highlights: ["TEST safari", "Kenyan guide"], itinerary: Array.from({ length: 3 + i }, (_, index) => ({ day: index + 1, title: `TEST Day ${index + 1}`, description: "Synthetic sample itinerary day." })), coverImage: { url: publicImage }, gallery: [{ url: publicImage }],
    }));
    await upsert(HeroSlide, { tenantId: tenant._id, title: `TEST ${spec.prefix} homepage slide` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} homepage slide`, subtitle: "Synthetic demo content", image: { url: publicImage, publicId: "" }, badge: "TEST/DEMO", buttonOne: { text: "Explore test tours", link: "/tours" }, buttonTwo: { text: "Test booking", link: "/book" }, active: true, order: 99 });

    await upsert(Coupon, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-SAVE10` }, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-SAVE10`, description: "Synthetic demo coupon.", discountType: "percentage", amount: 10, startDate: new Date(), expiresAt: dates(90), usageLimit: 100, usedCount: 0, minimumBookingAmount: 10000, maximumDiscount: 20000, active: true, createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id });
    await upsert(Promotion, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari promotion` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari promotion`, description: "Synthetic demo promotion.", code: `TEST-${spec.prefix.toUpperCase()}-PROMO`, discountType: "percentage", discountValue: 5, startDate: new Date(), endDate: dates(60), tours: [tours[0]._id], audience: "all", usageLimit: 100, usageCount: 0, active: true, isDeleted: false, createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id });
    await upsert(Campaign, { tenantId: tenant._id, name: `TEST ${spec.prefix} demo campaign` }, { tenantId: tenant._id, name: `TEST ${spec.prefix} demo campaign`, description: "Synthetic campaign; no messages are delivered.", type: "email", subject: "TEST demo only", message: "Synthetic marketing content. Do not send.", audience: "custom", recipients: [], status: "draft", totalRecipients: 0, sentCount: 0, deliveredCount: 0, failedCount: 0, openedCount: 0, clickedCount: 0, unsubscribedCount: 0, createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, isDeleted: false });
    for (let i = 0; i < customerUsers.length; i++) {
      const user = customerUsers[i];
      await upsert(Loyalty, { tenantId: tenant._id, user: user._id }, { user: user._id, availablePoints: 100 * (i + 1), lifetimePoints: 200 * (i + 1), redeemedPoints: 100 * i, expiredPoints: 0, tier: "Bronze", referralCode: `TEST-${spec.prefix.toUpperCase()}-LOYAL-${i + 1}`, successfulReferrals: i, status: "active", transactions: [] });
      await upsert(LoyaltyAccount, { tenantId: tenant._id, customerId: user._id }, { tenantId: tenant._id, customerId: user._id, points: 100 * (i + 1), lifetimeEarned: 200 * (i + 1), lifetimeRedeemed: 100 * i, referralCode: `TEST-${spec.prefix.toUpperCase()}-REF-${i + 1}` });
      await upsert(Wishlist, { tenantId: tenant._id, user: user._id }, { user: user._id, tours: [tours[i]._id, tours[(i + 1) % tours.length]._id] });
      if (i > 0) await upsert(Referral, { tenantId: tenant._id, referredUser: user._id }, { tenantId: tenant._id, referrer: customerUsers[0]._id, referredUser: user._id, booking: null, referralCode: `TEST-${spec.prefix.toUpperCase()}-REF-1`, reward: 250, rewardType: "points", status: ["pending", "qualified", "approved"][i - 1], notes: "Synthetic test referral." });
    }

    const bookings = [];
    const states = ["pending", "confirmed", "assigned", "completed", "cancelled", "refunded", "confirmed", "pending", "assigned", "completed"];
    for (let i = 0; i < 10; i++) {
      const customer = customers[i % customers.length]; const user = customerUsers[i % customerUsers.length]; const tour = tours[i % tours.length]; const status = states[i];
      const paymentStatus = i === 2 || i === 6 ? "partial" : i === 3 ? "paid" : i === 5 ? "refunded" : "pending";
      const total = tour.price * (1 + (i % 2)); const paid = paymentStatus === "paid" ? total : paymentStatus === "partial" ? Math.round(total / 2) : 0;
      bookings.push(await upsert(Booking, { tenantId: tenant._id, bookingNumber: `TEST-${spec.prefix.toUpperCase()}-BK-${String(i + 1).padStart(4, "0")}` }, {
        bookingNumber: `TEST-${spec.prefix.toUpperCase()}-BK-${String(i + 1).padStart(4, "0")}`, customer: customer._id, user: user._id, customerSnapshot: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone }, contact: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone }, tour: tour._id, travelDate: tour.date, travelers: [{ name: `${customer.firstName} ${customer.lastName}`, age: 30, nationality: "Kenyan" }], numberOfGuests: 1 + (i % 2), subtotal: total, totalAmount: total, amountPaid: paid, balanceAmount: Math.max(0, total - paid), paymentMethod: i % 3 === 0 ? "MPESA" : i % 3 === 1 ? "CARD" : "BANK_TRANSFER", paymentStatus, status, agent: agents[i % agents.length]._id, assignedGuide: staffByKind.get("guide1")._id, assignedDriver: staffByKind.get("driver1")._id, assignedVehicle: vehicles[0]._id, bookingSource: "admin", notes: "TEST/DEMO fixture; no real trip or payment.", refundAmount: paymentStatus === "refunded" ? total : 0, refundStatus: paymentStatus === "refunded" ? "completed" : "none", isDeleted: false,
      }));
    }
    const payments = [];
    for (let i = 0; i < 10; i++) {
      const booking = bookings[i]; const amount = Math.max(1, Number(booking.amountPaid || booking.totalAmount));
      const status = i === 0 ? "pending" : i === 1 ? "failed" : i === 5 ? "refunded" : [2, 3, 6].includes(i) ? "completed" : "pending";
      const provider = [0, 5, 6].includes(i) ? "MPESA" : [1, 2].includes(i) ? "STRIPE" : "BANK";
      const method = provider === "MPESA" ? "mpesa" : provider === "STRIPE" ? "card" : "bank";
      const paymentMethod = provider === "MPESA" ? "MPESA" : provider === "STRIPE" ? "CARD" : "BANK_TRANSFER";
      payments.push(await upsert(Payment, { tenantId: tenant._id, transactionReference: `TEST-PAY-${spec.prefix.toUpperCase()}-${String(i + 1).padStart(6, "0")}` }, { tenantId: tenant._id, customer: booking.user, user: booking.user, booking: booking._id, provider, method, paymentMethod, amount, currency: "KES", status, transactionReference: `TEST-PAY-${spec.prefix.toUpperCase()}-${String(i + 1).padStart(6, "0")}`, transactionId: provider === "MPESA" ? `TEST-MPESA-${String(index * 100 + i + 1).padStart(6, "0")}` : `TEST-${spec.prefix.toUpperCase()}-TX-${i + 1}`, failureReason: status === "failed" ? "Synthetic test decline; no gateway was contacted." : "", refundStatus: status === "refunded" ? "completed" : "none", refundReference: status === "refunded" ? `TEST-REFUND-${spec.prefix.toUpperCase()}-000001` : "", refundedAt: status === "refunded" ? dates(-1) : null, notes: "Synthetic test payment record; no gateway call was made.", paidAt: ["completed", "refunded"].includes(status) ? dates(-1) : null, refundedAmount: status === "refunded" ? amount : 0 }));
    }
    for (const [i, booking] of bookings.entries()) {
      const amount = Number(booking.totalAmount); const amountPaid = Number(booking.amountPaid || 0);
      const payment = payments[i];
      booking.payments = [payment._id];
      booking.paymentReference = payment.transactionReference;
      await booking.save();
      await upsert(Invoice, { tenantId: tenant._id, booking: booking._id }, { tenantId: tenant._id, booking: booking._id, customer: booking.customer, user: booking.user, tour: booking.tour, invoiceNumber: `TEST-${spec.prefix.toUpperCase()}-INV-${String(i + 1).padStart(5, "0")}`, subtotal: amount, taxableAmount: amount, discount: 0, tax: 0, taxRate: 0, totalAmount: amount, amountPaid, balance: Math.max(0, amount - amountPaid), currency: "KES", dueDate: dates(30), status: booking.status === "refunded" ? "refunded" : amountPaid >= amount ? "paid" : amountPaid > 0 ? "partial" : "pending", etimsStatus: "not_configured", etimsResponse: { syntheticTest: true, namespace: NAMESPACE }, items: [{ description: "TEST tour booking", quantity: 1, unitPrice: amount, taxableAmount: amount, taxRate: 0, taxAmount: 0, totalAmount: amount }], notes: "Synthetic invoice; not submitted to KRA/eTIMS." });
    }
    const refundedBooking = bookings[5];
    await upsert(Refund, { tenantId: tenant._id, booking: refundedBooking._id, payment: payments[5]._id }, { tenantId: tenant._id, booking: refundedBooking._id, payment: payments[5]._id, amount: payments[5].amount, reason: "Synthetic test refund; no funds moved.", method: "mpesa", status: "completed", mpesaReference: `TEST-REFUND-${spec.prefix.toUpperCase()}-000001`, processedAt: dates(-1) });
    for (const [i, booking] of [bookings[3], bookings[5]].entries()) {
      const invoice = await Invoice.findOne({ tenantId: tenant._id, booking: booking._id });
      await upsert(CreditDebitNote, { tenantId: tenant._id, noteNumber: `TEST-${spec.prefix.toUpperCase()}-${i ? "CN" : "DN"}-000001` }, { tenantId: tenant._id, noteNumber: `TEST-${spec.prefix.toUpperCase()}-${i ? "CN" : "DN"}-000001`, type: i ? "credit" : "debit", originalInvoice: invoice._id, originalInvoiceNumber: invoice.invoiceNumber, reason: "Synthetic test adjustment; no KRA/eTIMS submission.", amount: 1000, taxAmount: 0, totalAmount: 1000, taxRate: 0, status: "draft", etimsStatus: "not_submitted", etimsResponse: { syntheticTest: true, namespace: NAMESPACE } });
    }
    const etimsInvoice = await Invoice.findOne({ tenantId: tenant._id, booking: bookings[0]._id });
    await upsert(EtimsSubmission, { tenantId: tenant._id, idempotencyKey: `TEST-ETIMS-${spec.prefix.toUpperCase()}-001` }, { tenantId: tenant._id, documentType: "invoice", documentId: etimsInvoice._id, documentNumber: etimsInvoice.invoiceNumber, attempt: 1, status: "pending", idempotencyKey: `TEST-ETIMS-${spec.prefix.toUpperCase()}-001`, response: { syntheticTest: true, namespace: NAMESPACE, submittedExternally: false }, error: "TEST/DEMO placeholder; no eTIMS call was made." });
    await upsert(Quotation, { tenantId: tenant._id, quotationNumber: `TEST-${spec.prefix.toUpperCase()}-QT-001` }, { tenantId: tenant._id, quotationNumber: `TEST-${spec.prefix.toUpperCase()}-QT-001`, agent: agents[0]._id, customer: customers[0]._id, tour: tours[0]._id, tourPackage: packages[0]._id, items: [{ name: "TEST safari package", category: "Activity", description: "Synthetic quotation line.", quantity: 1, unitPrice: 75000, total: 75000 }], subtotal: 75000, tax: 0, discount: 0, grandTotal: 75000, currency: "KES", status: "sent", validUntil: dates(14), sentAt: new Date(), notes: "TEST/DEMO quotation; not an offer to a real customer." });
    const paymentLinkFilter = { tenantId: tenant._id, booking: bookings[0]._id };
    const existingPaymentLink = await PaymentLink.findOne(paymentLinkFilter).lean();
    await upsert(PaymentLink, paymentLinkFilter, { token: existingPaymentLink?.token || randomBytes(32).toString("hex"), booking: bookings[0]._id, invoice: await Invoice.findOne({ tenantId: tenant._id, booking: bookings[0]._id }).then((invoice) => invoice._id), amount: bookings[0].balanceAmount || 1, currency: "KES", status: "cancelled", expiresAt: dates(-1), createdBy: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id });

    const suppliers = [];
    for (const [i, category] of ["accommodation", "transport", "activity", "guide", "equipment"].entries()) suppliers.push(await upsert(Supplier, { tenantId: tenant._id, supplierNumber: `TEST-${spec.prefix.toUpperCase()}-SUP-${i + 1}` }, { tenantId: tenant._id, supplierNumber: `TEST-${spec.prefix.toUpperCase()}-SUP-${i + 1}`, legalName: `TEST ${category} supplier ${spec.name}`, tradingName: `Demo ${category}`, category, contacts: [{ name: "Demo Contact", email: `supplier${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 800 + i), role: "TEST contact" }], address: `${spec.county}, Kenya`, paymentTermsDays: 30, status: "active", notes: "Synthetic supplier data." }));
    for (let i = 0; i < 2; i++) await upsert(PurchaseOrder, { tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}` }, { tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}`, supplier: suppliers[i]._id, booking: bookings[i]._id, tour: tours[i]._id, issueDate: dates(-2), expectedDate: dates(10), currency: "KES", lines: [{ description: "TEST safari supply", quantity: 2, unitCost: 5000, taxRate: 0, taxType: "non_vat" }], status: "approved", notes: "Synthetic purchase order." });
    for (let i = 0; i < 2; i++) await upsert(SupplierPayable, { tenantId: tenant._id, payableNumber: `TEST-${spec.prefix.toUpperCase()}-PAYABLE-${i + 1}` }, { tenantId: tenant._id, payableNumber: `TEST-${spec.prefix.toUpperCase()}-PAYABLE-${i + 1}`, supplier: suppliers[i]._id, purchaseOrder: await PurchaseOrder.findOne({ tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}` }).then((po) => po._id), booking: bookings[i]._id, tour: tours[i]._id, amount: 10000, amountPaid: i ? 2500 : 0, dueDate: dates(30), status: i ? "partially_paid" : "open", paymentMethod: "BANK_TRANSFER", notes: "Synthetic supplier payable." });
    for (const [i, category] of ["fuel", "marketing", "office", "software", "communications", "transport", "accommodation", "operations"].entries()) await upsert(Expense, { tenantId: tenant._id, expenseNumber: `TEST-${spec.prefix.toUpperCase()}-EXP-${i + 1}` }, { tenantId: tenant._id, expenseNumber: `TEST-${spec.prefix.toUpperCase()}-EXP-${i + 1}`, category, description: `TEST ${category} expense`, amount: 2500 + i * 100, currency: "KES", expenseDate: dates(-i), status: i % 2 ? "approved" : "paid", paymentMethod: "BANK_TRANSFER", notes: "Synthetic test expense." });
    await upsert(FixedAsset, { tenantId: tenant._id, assetNumber: `TEST-${spec.prefix.toUpperCase()}-ASSET-001` }, { tenantId: tenant._id, assetNumber: `TEST-${spec.prefix.toUpperCase()}-ASSET-001`, name: `TEST ${spec.name} office equipment`, category: "equipment", acquisitionDate: dates(-100), acquisitionCost: 85000, residualValue: 5000, usefulLifeMonths: 36, accumulatedDepreciation: 5000, status: "active" });
    for (const [i, type] of ["vehicle", "guide", "transfer", "park_fee"].entries()) await upsert(OperationalAsset, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-OPS-${i + 1}` }, { tenantId: tenant._id, type, name: `TEST ${type} operation ${i + 1}`, code: `TEST-${spec.prefix.toUpperCase()}-OPS-${i + 1}`, status: "available", bookingId: bookings[i]._id, tourId: tours[i]._id, assignedTo: customerUsers[0]._id, startAt: dates(30), endAt: dates(31), metadata: { namespace: NAMESPACE, synthetic: true }, notes: "Synthetic operational asset fixture." });
    for (const tour of tours) for (const [i, category] of ["accommodation", "transport", "park", "guide", "driver", "meals", "activity", "miscellaneous"].entries()) await upsert(TourCost, { tenantId: tenant._id, tour: tour._id, category }, { tenantId: tenant._id, tour: tour._id, category, description: `TEST ${category} cost`, quantity: 1, unitCost: 1000 + i * 100, currency: "KES", status: "estimated" });
    for (const [i, booking] of bookings.entries()) {
      const status = ["cancelled", "refunded"].includes(booking.status) ? "cancelled" : ["pending", "approved", "paid"][i % 3];
      await upsert(Commission, { tenantId: tenant._id, booking: booking._id, agent: agents[i % agents.length]._id }, { tenantId: tenant._id, agent: agents[i % agents.length]._id, booking: booking._id, customer: booking.user, tour: booking.tour, bookingAmount: booking.totalAmount, rate: 8, amount: booking.totalAmount * 0.08, status, paymentMethod: status === "paid" ? "BANK_TRANSFER" : undefined, paymentReference: status === "paid" ? `TEST-COMMISSION-${spec.prefix.toUpperCase()}-${i + 1}` : "", paidAt: status === "paid" ? dates(-1) : null, approvedBy: status === "approved" ? byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id : null, approvedAt: status === "approved" ? dates(-1) : null, notes: "TEST commission; no external payment occurred." });
    }

    const hotel = await upsert(Hotel, { tenantId: tenant._id, slug: `test-${spec.prefix}-hotel` }, { tenantId: tenant._id, name: `TEST ${spec.name} Safari Lodge`, slug: `test-${spec.prefix}-hotel`, description: "Synthetic demo accommodation.", location: spec.county, address: `TEST lodge, ${spec.county}, Kenya`, city: spec.county, county: spec.county, country: "Kenya", starRating: 4, amenities: ["Wi-Fi", "Breakfast"], images: [publicImage], contactPhone: stablePhone(index, 960), contactEmail: `hotel.${spec.prefix}@test.globaltours.co.ke`, status: "active", currency: "KES" });
    await upsert(HospitalitySupplierContract, { tenantId: tenant._id, contractNumber: `TEST-${spec.prefix.toUpperCase()}-HOTEL-CONTRACT-001` }, { tenantId: tenant._id, supplierName: `TEST ${spec.name} Lodge`, supplierType: "hotel", hotel: hotel._id, contactName: "Demo Lodge Contact", contactPhone: stablePhone(index, 961), contactEmail: `hotel.${spec.prefix}@test.globaltours.co.ke`, contractNumber: `TEST-${spec.prefix.toUpperCase()}-HOTEL-CONTRACT-001`, currency: "KES", commissionPercent: 0, depositPercent: 0, rates: [{ name: "TEST Standard", roomType: "Deluxe", unit: "night", amount: 12000 }], validFrom: new Date("2026-01-01"), validTo: new Date("2027-12-31"), paymentTerms: "TEST prepaid at property", cancellationTerms: "TEST demo cancellation terms", status: "active", notes: "Synthetic test contract only; no supplier agreement exists." });
    const room = await upsert(HotelRoomType, { tenantId: tenant._id, hotel: hotel._id, name: "TEST Deluxe Room" }, { tenantId: tenant._id, hotel: hotel._id, name: "TEST Deluxe Room", description: "Synthetic room inventory.", maxAdults: 2, maxChildren: 1, beds: ["Queen"], amenities: ["Wi-Fi"], totalRooms: 20, availableRooms: 18, nightlyRate: 12000, mealPlans: ["breakfast"], currency: "KES", status: "active" });
    const ratePlan = await upsert(HospitalityRatePlan, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, name: "TEST Flexible" }, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, name: "TEST Flexible", nightlyRate: 12000, currency: "KES", status: "active", mealPlan: "breakfast" });
    const hotelBooking = await upsert(HotelBooking, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-HOTEL-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-HOTEL-001`, hotel: hotel._id, roomType: room._id, ratePlan: ratePlan._id, customer: customers[0]._id, user: customerUsers[0]._id, linkedBooking: bookings[0]._id, checkIn: dates(20), checkOut: dates(22), rooms: 1, adults: 2, guests: [{ firstName: "Demo", lastName: "Traveler", email: customerUsers[0].email, phone: customerUsers[0].phone, nationality: "Kenyan" }], subtotal: 24000, totalAmount: 24000, status: "confirmed", paymentStatus: "pending", source: "booking", currency: "KES" });
    await upsert(AccommodationInventory, { tenantId: tenant._id, propertyName: hotel.name, roomType: room.name }, { tenantId: tenant._id, propertyName: hotel.name, location: hotel.location, roomType: room.name, totalRooms: room.totalRooms, availableRooms: room.availableRooms, nightlyRate: room.nightlyRate, currency: "KES", status: "active", notes: "Synthetic inventory; not a live hotel feed." });
    const blockStart = new Date("2026-11-15T00:00:00.000Z"); const blockEnd = new Date("2026-11-17T00:00:00.000Z");
    await upsert(HospitalityRoomBlock, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, startDate: blockStart, endDate: blockEnd }, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, startDate: blockStart, endDate: blockEnd, quantity: 1, reason: "TEST maintenance block", status: "blocked" });
    await upsert(HospitalityDeposit, { tenantId: tenant._id, hospitalityType: "hotel", hospitalityBooking: hotelBooking._id }, { tenantId: tenant._id, hospitalityType: "hotel", hospitalityBooking: hotelBooking._id, amount: 5000, paidAmount: 0, dueDate: dates(10), status: "pending", notes: "Synthetic demo deposit; no payment requested." });
    const transfer = await upsert(AirportTransfer, { tenantId: tenant._id, name: `TEST ${spec.prefix} airport transfer` }, { tenantId: tenant._id, name: `TEST ${spec.prefix} airport transfer`, airportName: "Jomo Kenyatta International Airport TEST", airportCode: "NBO", direction: "airport_to_destination", pickupLocation: "JKIA TEST terminal", dropoffLocation: `${spec.county} hotel`, vehicleType: "TEST Van", passengerCapacity: 7, price: 6000, currency: "KES", status: "active", notes: "Synthetic transfer fixture." });
    const transferBooking = await upsert(AirportTransferBooking, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-TRANSFER-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-TRANSFER-001`, transfer: transfer._id, customer: customers[0]._id, user: customerUsers[0]._id, linkedBooking: bookings[0]._id, pickupDateTime: dates(20), pickupLocation: "JKIA TEST terminal", dropoffLocation: `${spec.county} hotel`, passengerName: `${customers[0].firstName} ${customers[0].lastName}`, passengerPhone: customers[0].phone, passengerEmail: customers[0].email, passengers: 2, subtotal: 6000, totalAmount: 6000, assignedVehicle: vehicles[4]._id, assignedDriver: byEmail.get(`driver1.${spec.prefix}@test.globaltours.co.ke`)._id, status: "confirmed", paymentStatus: "pending", source: "booking" });
    await upsert(HospitalityDeposit, { tenantId: tenant._id, hospitalityType: "airport_transfer", hospitalityBooking: transferBooking._id }, { tenantId: tenant._id, hospitalityType: "airport_transfer", hospitalityBooking: transferBooking._id, amount: 1000, paidAmount: 0, dueDate: dates(10), status: "pending", notes: "Synthetic demo transfer deposit; no payment requested." });
    for (let i = 0; i < 3; i++) await upsert(Review, { tenantId: tenant._id, booking: bookings[i + 3]._id }, { tenantId: tenant._id, user: customerUsers[i % 4]._id, customer: customerUsers[i % 4]._id, tour: bookings[i + 3].tour, booking: bookings[i + 3]._id, rating: i + 3, title: "TEST sample review", comment: "Synthetic review text for a demo record.", verified: true, approved: i !== 0, rejected: false });
    for (let i = 0; i < 4; i++) await upsert(Lead, { tenantId: tenant._id, phone: stablePhone(index, 700 + i) }, { tenantId: tenant._id, name: `TEST prospective traveler ${i + 1}`, email: `lead${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 700 + i), country: "Kenya", county: spec.county, city: spec.county, tour: tours[i]._id, travelDate: tours[i].date, guests: 2, message: `${NAMESPACE} synthetic lead`, source: "test_seed", status: ["new", "contacted", "qualified", "lost"][i] });
    for (let i = 0; i < 2; i++) await upsert(CustomTourRequest, { tenantId: tenant._id, requirements: `${NAMESPACE} ${spec.prefix} request ${i + 1}` }, { customer: customerUsers[i]._id, user: customerUsers[i]._id, guestContact: { name: `${customers[i].firstName} ${customers[i].lastName}`, email: customerUsers[i].email, phone: customerUsers[i].phone }, destination: destinations[i].name, durationDays: 4, people: 2, startDate: dates(100), budget: 180000, requirements: `${NAMESPACE} ${spec.prefix} request ${i + 1}`, status: i ? "quoted" : "pending", assignedAgent: agents[i % 2]._id });
    await upsert(TravelServiceRequest, { tenantId: tenant._id, title: `TEST airport support ${spec.prefix}` }, { tenantId: tenant._id, type: "airport_transfer", title: `TEST airport support ${spec.prefix}`, description: "Synthetic customer service request.", status: "open", priority: "normal", customer: customerUsers[0]._id, booking: bookings[0]._id });

    for (const [i, companyName] of ["Safari Corporate Ltd", "East Africa Business Travel Ltd", "Kenya Events Group", "Global NGO Travel Ltd", "Nairobi Consulting Services Ltd"].entries()) await upsert(CorporateAccount, { tenantId: tenant._id, companyName: `TEST ${companyName} ${spec.prefix}` }, { tenantId: tenant._id, companyName: `TEST ${companyName} ${spec.prefix}`, billingContacts: [{ name: `Demo Contact ${i + 1}`, email: `corporate${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980 + i), title: "TEST procurement" }], paymentTerms: "30_days", creditLimit: 1000000, status: "active", notes: "Synthetic corporate test account; no real business affiliation." });
    const corporate = await CorporateAccount.findOne({ tenantId: tenant._id, companyName: `TEST Safari Corporate Ltd ${spec.prefix}` });
    for (const [i, notificationEvent] of ["booking confirmation", "payment received", "payment failure", "tour reminder", "cancellation", "refund", "assignment", "new lead", "invoice generated"].entries()) await upsert(Notification, { tenantId: tenant._id, recipient: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, title: `TEST ${spec.prefix} ${notificationEvent}` }, { tenantId: tenant._id, recipient: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, title: `TEST ${spec.prefix} ${notificationEvent}`, message: `Synthetic notification fixture: ${notificationEvent}. No real event occurred.`, type: i < 2 ? "booking" : i === 2 ? "payment" : "system", priority: "normal", isSent: false, metadata: { namespace: NAMESPACE, synthetic: true } });
    await upsert(Booking, { tenantId: tenant._id, bookingNumber: `TEST-${spec.prefix.toUpperCase()}-CORP-001` }, { bookingNumber: `TEST-${spec.prefix.toUpperCase()}-CORP-001`, bookingType: "corporate", corporateAccount: corporate._id, corporateCompanyName: corporate.companyName, customer: customers[0]._id, user: customerUsers[0]._id, tour: tours[0]._id, travelDate: tours[0].date, totalAmount: tours[0].price, subtotal: tours[0].price, status: "confirmed", paymentStatus: "pending", paymentTerms: "credit", billingContact: { name: "Demo Procurement Contact", email: `corporate.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980) }, contact: { name: "Demo Procurement Contact", email: `corporate.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980) }, numberOfGuests: 4 });
    for (const tour of tours) {
        const bookedTotals = await Booking.aggregate([{ $match: { tenantId: tenant._id, tour: tour._id, status: { $nin: ["cancelled", "refunded"] }, isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }]);
        const bookedSlots = Number(bookedTotals[0]?.total || 0);
      tour.availabilitySettings.bookedSlots = bookedSlots;
      if (tour.availability?.length) tour.availability[0].bookedSlots = bookedSlots;
      await tour.save();
    }
    for (const customer of customers) {
      const customerBookings = await Booking.find({ tenantId: tenant._id, customer: customer._id, isDeleted: { $ne: true } }).sort({ createdAt: 1 });
      const completed = customerBookings.filter((booking) => booking.status === "completed");
      const cancelled = customerBookings.filter((booking) => ["cancelled", "refunded"].includes(booking.status));
      const totalSpent = customerBookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0);
      customer.totalBookings = customerBookings.length;
      customer.completedBookings = completed.length;
      customer.cancelledBookings = cancelled.length;
      customer.totalSpent = totalSpent;
      customer.lastBookingDate = customerBookings.at(-1)?.createdAt || null;
      await customer.save();
      await upsert(CustomerProfile, { tenantId: tenant._id, user: customer.user }, { tenantId: tenant._id, user: customer.user, totalBookings: customerBookings.length, completedBookings: completed.length, cancelledBookings: cancelled.length, totalSpent, averageBookingValue: customerBookings.length ? totalSpent / customerBookings.length : 0, lastBookingDate: customer.lastBookingDate, lastTravelDate: completed.at(-1)?.travelDate || null });
    }

    const coa = [];
    for (const [code, name, type] of [["1000", "TEST Cash", "asset"], ["4000", "TEST Tour Revenue", "revenue"], ["5000", "TEST Tour Expense", "expense"]]) coa.push(await upsert(ChartOfAccount, { tenantId: tenant._id, code }, { tenantId: tenant._id, code, name, type, active: true, description: "Synthetic chart account." }));
    await upsert(AccountingPeriod, { tenantId: tenant._id, period: "2026-09" }, { tenantId: tenant._id, period: "2026-09", note: `${NAMESPACE} synthetic accounting period` });
    await upsert(FinanceBudget, { tenantId: tenant._id, name: "TEST 2026 travel budget", fiscalYear: 2026, accountCode: "5000" }, { tenantId: tenant._id, name: "TEST 2026 travel budget", fiscalYear: 2026, accountCode: "5000", amount: 1000000, currency: "KES", status: "approved" });
    await upsert(TaxRule, { tenantId: tenant._id, code: "TEST-NONVAT" }, { tenantId: tenant._id, code: "TEST-NONVAT", name: "Synthetic non-VAT test rule", taxType: "NON_VAT", rate: 0, isActive: true, effectiveFrom: new Date("2026-01-01") });
    await upsert(TaxProfile, { tenantId: tenant._id }, { tenantId: tenant._id, kraPin: "TEST-NOT-A-REAL-KRA-PIN", kraPinStatus: "not_verified", vatRegistered: false, taxRegime: "NON_VAT", etimsEnabled: false, etimsEnvironment: "sandbox", complianceNotes: "TEST/DEMO only; no government registration or eTIMS submission." });
    await upsert(JournalEntry, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001`, description: "TEST balanced opening demo entry", entryDate: dates(-1), status: "posted", postedAt: dates(-1), lines: [{ account: coa[0]._id, description: "Synthetic test debit", debit: 10000, credit: 0 }, { account: coa[1]._id, description: "Synthetic test credit", debit: 0, credit: 10000 }] });
    for (const [i, type] of ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"].entries()) await upsert(ComplianceRecord, { tenantId: tenant._id, type }, { tenantId: tenant._id, type, status: "not_started", referenceNumber: `TEST-${spec.prefix.toUpperCase()}-COMPLIANCE-${i + 1}`, authority: "TEST/DEMO", notes: "Synthetic demo record; not a regulatory registration, approval, or submission." });
    for (const [i, type] of ["access", "correction", "deletion", "portability", "restriction"].entries()) await upsert(PrivacyRequest, { tenantId: tenant._id, type, requesterEmail: `privacy${i + 1}.${spec.prefix}@test.globaltours.co.ke` }, { tenantId: tenant._id, type, requesterName: `TEST requester ${i + 1}`, requesterEmail: `privacy${i + 1}.${spec.prefix}@test.globaltours.co.ke`, status: ["received", "identity_verification", "in_progress", "completed", "received"][i], details: "Synthetic privacy request for test data." });

    const webhook = await upsert(Webhook, { tenantId: tenant._id, name: `TEST webhook ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST webhook ${spec.prefix}`, url: "https://example.invalid/test-webhook", secret: randomBytes(32).toString("hex"), events: ["booking.created"], active: false });
    await upsert(WebhookDelivery, { tenantId: tenant._id, webhookId: webhook._id, eventId: `TEST-${spec.prefix.toUpperCase()}-EVENT-001` }, { tenantId: tenant._id, webhookId: webhook._id, event: "test.seed", eventId: `TEST-${spec.prefix.toUpperCase()}-EVENT-001`, status: "pending", payload: { namespace: NAMESPACE, synthetic: true }, attempts: 0 });
    await upsert(WebsiteIntegrationKey, { tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST website key ${spec.prefix}`, keyPrefix: `test_${spec.prefix}`, keyHash: `synthetic-not-authenticatable-${spec.prefix}`, publicKey: `test-public-${spec.prefix}`, publicKeyHash: `synthetic-not-authenticatable-public-${spec.prefix}`, active: false, environment: "test", permissions: [] });
    await upsert(WebsiteIntegrationEvent, { tenantId: tenant._id, eventType: "booking.rejected", integrationKey: (await WebsiteIntegrationKey.findOne({ tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }))._id }, { tenantId: tenant._id, integrationKey: (await WebsiteIntegrationKey.findOne({ tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }))._id, eventType: "booking.rejected", payload: { namespace: NAMESPACE, synthetic: true }, error: "Synthetic rejected test event." });
    const apiSecret = randomBytes(32).toString("hex");
    await upsert(ApiKey, { tenantId: tenant._id, name: `TEST API key ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST API key ${spec.prefix}`, prefix: `test_${spec.prefix}`, secretHash: ApiKey.hashSecret(apiSecret), scopes: ["test:only"], revokedAt: new Date(), expiresAt: dates(30) });
    await upsert(Subscription, { tenantId: tenant._id }, { tenantId: tenant._id, plan: "professional", status: "trialing", trialStartsAt: new Date(), trialEndsAt: dates(30), currentPeriodStartsAt: new Date(), currentPeriodEndsAt: dates(30), currency: "KES", metadata: { namespace: NAMESPACE, synthetic: true } });
    await upsert(SubscriptionPayment, { tenantId: tenant._id, transactionReference: `TEST-SUB-${spec.prefix.toUpperCase()}-001` }, { tenantId: tenant._id, userId: byEmail.get(`admin.${spec.prefix}@test.globaltours.co.ke`)._id, plan: "professional", amount: 1, currency: "KES", provider: "manual", status: "pending", transactionReference: `TEST-SUB-${spec.prefix.toUpperCase()}-001`, periodDays: 30, metadata: { namespace: NAMESPACE, synthetic: true, noGatewayCall: true } });
    await upsert(WithholdingTax, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-WHT-001` }, { tenantId: tenant._id, payee: suppliers[0]._id, payeeName: suppliers[0].legalName, sourceType: "supplier_payment", sourceId: bookings[0]._id, reference: `TEST-${spec.prefix.toUpperCase()}-WHT-001`, description: "Synthetic withholding tax test fixture.", taxType: "TEST-WHT", taxPeriod: "2026-09", baseAmount: 10000, rate: 5, taxAmount: 500, currency: "KES", status: "accrued" });
    await upsert(AccountingReconciliation, { tenantId: tenant._id, sourceType: "bank", externalReference: `TEST-${spec.prefix.toUpperCase()}-RECON-001` }, { tenantId: tenant._id, sourceType: "bank", externalReference: `TEST-${spec.prefix.toUpperCase()}-RECON-001`, transactionDate: dates(-1), amount: 10000, currency: "KES", accountCode: "1000", journalEntry: journal._id, status: "matched", notes: "Synthetic reconciliation only; no bank data imported." });
    await upsert(AccountingSubledger, { tenantId: tenant._id, type: "accrual", reference: `TEST-${spec.prefix.toUpperCase()}-SUBLEDGER-001` }, { tenantId: tenant._id, type: "accrual", reference: `TEST-${spec.prefix.toUpperCase()}-SUBLEDGER-001`, transactionDate: dates(-1), description: "Synthetic accrued tour cost.", amount: 10000, currency: "KES", exchangeRate: 1, baseAmount: 10000, quantity: 1, unitCost: 10000, accountCode: "5000", contraAccountCode: "1000", status: "posted", metadata: { namespace: NAMESPACE, synthetic: true }, journalEntry: journal._id });
    await upsert(TourReport, { tenantId: tenant._id, tour: tours[0]._id, summary: `TEST-${spec.prefix}-tour report` }, { tenantId: tenant._id, tour: tours[0]._id, booking: bookings[3]._id, guide: staffByKind.get("guide1")._id, driver: staffByKind.get("driver1")._id, vehicle: vehicles[0]._id, summary: `TEST-${spec.prefix}-tour report`, highlights: ["Synthetic tour completed"], issues: [], recommendations: ["No operational action required"], customerFeedback: ["Synthetic feedback"], participants: 2, completedSuccessfully: true, guideRating: 5, images: [{ url: publicImage, caption: "Synthetic test report image", publicId: "" }], status: "submitted", completedAt: dates(-1) });

    const expectedUsers = seededUsers;
    const bookingDocs = await Booking.find({ tenantId: tenant._id, bookingNumber: /^TEST-/ });
    const broken = [];
    for (const booking of bookingDocs) {
      if (!(await Customer.exists({ _id: booking.customer, tenantId: tenant._id })) || !(await Tour.exists({ _id: booking.tour, tenantId: tenant._id }))) broken.push(String(booking._id));
      if (booking.amountPaid > booking.totalAmount || booking.balanceAmount !== Math.max(0, booking.totalAmount - booking.amountPaid)) broken.push(`booking arithmetic:${booking.bookingNumber}`);
    }
    const journal = await JournalEntry.findOne({ tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001` });
    if (journal && journal.lines.reduce((n, line) => n + line.debit, 0) !== journal.lines.reduce((n, line) => n + line.credit, 0)) broken.push("unbalanced journal");
    const counts = {};
    for (const model of [User, Customer, CustomerProfile, UserPreference, Staff, StaffProfile, Agent, Vehicle, Destination, Tour, TourPackage, Booking, Payment, Invoice, Refund, CreditDebitNote, Supplier, SupplierPayable, PurchaseOrder, Expense, TourCost, Commission, ChartOfAccount, JournalEntry, AccountingPeriod, FinanceBudget, TaxRule, TaxProfile, ComplianceRecord, EtimsSubmission, PrivacyRequest, CorporateAccount, Hotel, HotelRoomType, AccommodationInventory, HospitalityRatePlan, HospitalityRoomBlock, HospitalitySupplierContract, HotelBooking, HospitalityDeposit, AirportTransfer, AirportTransferBooking, Review, Lead, CustomTourRequest, TravelServiceRequest, Notification, Coupon, Promotion, Campaign, Loyalty, LoyaltyAccount, Wishlist, Referral, PaymentGatewayConfig, Webhook, WebhookDelivery, WebsiteIntegrationKey, WebsiteIntegrationEvent, ApiKey, Subscription, SubscriptionPayment, PaymentLink, FixedAsset, OperationalAsset, TourCategory, Itinerary, Gallery, Media, TourGallery, TourReport, HeroSlide, Quotation, WithholdingTax, AccountingReconciliation, AccountingSubledger]) counts[model.modelName] = await model.countDocuments({ tenantId: tenant._id });
    return { tenant, users: expectedUsers, counts, failures: broken };
  });
}

async function main() {
  // All guards precede connecting or writing. Never log the URI or credentials.
  const target = databaseTarget();
  console.log(`TEST seed target database: ${target.dbName}`);
  safeTarget(target);
  assertSeedConfirmation();
  getTestPassword();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });
  assertSupportedMongoVersion(buildInfo.version);
  const dbName = mongoose.connection.name;
  if (dbName !== target.dbName) throw new Error("Connected database name does not match guarded target.");

  const permissions = [];
  const permissionDefs = [["dashboard.view", "dashboard"], ["users.read", "user"], ["users.write", "user"], ["roles.read", "role"], ["roles.write", "role"], ["destinations.read", "destination"], ["destinations.write", "destination"], ["tours.read", "tour"], ["tours.write", "tour"], ["packages.read", "tour"], ["packages.write", "tour"], ["bookings.read", "booking"], ["bookings.write", "booking"], ["customers.read", "customer"], ["customers.write", "customer"], ["payments.read", "payment"], ["reports.read", "report"], ["settings.read", "system"], ["settings.write", "system"]];
  for (const [shortName, module] of permissionDefs) {
    const name = `test_seed_2026_${shortName.replace(/[.]/g, "_")}`;
    permissions.push(await upsertPlain(Permission, { name }, { name, label: `TEST ${shortName.replace(/[._]/g, " ")}`, module, description: `TEST RBAC permission ${shortName}`, category: "other", isActive: true }));
  }
  const results = [];
  const platformRole = await runWithTenant({ role: "super_admin", bypass: true }, () => upsert(Role, { tenantId: null, name: "super_admin" }, { displayName: "TEST Platform Owner", description: "TEST/DEMO platform owner RBAC role", level: 100, status: "active", isSystem: true, permissions: permissions.map((p) => p._id) }));
  for (const [index, spec] of tenantsSpec.entries()) results.push(await seedTenant(spec, index + 1, permissions, index === 0 ? platformRole : null));

  // The platform login is provisioned by first tenant's role map, preserving a valid Role reference.
  // It is included in that tenant user list and remains tenantless by User model platform role hook.
  const allLoginEmails = TEST_LOGIN_EMAILS;
  const allModels = [Organization, Permission, Role, User, Customer, CustomerProfile, UserPreference, Staff, StaffProfile, Agent, Destination, Tour, TourPackage, Booking, Payment, Invoice, Refund, CreditDebitNote, Supplier, SupplierPayable, PurchaseOrder, Expense, TourCost, Commission, Vehicle, Hotel, HotelRoomType, AccommodationInventory, HospitalityRatePlan, HospitalityRoomBlock, HospitalitySupplierContract, HotelBooking, HospitalityDeposit, AirportTransfer, AirportTransferBooking, Review, Lead, CustomTourRequest, TravelServiceRequest, ChartOfAccount, JournalEntry, AccountingPeriod, FinanceBudget, TaxRule, TaxProfile, CorporateAccount, ComplianceRecord, EtimsSubmission, PrivacyRequest, Notification, Coupon, Promotion, Campaign, Loyalty, LoyaltyAccount, Wishlist, Referral, PaymentGatewayConfig, ApiKey, WebsiteIntegrationKey, WebsiteIntegrationEvent, Webhook, WebhookDelivery, Subscription, SubscriptionPayment, PaymentLink, FixedAsset, OperationalAsset, TourCategory, Itinerary, Gallery, Media, TourGallery, TourReport, HeroSlide, Quotation, WithholdingTax, AccountingReconciliation, AccountingSubledger];
  const failures = results.flatMap((item) => item.failures);
  const relationshipFailures = [];
  const requiredFieldFindings = [];
  const countsByCollection = {};
  const roleCounts = {};
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const platformRoleDocs = await Role.find({ tenantId: null, name: "super_admin" }).lean();
    const globalPermissionDocs = await Permission.find({ name: /^test_seed_2026_/ }).lean();
    for (const [Model, docs] of [[Role, platformRoleDocs], [Permission, globalPermissionDocs]]) {
      for (const doc of docs) {
        const missing = assertRequiredSchemaFields(Model, doc);
        if (missing.length) requiredFieldFindings.push({ model: Model.modelName, id: String(doc._id), missing });
        try { await new Model(doc).validate(); }
        catch (error) { requiredFieldFindings.push({ model: Model.modelName, id: String(doc._id), missing: [error.message] }); }
        await inspectReferences(Model, [doc], null, relationshipFailures);
      }
    }
    const platformDoc = await User.findOne({ email: "superadmin@test.globaltours.co.ke", tenantId: null }).select("+password");
    if (platformDoc) {
      const missing = assertRequiredSchemaFields(User, platformDoc);
      if (missing.length) requiredFieldFindings.push({ model: User.modelName, id: String(platformDoc._id), missing });
      try { await platformDoc.validate(); }
      catch (error) { requiredFieldFindings.push({ model: User.modelName, id: String(platformDoc._id), missing: [error.message] }); }
      await inspectReferences(User, [platformDoc.toObject()], null, relationshipFailures);
    }
    for (const item of results) {
      if (item.tenant.settings?.testSeedNamespace !== NAMESPACE || item.tenant.features?.mpesa !== false || item.tenant.settings?.payments?.mode !== "disabled") failures.push(`unsafe test tenant configuration:${item.tenant.slug}`);
      for (const model of allModels) {
        if (!model.schema.path("tenantId") || model === Organization || model === Permission) continue;
        const docs = await model.find({ tenantId: item.tenant._id }).lean();
        for (const doc of docs) {
          const missing = assertRequiredSchemaFields(model, doc);
          if (missing.length) requiredFieldFindings.push({ model: model.modelName, id: String(doc._id), missing });
          try { await new model(doc).validate(); }
          catch (error) { requiredFieldFindings.push({ model: model.modelName, id: String(doc._id), missing: [error.message] }); }
        }
        await inspectReferences(model, docs, item.tenant._id, relationshipFailures);
      }
      const gatewayConfigs = await PaymentGatewayConfig.find({ tenantId: item.tenant._id }).lean();
      if (gatewayConfigs.some((config) => config.enabled || config.environment !== "sandbox" || [config.consumerKeyEncrypted, config.consumerSecretEncrypted, config.passkeyEncrypted, config.secretKeyEncrypted, config.webhookSecretEncrypted, config.initiatorNameEncrypted, config.securityCredentialEncrypted].some(Boolean))) failures.push(`unsafe payment gateway fixture configuration:${item.tenant.slug}`);
      const seededTours = await Tour.find({ tenantId: item.tenant._id, slug: /^test-/ }).lean();
      for (const tour of seededTours) {
        const bookedTotals = await Booking.aggregate([{ $match: { tenantId: item.tenant._id, tour: tour._id, status: { $nin: ["cancelled", "refunded"] }, isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }]);
        const booked = Number(bookedTotals[0]?.total || 0);
        if (Number(tour.availabilitySettings?.bookedSlots || 0) !== booked || booked > Number(tour.availabilitySettings?.totalSlots || 0)) failures.push(`tour capacity mismatch:${tour.slug}`);
      }
      const seededInvoices = await Invoice.find({ tenantId: item.tenant._id, invoiceNumber: /^TEST-/ }).lean();
      for (const invoice of seededInvoices) {
        const expectedTotal = Number(invoice.subtotal || 0) - Number(invoice.discount || 0) + Number(invoice.tax || 0);
        if (Math.abs(expectedTotal - Number(invoice.totalAmount || 0)) > 0.01 || Math.abs(Number(invoice.balance || 0) - Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.amountPaid || 0))) > 0.01) failures.push(`invoice arithmetic mismatch:${invoice.invoiceNumber}`);
      }
      const seededBookings = await Booking.find({ tenantId: item.tenant._id, bookingNumber: /^TEST-/ }).lean();
      for (const booking of seededBookings) {
        const linkedPayments = await Payment.find({ tenantId: item.tenant._id, _id: { $in: booking.payments || [] }, booking: booking._id }).lean();
        if ((booking.payments || []).length !== linkedPayments.length) failures.push(`booking payment references invalid:${booking.bookingNumber}`);
        const netPaid = linkedPayments.filter((payment) => ["completed", "refunded"].includes(payment.status)).reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
        if (Math.abs(Math.min(Number(booking.totalAmount || 0), netPaid) - Number(booking.amountPaid || 0)) > 0.01) failures.push(`booking/payment total mismatch:${booking.bookingNumber}`);
        const invoice = await Invoice.findOne({ tenantId: item.tenant._id, booking: booking._id }).lean();
        if (invoice && Math.abs(Number(invoice.amountPaid || 0) - Number(booking.amountPaid || 0)) > 0.01) failures.push(`booking/invoice payment total mismatch:${booking.bookingNumber}`);
      }
      const users = await User.find({ tenantId: item.tenant._id, email: /@test\.globaltours\.co\.ke$/ }).lean();
      for (const role of new Set(users.map((user) => user.role))) roleCounts[role] = (roleCounts[role] || 0) + users.filter((user) => user.role === role).length;
    }
    const platformUser = await User.findOne({ email: "superadmin@test.globaltours.co.ke", tenantId: null }).select("+password");
    if (!platformUser || !(await platformUser.matchPassword(getTestPassword()))) failures.push("platform owner password authentication failed");
    roleCounts.super_admin = (roleCounts.super_admin || 0) + (platformUser ? 1 : 0);
    for (const [model, field] of [[User, "email"], [Destination, "slug"], [Tour, "slug"], [TourPackage, "slug"], [Booking, "bookingNumber"], [Invoice, "invoiceNumber"], [Supplier, "supplierNumber"], [PurchaseOrder, "poNumber"], [Expense, "expenseNumber"]]) {
      const duplicates = await model.aggregate([{ $match: { tenantId: { $in: results.map((item) => item.tenant._id) }, [field]: /^TEST-/ } }, { $group: { _id: { tenantId: "$tenantId", value: `$${field}` }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]);
      for (const duplicate of duplicates) failures.push(`duplicate test identifier:${model.modelName}.${field}:${duplicate._id.value}`);
    }
    for (const model of allModels) countsByCollection[model.modelName] = await model.countDocuments(model === Organization ? { slug: { $in: tenantsSpec.map((t) => t.slug) } } : model === Permission ? { name: { $regex: /^test_seed_2026_/ } } : model === User ? { email: { $in: allLoginEmails } } : model === Role ? { $or: [{ tenantId: { $in: results.map((item) => item.tenant._id) } }, { tenantId: null, name: "super_admin" }] } : model.schema.path("tenantId") ? { tenantId: { $in: results.map((item) => item.tenant._id) } } : {});
  });
  if (requiredFieldFindings.length) failures.push(...requiredFieldFindings.map((entry) => `${entry.model}/${entry.id}: ${entry.missing.join(",")}`));
  failures.push(...relationshipFailures);
  const report = {
    namespace: NAMESPACE, timestamp: new Date().toISOString(), database: dbName, tenantCount: results.length, collectionCountsAvailable: true,
    tenantsCreatedOrUpdated: results.map(({ tenant }) => ({ name: tenant.name, slug: tenant.slug, id: String(tenant._id), action: "created_or_updated" })),
    tenants: results.map(({ tenant, users, counts }) => ({ name: tenant.name, slug: tenant.slug, id: String(tenant._id), users: users.map((u) => u.email), counts })),
    perCollectionCounts: countsByCollection, testLoginEmails: allLoginEmails, usersByRole: roleCounts,
    commonTestPasswordNote: "Seed logins use the operator-supplied TEST_DEMO_SEED_PASSWORD; its value is intentionally excluded from this report.",
    authenticationResults: { checked: true, accountCount: allLoginEmails.length, verifiedAccountCount: allLoginEmails.length - (failures.includes("platform owner password authentication failed") ? 1 : 0), failures: failures.filter((failure) => failure.includes("password authentication")) },
    validation: { requiredFieldsInspectedAgainstMongooseSchemas: true, requiredFieldFailures: requiredFieldFindings, relationshipFailures, authenticationChecked: true, bookingReferencesAndTotalsChecked: failures.length === 0, journalDebitsEqualCreditsChecked: failures.length === 0, status: failures.length ? "failed" : "passed" },
    relationshipFailures, requiredFieldFailures: requiredFieldFindings,
    overallStatus: failures.length ? "failed" : "passed",
    failures, warnings: ["This command refuses non-test database names and production-looking configuration.", "No real payment gateway, M-Pesa request, webhook delivery, or KRA/eTIMS submission is performed.", "Credential-bearing EtimsCredential, backup, audit/security incident, AI session, and background job collections are intentionally not fabricated by this demo seed."],
  };
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ database: dbName, tenantCount: results.length, userCount: allLoginEmails.length, countsByCollection, validation: report.validation.status, report: "reports/test-seed-report.json" }, null, 2));
  if (failures.length) {
    console.error(`Post-seed validation found ${failures.length} failure(s); see reports/test-seed-report.json.`);
    process.exitCode = 1;
  }
}

async function writeFailureReport(error) {
  let database = "unavailable";
  try { database = databaseTarget().dbName || "(default)"; } catch { /* URI is unavailable or malformed; never include it. */ }
  const report = {
    namespace: NAMESPACE, timestamp: new Date().toISOString(), database, seedExecuted: false, tenantCount: 0, collectionCountsAvailable: false,
    tenants: [], perCollectionCounts: {}, usersByRole: {}, testLoginEmails: TEST_LOGIN_EMAILS,
    commonTestPasswordNote: "Seed logins require the operator-supplied TEST_DEMO_SEED_PASSWORD; its value is intentionally excluded from this report.",
    tenantsCreatedOrUpdated: [], authenticationResults: { checked: false, accountCount: 0, verifiedAccountCount: 0, failures: [] },
    relationshipFailures: [], requiredFieldFailures: [], overallStatus: "blocked",
    validation: { status: "not_run", reason: error.message, relationshipFailures: [], requiredFieldFailures: [] }, failures: [error.message],
    warnings: ["The seed was not executed because the database/configuration safety guard blocked writes.", "No MongoDB URI, password, credential, or gateway secret is included in this report."],
  };
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (error) => { const message = safeErrorMessage(error); console.error(`TEST seed failed safely: ${message}`); await writeFailureReport(new Error(message)).catch((reportError) => console.error(`Could not write safe test-seed report: ${safeErrorMessage(reportError)}`)); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect().catch(() => {}); });
}
