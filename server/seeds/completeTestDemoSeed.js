/**
 * Purpose: complete Test Demo Seed database seed module. Main declarations: getTestPassword, imageUrl, destinationImage, tourImage, loginEmail.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load node:crypto so this module can use its exported dependencies.
import { randomBytes } from "node:crypto";
// Load node:fs/promises so this module can use its exported dependencies.
import fs from "node:fs/promises";
// Load node:path so this module can use its exported dependencies.
import path from "node:path";
// Load node:url so this module can use its exported dependencies.
import { fileURLToPath } from "node:url";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Staff.js so this module can use its exported dependencies.
import Staff from "../models/Staff.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";
// Load ../models/Destination.js so this module can use its exported dependencies.
import Destination from "../models/Destination.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";
// Load ../models/TourPackage.js so this module can use its exported dependencies.
import TourPackage from "../models/TourPackage.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/PurchaseOrder.js so this module can use its exported dependencies.
import PurchaseOrder from "../models/PurchaseOrder.js";
// Load ../models/Expense.js so this module can use its exported dependencies.
import Expense from "../models/Expense.js";
// Load ../models/TourCost.js so this module can use its exported dependencies.
import TourCost from "../models/TourCost.js";
// Load ../models/Commission.js so this module can use its exported dependencies.
import Commission from "../models/Commission.js";
// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";
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
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";
// Load ../models/Lead.js so this module can use its exported dependencies.
import Lead from "../models/Lead.js";
// Load ../models/CustomTourRequest.js so this module can use its exported dependencies.
import CustomTourRequest from "../models/CustomTourRequest.js";
// Load ../models/TravelServiceRequest.js so this module can use its exported dependencies.
import TravelServiceRequest from "../models/TravelServiceRequest.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/JournalEntry.js so this module can use its exported dependencies.
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/AccountingPeriod.js so this module can use its exported dependencies.
import AccountingPeriod from "../models/AccountingPeriod.js";
// Load ../models/FinanceBudget.js so this module can use its exported dependencies.
import FinanceBudget from "../models/FinanceBudget.js";
// Load ../models/TaxRule.js so this module can use its exported dependencies.
import TaxRule from "../models/TaxRule.js";
// Load ../models/TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "../models/TaxProfile.js";
// Load ../models/CorporateAccount.js so this module can use its exported dependencies.
import CorporateAccount from "../models/CorporateAccount.js";
// Load ../models/ComplianceRecord.js so this module can use its exported dependencies.
import ComplianceRecord from "../models/ComplianceRecord.js";
// Load ../models/PrivacyRequest.js so this module can use its exported dependencies.
import PrivacyRequest from "../models/PrivacyRequest.js";
// Load ../models/Notification.js so this module can use its exported dependencies.
import Notification from "../models/Notification.js";
// Load ../models/CustomerProfile.js so this module can use its exported dependencies.
import CustomerProfile from "../models/CustomerProfile.js";
// Load ../models/StaffProfile.js so this module can use its exported dependencies.
import StaffProfile from "../models/StaffProfile.js";
// Load ../models/UserPreference.js so this module can use its exported dependencies.
import UserPreference from "../models/UserPreference.js";
// Load ../models/Coupon.js so this module can use its exported dependencies.
import Coupon from "../models/Coupon.js";
// Load ../models/Promotion.js so this module can use its exported dependencies.
import Promotion from "../models/Promotion.js";
// Load ../models/Campaign.js so this module can use its exported dependencies.
import Campaign from "../models/Campaign.js";
// Load ../models/Loyalty.js so this module can use its exported dependencies.
import Loyalty from "../models/Loyalty.js";
// Load ../models/LoyaltyAccount.js so this module can use its exported dependencies.
import LoyaltyAccount from "../models/LoyaltyAccount.js";
// Load ../models/Wishlist.js so this module can use its exported dependencies.
import Wishlist from "../models/Wishlist.js";
// Load ../models/Referral.js so this module can use its exported dependencies.
import Referral from "../models/Referral.js";
// Load ../models/Refund.js so this module can use its exported dependencies.
import Refund from "../models/Refund.js";
// Load ../models/CreditDebitNote.js so this module can use its exported dependencies.
import CreditDebitNote from "../models/CreditDebitNote.js";
// Load ../models/SupplierPayable.js so this module can use its exported dependencies.
import SupplierPayable from "../models/SupplierPayable.js";
// Load ../models/FixedAsset.js so this module can use its exported dependencies.
import FixedAsset from "../models/FixedAsset.js";
// Load ../models/OperationalAsset.js so this module can use its exported dependencies.
import OperationalAsset from "../models/OperationalAsset.js";
// Load ../models/AccommodationInventory.js so this module can use its exported dependencies.
import AccommodationInventory from "../models/AccommodationInventory.js";
// Load ../models/HospitalityRoomBlock.js so this module can use its exported dependencies.
import HospitalityRoomBlock from "../models/HospitalityRoomBlock.js";
// Load ../models/HospitalityDeposit.js so this module can use its exported dependencies.
import HospitalityDeposit from "../models/HospitalityDeposit.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
// Load ../models/EtimsSubmission.js so this module can use its exported dependencies.
import EtimsSubmission from "../models/EtimsSubmission.js";
// Load ../models/ApiKey.js so this module can use its exported dependencies.
import ApiKey from "../models/ApiKey.js";
// Load ../models/WebsiteIntegrationKey.js so this module can use its exported dependencies.
import WebsiteIntegrationKey from "../models/WebsiteIntegrationKey.js";
// Load ../models/WebsiteIntegrationEvent.js so this module can use its exported dependencies.
import WebsiteIntegrationEvent from "../models/WebsiteIntegrationEvent.js";
// Load ../models/Webhook.js so this module can use its exported dependencies.
import Webhook from "../models/Webhook.js";
// Load ../models/WebhookDelivery.js so this module can use its exported dependencies.
import WebhookDelivery from "../models/WebhookDelivery.js";
// Load ../models/Subscription.js so this module can use its exported dependencies.
import Subscription from "../models/Subscription.js";
// Load ../models/TourCategory.js so this module can use its exported dependencies.
import TourCategory from "../models/TourCategory.js";
// Load ../models/Itinerary.js so this module can use its exported dependencies.
import Itinerary from "../models/Itinerary.js";
// Load ../models/Gallery.js so this module can use its exported dependencies.
import Gallery from "../models/Gallery.js";
// Load ../models/Media.js so this module can use its exported dependencies.
import Media from "../models/Media.js";
// Load ../models/HospitalitySupplierContract.js so this module can use its exported dependencies.
import HospitalitySupplierContract from "../models/HospitalitySupplierContract.js";
// Load ../models/TourGallery.js so this module can use its exported dependencies.
import TourGallery from "../models/TourGallery.js";
// Load ../models/TourReport.js so this module can use its exported dependencies.
import TourReport from "../models/TourReport.js";
// Load ../models/HeroSlide.js so this module can use its exported dependencies.
import HeroSlide from "../models/HeroSlide.js";
// Load ../models/Quotation.js so this module can use its exported dependencies.
import Quotation from "../models/Quotation.js";
// Load ../models/PaymentLink.js so this module can use its exported dependencies.
import PaymentLink from "../models/PaymentLink.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../models/WithholdingTax.js so this module can use its exported dependencies.
import WithholdingTax from "../models/WithholdingTax.js";
// Load ../models/AccountingReconciliation.js so this module can use its exported dependencies.
import AccountingReconciliation from "../models/AccountingReconciliation.js";
// Load ../models/AccountingSubledger.js so this module can use its exported dependencies.
import AccountingSubledger from "../models/AccountingSubledger.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../utils/mongodbVersion.js so this module can use its exported dependencies.
import { assertSupportedMongoVersion } from "../utils/mongodbVersion.js";

// Declare NAMESPACE for use by the surrounding module or function.
export const NAMESPACE = "TEST-SEED-GLOBAL-TOURS-2026";
// Declare TEST_PASSWORD_ENV for use by the surrounding module or function.
export const TEST_PASSWORD_ENV = "SEED_DEMO_PASSWORD";
// Define getTestPassword; its parameters and body implement this operation.
export function getTestPassword() {
  // Declare password for use by the surrounding module or function.
  const password = String(process.env[TEST_PASSWORD_ENV] || process.env.TEST_DEMO_SEED_PASSWORD || "");
  // Check the condition (!password) and run the matching branch.
  if (!password) throw new Error(`${TEST_PASSWORD_ENV} is required for demo seed accounts.`);
  // Check the condition (password.length < 12) and run the matching branch.
  if (password.length < 12) throw new Error(`${TEST_PASSWORD_ENV} must contain at least 12 characters for disposable test accounts.`);
  // Return the value of password to the caller.
  return password;
}
// Declare __dirname for use by the surrounding module or function.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Declare reportFile for use by the surrounding module or function.
const reportFile = path.resolve(__dirname, "../reports/test-seed-report.json");
// Declare existingCollections for use by the surrounding module or function.
let existingCollections = null;
// Declare seedStage for use by the surrounding module or function.
let seedStage = "preflight";
// Declare unavailableSeedCollections for use by the surrounding module or function.
const unavailableSeedCollections = new Set();
// Declare referenceCache for use by the surrounding module or function.
const referenceCache = new Map();
// Declare allModels for use by the surrounding module or function.
const allModels = [Organization, Permission, Role, User, Customer, CustomerProfile, UserPreference, Staff, StaffProfile, Agent, Destination, Tour, TourPackage, Booking, Payment, Invoice, Refund, CreditDebitNote, Supplier, SupplierPayable, PurchaseOrder, Expense, TourCost, Commission, Vehicle, Hotel, HotelRoomType, AccommodationInventory, HospitalityRatePlan, HospitalityRoomBlock, HospitalitySupplierContract, HotelBooking, HospitalityDeposit, AirportTransfer, AirportTransferBooking, Review, Lead, CustomTourRequest, TravelServiceRequest, ChartOfAccount, JournalEntry, AccountingPeriod, FinanceBudget, TaxRule, TaxProfile, CorporateAccount, ComplianceRecord, EtimsSubmission, PrivacyRequest, Notification, Coupon, Promotion, Campaign, Loyalty, LoyaltyAccount, Wishlist, Referral, PaymentGatewayConfig, ApiKey, WebsiteIntegrationKey, WebsiteIntegrationEvent, Webhook, WebhookDelivery, Subscription, SubscriptionPayment, PaymentLink, FixedAsset, OperationalAsset, TourCategory, Itinerary, Gallery, Media, TourGallery, TourReport, HeroSlide, Quotation, WithholdingTax, AccountingReconciliation, AccountingSubledger];
// Declare SEEDED_MODELS for use by the surrounding module or function.
export const SEEDED_MODELS = allModels;
// Declare tenantsSpec for use by the surrounding module or function.
const tenantsSpec = [
  { key: "hussein", slug: "hussein-mboya", name: "Hussein Mboya Tours", legalName: "Hussein Mboya Tours Limited", county: "Nairobi", email: "admin1@husseinmboya.com", prefix: "hussein" },
  { key: "amani", slug: "amani-trails", name: "Amani Trails Safaris", legalName: "Amani Trails Safaris Limited", county: "Narok", email: "admin1@amanitrails.com", prefix: "amani" },
  { key: "demo", slug: "demo-safari", name: "Demo Safari Adventures", legalName: "Demo Safari Adventures Limited", county: "Mombasa", email: "admin1@demosafari.com", prefix: "demo" },
];
// Declare unsplashAssetIds for use by the surrounding module or function.
const unsplashAssetIds = [
  "photo-1516426122078-c23e76319801", "photo-1547471080-7cc2caa01a7e", "photo-1534177616072-ef7dc120449d", "photo-1516026672322-bc52d61a55d5", "photo-1547036967-23d11aacaee0", "photo-1500530855697-b586d89ba3ee", "photo-1501785888041-af3ef285b470", "photo-1469474968028-56623f02e42e", "photo-1441974231531-c6227db76b6e", "photo-1472396961693-142e6e269027", "photo-1497250681960-ef046c08a56e", "photo-1501854140801-50d01698950b", "photo-1513836279014-a89f7a76ae86", "photo-1526778548025-fa2f459cd5c1", "photo-1531058020387-3be344556be6", "photo-1519904981063-b0cf448d479e", "photo-1482192596544-9eb780fc7f66", "photo-1526392060635-9d6019884377", "photo-1500534623283-312aade485b7", "photo-1489392191049-fc10c97e64b6", "photo-1507525428034-b723cf961d3e", "photo-1510414842594-a61c69b5ae57", "photo-1542314831-068cd1dbfeeb", "photo-1547970810-dc1eac37d174", "photo-1549366021-9f761d450615", "photo-1557050543-4d5f4e07ef46", "photo-1564501049412-61c2a3083791", "photo-1582719478250-c89cae4dc85b", "photo-1601918774946-25832a4be0d6",
];
// Declare imageUrl for use by the surrounding module or function.
const imageUrl = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
// Declare localDestinationImages for use by the surrounding module or function.
const localDestinationImages = ["/destinations/maasai-mara.jpg", "/destinations/amboseli.jpg", "/destinations/diani.jpg", "/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/diani.jpg", "/gallery/beach.jpg", "/gallery/culture.jpg", "/gallery/safari.jpg", "/hero1.jpeg", "/hero2.jpeg", "/hero4.jpeg"];
// Declare generatedDestinationImages for use by the surrounding module or function.
const generatedDestinationImages = Array.from({ length: 18 }, (_, index) => `/demo-destinations/kenya-landscape-${String(index + 1).padStart(2, "0")}.svg`);
// Declare generatedSafariTourImage for use by the surrounding module or function.
const generatedSafariTourImage = "/demo-tours/kenya-tour-08.svg";
// Declare destinationImage for use by the surrounding module or function.
const destinationImage = (index) => {
  // Check the condition (index < localDestinationImages.length) and run the matching branch.
  if (index < localDestinationImages.length) return localDestinationImages[index];
  // Check the condition (index < localDestinationImages.length + 6) and run the matching branch.
  if (index < localDestinationImages.length + 6) return imageUrl(unsplashAssetIds[23 + index - localDestinationImages.length]);
  // Return the expression shown below to the caller.
  return generatedDestinationImages[index - localDestinationImages.length - 6];
};
// Declare tourImage for use by the surrounding module or function.
const tourImage = (index) => index === 7 ? generatedSafariTourImage : imageUrl(unsplashAssetIds[index < 7 ? index : index - 1]);
// Declare sharedDemoImage for use by the surrounding module or function.
const sharedDemoImage = imageUrl(unsplashAssetIds[29]);
// Declare tenantDomain for use by the surrounding module or function.
const tenantDomain = { hussein: "husseinmboya.com", amani: "amanitrails.com", demo: "demosafari.com" };
// Define loginEmail; its parameters and body implement this operation.
function loginEmail(local, prefix) {
  // Check the condition (local === "superadmin") and run the matching branch.
  if (local === "superadmin") return "superadmin1@husseinmboya.com";
  // Declare roleAccount for use by the surrounding module or function.
  const roleAccount = { admin: "admin1", manager: "tourmanager1" }[local] || local;
  // Return the expression shown below to the caller.
  return `${roleAccount}@${tenantDomain[prefix]}`;
}
// Declare TEST_LOGIN_EMAILS for use by the surrounding module or function.
export const TEST_LOGIN_EMAILS = ["superadmin1@husseinmboya.com", ...tenantsSpec.flatMap(({ prefix }) => ["admin", "manager", "agent1", "agent2", "guide1", "guide2", "driver1", "driver2", "customer1", "customer2", "customer3", "customer4"].map((name) => loginEmail(name, prefix)))];
// Declare roleForLoginEmail for use by the surrounding module or function.
const roleForLoginEmail = (email) => {
  // Check the condition (email === TEST_LOGIN_EMAILS[0]) and run the matching branch.
  if (email === TEST_LOGIN_EMAILS[0]) return "super_admin";
  // Declare local for use by the surrounding module or function.
  const local = String(email).split("@")[0];
  // Check the condition (local === "admin1") and run the matching branch.
  if (local === "admin1") return "admin";
  // Check the condition (local === "tourmanager1") and run the matching branch.
  if (local === "tourmanager1") return "tour_manager";
  // Check the condition (local.startsWith("agent")) and run the matching branch.
  if (local.startsWith("agent")) return "agent";
  // Check the condition (local.startsWith("guide")) and run the matching branch.
  if (local.startsWith("guide")) return "tour_guide";
  // Check the condition (local.startsWith("driver")) and run the matching branch.
  if (local.startsWith("driver")) return "driver";
  // Check the condition (local.startsWith("customer")) and run the matching branch.
  if (local.startsWith("customer")) return "customer";
  // Return the expression shown below to the caller.
  return null;
};
// Declare dates for use by the surrounding module or function.
const dates = (days = 30) => new Date(Date.now() + days * 86400000);
// Declare stablePhone for use by the surrounding module or function.
const stablePhone = (tenantIndex, accountIndex) => String(7100000000 + tenantIndex * 1000 + accountIndex).slice(0, 10);

// Define databaseTarget; its parameters and body implement this operation.
function databaseTarget() {
  // Declare raw for use by the surrounding module or function.
  const raw = String(process.env.MONGODB_URI || "");
  // Check the condition (!raw) and run the matching branch.
  if (!raw) throw new Error("MONGODB_URI is missing.");
  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try { parsed = new URL(raw); } catch { throw new Error("MONGODB_URI is not a valid MongoDB URL."); }
  // Return the object assembled below to the caller.
  return { dbName: decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] || ""), host: parsed.hostname.toLowerCase() };
}

// Define isExplicitProductionTestSeed; its parameters and body implement this operation.
export function isExplicitProductionTestSeed(target = databaseTarget()) {
  // Return the expression shown below to the caller.
  return process.env.ALLOW_PRODUCTION_TEST_SEED === "YES"
    && process.env.CONFIRM_PRODUCTION_TEST_SEED === "YES_SEED_HUSSEINDB_DISPOSABLE_DATA"
    && String(target.dbName || "").toLowerCase() === "husseindb"
    && String(target.host || "").toLowerCase() === "cluster0.cdtxzts.mongodb.net";
}

// Define safeTarget; its parameters and body implement this operation.
export function safeTarget(target = databaseTarget()) {
  // Check the condition (String(process.env.NODE_ENV || "").toLowerCase() === "production") and run the matching branch.
  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") throw new Error("Refusing test seed because NODE_ENV=production.");
  // Declare { dbName, host } for use by the surrounding module or function.
  const { dbName, host } = target;
  // Declare normalizedHost for use by the surrounding module or function.
  const normalizedHost = String(host || "").toLowerCase();
  // Declare explicitProductionTestSeed for use by the surrounding module or function.
  const explicitProductionTestSeed = isExplicitProductionTestSeed(target);
  // Declare explicitAtlasStagingSeed for use by the surrounding module or function.
  const explicitAtlasStagingSeed = process.env.ALLOW_ATLAS_DEMO_SEED === "YES"
    && normalizedHost === "cluster0.cdtxzts.mongodb.net"
    && dbName === "global_tours_test";
  // Check the condition (String(dbName || "").toLowerCase() === "husseindb" && !explicitProduct) and run the matching branch.
  if (String(dbName || "").toLowerCase() === "husseindb" && !explicitProductionTestSeed) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing comprehensive test seed against the application database husseindb without the exact production-test authorization.");
  }
  // Check the condition (!new Set(["127.0.0.1", "localhost", "[::1]", "::1"]).has(normalizedHos) and run the matching branch.
  if (!new Set(["127.0.0.1", "localhost", "[::1]", "::1"]).has(normalizedHost) && !explicitAtlasStagingSeed && !explicitProductionTestSeed) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing test seed: MongoDB host must be loopback unless an exact Atlas staging or production-test opt-in is supplied.");
  }
  // Declare configText for use by the surrounding module or function.
  const configText = [process.env.NODE_ENV, process.env.PLATFORM_HOST, process.env.CLIENT_URL, process.env.CLIENT_ORIGINS, host, dbName].join(" ").toLowerCase();
  // Check the condition (!explicitAtlasStagingSeed && !explicitProductionTestSeed && !/(^|[-_])) and run the matching branch.
  if (!explicitAtlasStagingSeed && !explicitProductionTestSeed && !/(^|[-_])(test|testing|demo|disposable|seed)([-_]|$)/.test(dbName)) throw new Error(`Refusing seed: configured database name "${dbName || "(default)"}" is not explicitly test/demo/disposable. No writes were made.`);
  // Check the condition (/prod|production|render\.com|vercel\.app|mongodb\+srv:.*prod/.test(con) and run the matching branch.
  if (/prod|production|render\.com|vercel\.app|mongodb\+srv:.*prod/.test(configText)) throw new Error("Refusing test seed because production-looking configuration was detected.");
  // Check the condition ([process.env.ALLOW_GLOBAL_MPESA_FALLBACK, process.env.ALLOW_SINGLE_TEN) and run the matching branch.
  if ([process.env.ALLOW_GLOBAL_MPESA_FALLBACK, process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK].some((value) => String(value || "").trim().toLowerCase() === "true")) throw new Error("Refusing test seed while an unsafe M-Pesa fallback is enabled.");
  // Return the object assembled below to the caller.
  return { dbName, host };
}

// Define assertSeedConfirmation; its parameters and body implement this operation.
export function assertSeedConfirmation() {
  // Check the condition (process.env.ALLOW_PRODUCTION_TEST_SEED === "YES") and run the matching branch.
  if (process.env.ALLOW_PRODUCTION_TEST_SEED === "YES") {
    // Check the condition (process.env.CONFIRM_PRODUCTION_TEST_SEED !== "YES_SEED_HUSSEINDB_DISPO) and run the matching branch.
    if (process.env.CONFIRM_PRODUCTION_TEST_SEED !== "YES_SEED_HUSSEINDB_DISPOSABLE_DATA") throw new Error("Production test seed requires CONFIRM_PRODUCTION_TEST_SEED=YES_SEED_HUSSEINDB_DISPOSABLE_DATA.");
    // Return the result to the caller.
    return;
  }
  // Check the condition (process.env.CONFIRM_TEST_SEED !== "YES") and run the matching branch.
  if (process.env.CONFIRM_TEST_SEED !== "YES") throw new Error("Set CONFIRM_TEST_SEED=YES to confirm this disposable TEST seed.");
}

// Define assertRequiredSchemaFields; its parameters and body implement this operation.
function assertRequiredSchemaFields(Model, doc) {
  // Declare errors for use by the surrounding module or function.
  const errors = [];
  // Repeat the enclosed work for each required iteration.
  for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {
    // Check the condition (!schemaPath.isRequired || field === "_id" || field === "__v") and run the matching branch.
    if (!schemaPath.isRequired || field === "_id" || field === "__v") continue;
    // Declare values for use by the surrounding module or function.
    const values = collectPathValues(doc, field.split("."));
    // Check the condition (!values.length || values.some((value) => value === undefined || value ) and run the matching branch.
    if (!values.length || values.some((value) => value === undefined || value === null || (typeof value === "string" && !value.trim()))) errors.push(`${Model.modelName}.${field}`);
  }
  // Return the value of errors to the caller.
  return errors;
}

// Define collectPathValues; its parameters and body implement this operation.
function collectPathValues(value, parts) {
  // Check the condition (value == null) and run the matching branch.
  if (value == null) return [];
  // Check the condition (!parts.length) and run the matching branch.
  if (!parts.length) return Array.isArray(value) ? value.flatMap((item) => collectPathValues(item, [])) : [value];
  // Check the condition (Array.isArray(value)) and run the matching branch.
  if (Array.isArray(value)) return value.flatMap((item) => collectPathValues(item, parts));
  // Return the result of collectPathValues() to the caller.
  return collectPathValues(value[parts[0]], parts.slice(1));
}

// Define safeErrorMessage; its parameters and body implement this operation.
function safeErrorMessage(error) {
  // Return the result of String(error?.message || "Seed failed.")     .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]")     .replace() to the caller.
  return String(error?.message || "Seed failed.")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "[MongoDB URI redacted]")
    .replace(/(password|secret|token|credential)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");
}

// Define inspectReferences; its parameters and body implement this operation.
async function inspectReferences(Model, docs, tenantId, failures) {
  // Repeat the enclosed work for each required iteration.
  for (const doc of docs) {
    // Repeat the enclosed work for each required iteration.
    for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {
      // Declare refName for use by the surrounding module or function.
      const refName = schemaPath.options?.ref || schemaPath.caster?.options?.ref;
      // Declare refPath for use by the surrounding module or function.
      const refPath = schemaPath.options?.refPath;
      // Declare modelName for use by the surrounding module or function.
      const modelName = refName || (refPath ? doc[refPath] : null);
      // Declare RefModel for use by the surrounding module or function.
      const RefModel = modelName && mongoose.models[modelName];
      // Check the condition (!RefModel) and run the matching branch.
      if (!RefModel) continue;
      // Declare refs for use by the surrounding module or function.
      const refs = collectPathValues(doc, field.split(".")).filter((value) => value != null && value !== "");
      // Declare platformOwner for use by the surrounding module or function.
      const platformOwner = Model === User && ["super_admin", "superadmin"].includes(String(doc.role || "").toLowerCase());
      // Declare ownerId for use by the surrounding module or function.
      const ownerId = tenantId && RefModel.schema.path("tenantId") && !["Organization", "Permission", "Currency"].includes(modelName)
        ? String(platformOwner ? "platform" : (doc.tenantId || tenantId))
        : "global";
      // Declare cacheKey for use by the surrounding module or function.
      const cacheKey = `${modelName}:${ownerId}`;
      // Check the condition (!referenceCache.has(cacheKey)) and run the matching branch.
      if (!referenceCache.has(cacheKey)) {
        // Declare filter for use by the surrounding module or function.
        const filter = {};
        // Check the condition (ownerId !== "global") and run the matching branch.
        if (ownerId !== "global") filter.tenantId = ownerId === "platform" ? null : (doc.tenantId || tenantId);
        // Declare existing for use by the surrounding module or function.
        const existing = await RefModel.find(filter).select("_id").lean();
        // Perform the side effect or state update expressed on the following line.
        referenceCache.set(cacheKey, new Set(existing.map((entry) => String(entry._id))));
      }
      // Declare validIds for use by the surrounding module or function.
      const validIds = referenceCache.get(cacheKey);
      // Repeat the enclosed work for each required iteration.
      for (const reference of refs) {
        // Declare id for use by the surrounding module or function.
        const id = reference?._id || reference;
        // Check the condition (!validIds.has(String(id))) and run the matching branch.
        if (!validIds.has(String(id))) failures.push(`${Model.modelName}.${field} points to missing or cross-tenant ${modelName}:${String(id)}`);
      }
    }
  }
}

// Define upsert; its parameters and body implement this operation.
async function upsert(Model, filter, fields) {
  // Check the condition (typeof Model?.findOne !== "function") and run the matching branch.
  if (typeof Model?.findOne !== "function") throw new Error(`Seed fixture is not a Mongoose model with findOne(): ${Model?.modelName || Model?.name || typeof Model}; caller ${new Error().stack?.split("\n")[2]?.trim() || "unknown"}`);
  // Check the condition (existingCollections && !existingCollections.has(Model.collection.colle) and run the matching branch.
  if (existingCollections && !existingCollections.has(Model.collection.collectionName)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Required application collection was not initialized: ${Model.collection.collectionName}`);
  }
  // Declare findQuery for use by the surrounding module or function.
  let findQuery = Model.findOne(filter);
  // Check the condition (Model === Tour) and run the matching branch.
  if (Model === Tour) findQuery = findQuery.sort({ createdAt: 1, _id: 1 });
  // Declare doc for use by the surrounding module or function.
  let doc = await findQuery;
  // Check the condition (!doc) and run the matching branch.
  if (!doc) doc = new Model({ ...filter, ...fields });
  else Object.assign(doc, fields);
  // Declare missing for use by the surrounding module or function.
  const missing = assertRequiredSchemaFields(Model, doc);
  // Check the condition (missing.length) and run the matching branch.
  if (missing.length) throw new Error(`Required fields missing: ${missing.join(", ")}`);
  // Perform the side effect or state update expressed on the following line.
  await doc.validate();
  // Perform the side effect or state update expressed on the following line.
  await doc.save();
  // Return the value of doc to the caller.
  return doc;
}

// Define upsertPlain; its parameters and body implement this operation.
async function upsertPlain(Model, filter, fields) {
  // Check the condition (existingCollections && !existingCollections.has(Model.collection.colle) and run the matching branch.
  if (existingCollections && !existingCollections.has(Model.collection.collectionName)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error(`Required application collection was not initialized: ${Model.collection.collectionName}`);
  }
  // Declare doc for use by the surrounding module or function.
  const doc = await Model.findOneAndUpdate(filter, { $set: fields }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
  // Return the value of doc to the caller.
  return doc;
}

// Define initializeApplicationCollections; its parameters and body implement this operation.
async function initializeApplicationCollections() {
  // Declare missingCollections for use by the surrounding module or function.
  const missingCollections = allModels.map((Model) => Model.collection.collectionName).filter((name) => !existingCollections.has(name));
  // Check the condition (isExplicitProductionTestSeed()) and run the matching branch.
  if (isExplicitProductionTestSeed()) {
    // Check the condition (missingCollections.length) and run the matching branch.
    if (missingCollections.length) throw new Error(`Production test seed is read-only with respect to MongoDB DDL and cannot create ${missingCollections.length} missing application collection(s): ${missingCollections.join(", ")}. No tenant or RBAC data writes were made.`);
    // Perform the side effect or state update expressed on the following line.
    console.log(`Production test seed reusing all ${existingCollections.size} existing application collections; collection creation and index reconciliation are disabled.`);
    // Return the result to the caller.
    return;
  }
  // Declare newlyCreatedCollections for use by the surrounding module or function.
  const newlyCreatedCollections = new Set();
  // Repeat the enclosed work for each required iteration.
  for (const Model of allModels) {
    // Declare name for use by the surrounding module or function.
    const name = Model.collection.collectionName;
    // Check the condition (!existingCollections.has(name)) and run the matching branch.
    if (!existingCollections.has(name)) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        await Model.createCollection();
      } catch (error) {
        // Check the condition (error.codeName !== "NamespaceExists" && error.code !== 48) and run the matching branch.
        if (error.codeName !== "NamespaceExists" && error.code !== 48) throw error;
      }
      // Perform the side effect or state update expressed on the following line.
      existingCollections.add(name);
      // Perform the side effect or state update expressed on the following line.
      newlyCreatedCollections.add(name);
    }
  }
  // Perform the side effect or state update expressed on the following line.
  await reconcileBookingExternalIdIndex();
  // Perform the side effect or state update expressed on the following line.
  await reconcileSubscriptionPaymentIndex();
  // Perform the side effect or state update expressed on the following line.
  await reconcileExpensePurchaseOrderIndex();
  // Declare initialized for use by the surrounding module or function.
  const initialized = new Set();
  // Repeat the enclosed work for each required iteration.
  for (const Model of allModels) {
    // Declare name for use by the surrounding module or function.
    const name = Model.collection.collectionName;
    // Check the condition (newlyCreatedCollections.has(name) && !initialized.has(name)) and run the matching branch.
    if (newlyCreatedCollections.has(name) && !initialized.has(name)) {
      // Perform the side effect or state update expressed on the following line.
      await Model.init();
      // Perform the side effect or state update expressed on the following line.
      initialized.add(name);
    }
  }
  // Perform the side effect or state update expressed on the following line.
  console.log(`Application collections ready: ${existingCollections.size}; new collections initialized: ${initialized.size}.`);
}

// Define countClusterCollections; its parameters and body implement this operation.
async function countClusterCollections() {
  // Declare { databases = [] } for use by the surrounding module or function.
  const { databases = [] } = await mongoose.connection.db.admin().listDatabases({ nameOnly: true });
  // Declare counts for use by the surrounding module or function.
  const counts = await Promise.all(databases.map(async ({ name }) => {
    // Declare database for use by the surrounding module or function.
    const database = mongoose.connection.getClient().db(name);
    // Return the length value to the caller.
    return (await database.listCollections({}, { nameOnly: true }).toArray()).length;
  }));
  // Return the result of counts.reduce() to the caller.
  return counts.reduce((total, count) => total + count, 0);
}

// Define replacePriorDemoData; its parameters and body implement this operation.
async function replacePriorDemoData() {
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ role: "super_admin", bypass: true }, async () => {
  // Declare tenantDocs for use by the surrounding module or function.
  const tenantDocs = [];
  // Declare preflight for use by the surrounding module or function.
  const preflight = { namespace: NAMESPACE, database: mongoose.connection.name, timestamp: new Date().toISOString(), tenants: [], plannedDeletionCounts: {}, plannedGlobalCleanupCounts: {} };
  // Repeat the enclosed work for each required iteration.
  for (const tenantSpec of tenantsSpec) {
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findOne({ slug: tenantSpec.slug }).lean();
    // Declare knownDemoTenant for use by the surrounding module or function.
    const knownDemoTenant = tenant && tenant.name === tenantSpec.name && tenant.status === "active";
    // Check the condition (tenant && tenant.settings?.testSeedNamespace !== NAMESPACE && !(knownD) and run the matching branch.
    if (tenant && tenant.settings?.testSeedNamespace !== NAMESPACE && !(knownDemoTenant && process.env.ALLOW_ATLAS_DEMO_SEED === "YES" && process.env.CONFIRM_TEST_SEED === "YES")) {
      // Stop the current operation by raising a new Error instance.
      throw new Error(`Refusing to replace tenant without the exact demo seed marker: ${tenantSpec.slug}`);
    }
    // Check the condition (tenant) and run the matching branch.
    if (tenant) {
      // Perform the side effect or state update expressed on the following line.
      tenantDocs.push(tenant);
      // Perform the side effect or state update expressed on the following line.
      preflight.tenants.push({ slug: tenant.slug, id: String(tenant._id), namespaceMarked: tenant.settings?.testSeedNamespace === NAMESPACE });
    }
  }
  // Declare tenantIds for use by the surrounding module or function.
  const tenantIds = tenantDocs.map(({ _id }) => _id);
  // Check the condition (tenantIds.length) and run the matching branch.
  if (tenantIds.length) {
    // Repeat the enclosed work for each required iteration.
    for (const Model of allModels) {
      // Check the condition (Model === Organization || Model === Permission || !Model.schema.path(") and run the matching branch.
      if (Model === Organization || Model === Permission || !Model.schema.path("tenantId")) continue;
      // Declare count for use by the surrounding module or function.
      const count = await Model.countDocuments({ tenantId: { $in: tenantIds } });
      // Check the condition (count) and run the matching branch.
      if (count) preflight.plannedDeletionCounts[Model.modelName] = count;
    }
  }
  // Perform the side effect or state update expressed on the following line.
  preflight.plannedGlobalCleanupCounts.permissions = await Permission.countDocuments({ name: /^test_seed_2026_/ });
  // Perform the side effect or state update expressed on the following line.
  preflight.plannedGlobalCleanupCounts.platformRoles = await Role.countDocuments({ tenantId: null, name: "super_admin", description: "TEST/DEMO platform owner RBAC role" });
  // Declare legacyPlatformUser for use by the surrounding module or function.
  const legacyPlatformUser = await User.findOne({ email: "superadmin@hussein-mboya.com", role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id").lean();
  // Declare canonicalPlatformUser for use by the surrounding module or function.
  const canonicalPlatformUser = await User.findOne({ email: "superadmin1@husseinmboya.com", tenantId: null }).select("_id").lean();
  // Check the condition (legacyPlatformUser && canonicalPlatformUser && String(legacyPlatformUs) and run the matching branch.
  if (legacyPlatformUser && canonicalPlatformUser && String(legacyPlatformUser._id) !== String(canonicalPlatformUser._id)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Refusing seed: both legacy and canonical global demo accounts exist; review the duplicate before seeding.");
  }
  // Perform the side effect or state update expressed on the following line.
  preflight.platformAccountMigration = legacyPlatformUser && !canonicalPlatformUser ? "rename legacy global account to canonical address" : "no legacy global account migration needed";
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(path.resolve(__dirname, "../reports/test-seed-preflight-report.json"), `${JSON.stringify(preflight, null, 2)}\n`, { mode: 0o600 });
  // Check the condition (legacyPlatformUser && !canonicalPlatformUser) and run the matching branch.
  if (legacyPlatformUser && !canonicalPlatformUser) await User.updateOne(
    { _id: legacyPlatformUser._id, tenantId: null },
    { $set: { email: "superadmin1@husseinmboya.com", role: "super_admin", legacyRole: "super_admin", status: "active" } }
  );
  // Declare deletedCounts for use by the surrounding module or function.
  const deletedCounts = {};
  // Check the condition (tenantIds.length) and run the matching branch.
  if (tenantIds.length) {
    // Repeat the enclosed work for each required iteration.
    for (const Model of allModels) {
      // Check the condition (Model === Organization || Model === Permission || !Model.schema.path(") and run the matching branch.
      if (Model === Organization || Model === Permission || !Model.schema.path("tenantId")) continue;
      // Declare result for use by the surrounding module or function.
      const result = await Model.deleteMany({ tenantId: { $in: tenantIds } });
      // Check the condition (result.deletedCount) and run the matching branch.
      if (result.deletedCount) deletedCounts[Model.modelName] = result.deletedCount;
    }
  }
  // Declare roleCleanup for use by the surrounding module or function.
  const roleCleanup = await Role.deleteMany({ tenantId: null, name: "super_admin", description: "TEST/DEMO platform owner RBAC role" });
  // Check the condition (roleCleanup.deletedCount) and run the matching branch.
  if (roleCleanup.deletedCount) deletedCounts.Role = (deletedCounts.Role || 0) + roleCleanup.deletedCount;
  // Declare permissionCleanup for use by the surrounding module or function.
  const permissionCleanup = await Permission.deleteMany({ name: /^test_seed_2026_/ });
  // Check the condition (permissionCleanup.deletedCount) and run the matching branch.
  if (permissionCleanup.deletedCount) deletedCounts.Permission = permissionCleanup.deletedCount;
  // Return the object assembled below to the caller.
  return { tenantIds, deletedCounts };
  });
}

// Define reconcileExpensePurchaseOrderIndex; its parameters and body implement this operation.
async function reconcileExpensePurchaseOrderIndex() {
  // Check the condition (!existingCollections?.has(Expense.collection.collectionName)) and run the matching branch.
  if (!existingCollections?.has(Expense.collection.collectionName)) return;
  // Declare collection for use by the surrounding module or function.
  const collection = mongoose.connection.db.collection(Expense.collection.collectionName);
  // Declare indexes for use by the surrounding module or function.
  const indexes = await collection.indexes();
  // Declare current for use by the surrounding module or function.
  const current = indexes.find((index) => index.name === "tenantId_1_purchaseOrder_1");
  // Check the condition (current?.partialFilterExpression?.purchaseOrder?.$type === "objectId") and run the matching branch.
  if (current?.partialFilterExpression?.purchaseOrder?.$type === "objectId") return;
  // Declare duplicates for use by the surrounding module or function.
  const duplicates = await collection.aggregate([
    { $match: { purchaseOrder: { $type: "objectId" } } },
    { $group: { _id: { tenantId: "$tenantId", purchaseOrder: "$purchaseOrder" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  // Check the condition (duplicates.length) and run the matching branch.
  if (duplicates.length) throw new Error("Cannot repair the expense purchase-order index: existing duplicate purchase-order references need review.");
  // Check the condition (current) and run the matching branch.
  if (current) await collection.dropIndex(current.name);
  // Perform the side effect or state update expressed on the following line.
  await collection.createIndex({ tenantId: 1, purchaseOrder: 1 }, {
    name: "tenantId_1_purchaseOrder_1",
    unique: true,
    partialFilterExpression: { purchaseOrder: { $type: "objectId" } },
  });
}

// Define reconcileBookingExternalIdIndex; its parameters and body implement this operation.
async function reconcileBookingExternalIdIndex() {
  // Check the condition (!existingCollections?.has(Booking.collection.collectionName)) and run the matching branch.
  if (!existingCollections?.has(Booking.collection.collectionName)) return;
  // Declare collection for use by the surrounding module or function.
  const collection = mongoose.connection.db.collection(Booking.collection.collectionName);
  // Declare indexes for use by the surrounding module or function.
  const indexes = await collection.indexes();
  // Declare indexName for use by the surrounding module or function.
  const indexName = "tenantId_1_externalSource_1_externalBookingId_1";
  // Declare current for use by the surrounding module or function.
  const current = indexes.find((index) => index.name === indexName);
  // Declare filter for use by the surrounding module or function.
  const filter = current?.partialFilterExpression?.externalBookingId;
  // Check the condition (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) and run the matching branch.
  if (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) return;
  // Declare duplicates for use by the surrounding module or function.
  const duplicates = await collection.aggregate([
    { $match: { externalBookingId: { $type: "string", $gt: "" } } },
    { $group: { _id: { tenantId: "$tenantId", externalSource: "$externalSource", externalBookingId: "$externalBookingId" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  // Check the condition (duplicates.length) and run the matching branch.
  if (duplicates.length) throw new Error("Cannot repair the booking external identifier index: existing duplicate external booking IDs need review.");
  // Check the condition (current) and run the matching branch.
  if (current) await collection.dropIndex(current.name);
  // Perform the side effect or state update expressed on the following line.
  await collection.createIndex({ tenantId: 1, externalSource: 1, externalBookingId: 1 }, {
    name: indexName,
    unique: true,
    partialFilterExpression: { externalBookingId: { $type: "string", $gt: "" } },
  });
}

// Define reconcileSubscriptionPaymentIndex; its parameters and body implement this operation.
async function reconcileSubscriptionPaymentIndex() {
  // Check the condition (!existingCollections?.has(SubscriptionPayment.collection.collectionNam) and run the matching branch.
  if (!existingCollections?.has(SubscriptionPayment.collection.collectionName)) return;
  // Declare collection for use by the surrounding module or function.
  const collection = mongoose.connection.db.collection(SubscriptionPayment.collection.collectionName);
  // Declare indexes for use by the surrounding module or function.
  const indexes = await collection.indexes();
  // Declare indexName for use by the surrounding module or function.
  const indexName = "provider_1_transactionReference_1";
  // Declare current for use by the surrounding module or function.
  const current = indexes.find((index) => index.name === indexName);
  // Declare filter for use by the surrounding module or function.
  const filter = current?.partialFilterExpression?.transactionReference;
  // Check the condition (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) and run the matching branch.
  if (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) return;
  // Declare duplicates for use by the surrounding module or function.
  const duplicates = await collection.aggregate([
    { $match: { transactionReference: { $type: "string", $gt: "" } } },
    { $group: { _id: { provider: "$provider", transactionReference: "$transactionReference" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 1 },
  ]).toArray();
  // Check the condition (duplicates.length) and run the matching branch.
  if (duplicates.length) throw new Error("Cannot repair the subscription payment transaction index: duplicate references need review.");
  // Check the condition (current) and run the matching branch.
  if (current) await collection.dropIndex(current.name);
  // Perform the side effect or state update expressed on the following line.
  await collection.createIndex({ provider: 1, transactionReference: 1 }, {
    name: indexName,
    unique: true,
    partialFilterExpression: { transactionReference: { $type: "string", $gt: "" } },
  });
}

// Define createUsers; its parameters and body implement this operation.
async function createUsers(tenant, roleMap, prefix, ti, platform = false, platformRole = null) {
  // Declare testPassword for use by the surrounding module or function.
  const testPassword = getTestPassword();
  // Declare accountSpecs for use by the surrounding module or function.
  const accountSpecs = [
    ["admin", "admin", "Administrator"], ["manager", "tour_manager", "Tour Manager"],
    ["agent1", "agent", "Travel Agent"], ["agent2", "agent", "Travel Agent"],
    ["guide1", "tour_guide", "Tour Guide"], ["guide2", "tour_guide", "Tour Guide"],
    ["driver1", "driver", "Driver"], ["driver2", "driver", "Driver"],
    ["customer1", "customer", "Customer"], ["customer2", "customer", "Customer"],
    ["customer3", "customer", "Customer"], ["customer4", "customer", "Customer"],
  ];
  // Check the condition (platform) and run the matching branch.
  if (platform) accountSpecs.unshift(["superadmin", "super_admin", "Platform Owner"]);
  // Declare users for use by the surrounding module or function.
  const users = [];
  // Repeat the enclosed work for each required iteration.
  for (let i = 0; i < accountSpecs.length; i++) {
    // Declare [local, role, title] for use by the surrounding module or function.
    const [local, role, title] = accountSpecs[i];
    // Declare email for use by the surrounding module or function.
    const email = loginEmail(local, prefix);
    // Declare id for use by the surrounding module or function.
    const id = platform && local === "superadmin" ? null : tenant._id;
    // Declare filter for use by the surrounding module or function.
    const filter = id ? { tenantId: id, email } : { email, tenantId: null };
    // Declare provision for use by the surrounding module or function.
    const provision = async () => {
      // Declare user for use by the surrounding module or function.
      let user = await User.findOne(filter).select("+password");
      // Check the condition (!user) and run the matching branch.
      if (!user) user = new User({ ...filter, email });
      // Perform the side effect or state update expressed on the following line.
      user.name = `${title} TEST ${prefix.toUpperCase()} ${local}`;
      // Perform the side effect or state update expressed on the following line.
      user.phone = stablePhone(ti, i + (platform ? 100 : 1));
      // Perform the side effect or state update expressed on the following line.
      user.role = role;
      // Perform the side effect or state update expressed on the following line.
      user.roleId = platform && local === "superadmin" ? platformRole._id : roleMap.get(role)._id;
      // Perform the side effect or state update expressed on the following line.
      user.legacyRole = role;
      // Perform the side effect or state update expressed on the following line.
      user.status = "active";
      // Perform the side effect or state update expressed on the following line.
      user.isVerified = true;
      // Perform the side effect or state update expressed on the following line.
      user.password = testPassword;
      // Perform the side effect or state update expressed on the following line.
      await user.save();
      // Return the result of User.findById(user._id).select() to the caller.
      return User.findById(user._id).select("+password");
    };
    // Declare saved for use by the surrounding module or function.
    const saved = id ? await provision() : await runWithTenant({ role: "super_admin", bypass: true }, provision);
    // Check the condition (!saved || !(await saved.matchPassword(testPassword))) and run the matching branch.
    if (!saved || !(await saved.matchPassword(testPassword))) throw new Error(`Seed password verification failed for ${email}`);
    // Perform the side effect or state update expressed on the following line.
    users.push(saved);
  }
  // Return the value of users to the caller.
  return users;
}

// Define buildSeedTourItinerary; its parameters and body implement this operation.
function buildSeedTourItinerary({ title, destination, tenantPrefix, county }) {
  // Declare destinationName for use by the surrounding module or function.
  const destinationName = String(destination?.name || county || "Kenya").replace(/^TEST\s+/i, "");
  // Declare tourName for use by the surrounding module or function.
  const tourName = String(title || "Kenya experience").replace(/^TEST\s+/i, "");
  // Declare plans for use by the surrounding module or function.
  const plans = {
    hussein: [
      { title: "Arrival, welcome and safari briefing", description: `Meet the local team for the ${tourName}. Review the route, safety guidance and the day's arrangements before travelling toward ${destinationName}.`, activities: ["Pickup or meeting-point coordination", "Route and safety briefing", "Scenic transfer toward the destination"], meals: ["Lunch", "Dinner"] },
      { title: "Guided destination experience", description: `Spend the main day exploring ${destinationName} with a local guide. Wildlife and outdoor activities depend on conditions, park rules and the final confirmed itinerary.`, activities: ["Guided exploration", "Photo and rest stops", "Local interpretation and nature viewing"], meals: ["Breakfast", "Lunch", "Dinner"] },
      { title: "Final activity and return journey", description: "Enjoy a final morning experience where timing allows, then check out and travel to the agreed drop-off point.", activities: ["Morning activity, subject to conditions", "Check-out and departure briefing", "Return transfer or onward connection"], meals: ["Breakfast"] },
    ],
    amani: [
      { title: "Welcome and journey orientation", description: `Meet your Amani Trails team and begin the ${tourName}. Confirm the day's route, planned stops and any seasonal considerations before setting out for ${destinationName}.`, activities: ["Guest welcome and trip briefing", "Confirm route and pickup details", "Scenic journey with planned comfort stops"], meals: ["Lunch", "Dinner"] },
      { title: "Signature guided experience", description: `Explore ${destinationName} at a considered pace with your guide. Activities may be adjusted for weather, wildlife movement, conservation rules and local operating conditions.`, activities: ["Guided nature or heritage experience", "Photography and interpretation stops", "Time to enjoy the destination"], meals: ["Breakfast", "Lunch", "Dinner"] },
      { title: "Leisure, check-out and onward travel", description: "After breakfast, enjoy a final short activity if time permits, then check out and return to the agreed drop-off point.", activities: ["Optional morning activity", "Check-out and departure preparation", "Return transfer or onward connection"], meals: ["Breakfast"] },
    ],
    demo: [
      { title: "Meet your guide and get underway", description: `Start the ${tourName} with a welcome briefing and journey to ${destinationName}. The guide will confirm practical arrangements and the order of activities.`, activities: ["Meeting-point and guest check-in", "Safety and schedule briefing", "Transfer to the experience area"], meals: ["Lunch", "Dinner"] },
      { title: "Explore, learn and take in the scenery", description: `Enjoy a full day of guided discovery around ${destinationName}. The final activity order is subject to local conditions, access rules and operator confirmation.`, activities: ["Main guided activity", "Scenic viewpoints and photo stops", "Local nature or cultural interpretation"], meals: ["Breakfast", "Lunch", "Dinner"] },
      { title: "Last look and departure", description: "Complete a final activity where the schedule allows, then prepare for departure and the return transfer.", activities: ["Final morning stop, if time allows", "Check-out and luggage check", "Return transfer or onward travel"], meals: ["Breakfast"] },
    ],
  };
  // Return the result of (plans[tenantPrefix] || plans.hussein).map() to the caller.
  return (plans[tenantPrefix] || plans.hussein).map((day, index) => ({
    day: index + 1,
    ...day,
    accommodation: index < 2 ? "Accommodation as confirmed in the booking" : "",
  }));
}

// Define seedTenant; its parameters and body implement this operation.
async function seedTenant(spec, index, globalPermissionIds, platformRole = null) {
  // Declare tenant for use by the surrounding module or function.
  const tenant = await upsertPlain(Organization, { slug: spec.slug }, {
    name: spec.name, legalName: spec.legalName, supportEmail: `contact@${tenantDomain[spec.prefix]}`, supportPhone: stablePhone(index, 950),
    address: `TEST Seed Office, ${spec.county}, Kenya`, country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", status: "active",
    subscription: { plan: "professional", seats: 30, trialEndsAt: dates(90) },
    features: { payments: false, mpesa: false, stripe: false, ai: false, customDomain: false },
    settings: { publicBranding: { displayName: `${spec.name} DEMO`, description: "Synthetic test tenant." }, payments: { mode: "disabled" }, etims: { environment: "sandbox", status: "not_configured" }, testSeedNamespace: NAMESPACE },
  });

  // Declare permissions for use by the surrounding module or function.
  const permissions = globalPermissionIds;
  // Declare roleDefs for use by the surrounding module or function.
  const roleDefs = [
    ["super_admin", "Platform Owner", 100], ["admin", "Tenant Administrator", 90], ["tour_manager", "Tour Manager", 70],
    ["agent", "Travel Agent", 60], ["tour_guide", "Tour Guide", 50], ["driver", "Driver", 40], ["customer", "Customer", 10],
  ];
  // Declare roleMap for use by the surrounding module or function.
  const roleMap = new Map();
  // Declare seededUsers for use by the surrounding module or function.
  let seededUsers = [];
  // Return the result of runWithTenant() to the caller.
  return runWithTenant({ tenantId: tenant._id, role: "admin", bypass: true }, async () => {
    // Repeat the enclosed work for each required iteration.
    for (const provider of ["MPESA", "STRIPE", "BANK"]) await upsert(PaymentGatewayConfig, { tenantId: tenant._id, provider }, { tenantId: tenant._id, provider, environment: "sandbox", enabled: false, accountName: `TEST ${provider} disabled`, updatedBy: null });
    // Repeat the enclosed work for each required iteration.
    for (const [name, displayName, level] of roleDefs) {
      // Declare allowedModules for use by the surrounding module or function.
      const allowedModules = { super_admin: null, admin: null, tour_manager: new Set(["dashboard", "destination", "tour", "booking", "customer", "report"]), agent: new Set(["dashboard", "tour", "booking", "customer"]), tour_guide: new Set(["dashboard", "tour", "booking"]), driver: new Set(["dashboard", "tour", "booking"]), customer: new Set() }[name];
      // Declare rolePermissions for use by the surrounding module or function.
      const rolePermissions = permissions.filter((permission) => allowedModules === null || allowedModules.has(permission.module));
      // Perform the side effect or state update expressed on the following line.
      roleMap.set(name, await upsert(Role, { tenantId: tenant._id, name }, { displayName, description: `TEST/DEMO ${displayName} role`, level, status: "active", isSystem: true, isDefault: name === "customer", permissions: rolePermissions.map((permission) => permission._id) }));
    }
    // Declare users for use by the surrounding module or function.
    const users = await createUsers(tenant, roleMap, spec.prefix, index, Boolean(platformRole), platformRole);
    // Perform the side effect or state update expressed on the following line.
    seededUsers = users;
    // Declare byEmail for use by the surrounding module or function.
    const byEmail = new Map(users.map((u) => [u.email, u]));
    // Declare staffByKind for use by the surrounding module or function.
    const staffByKind = new Map();
    // Repeat the enclosed work for each required iteration.
    for (const [kind, position, roleName, nth] of [["manager", "tour_manager", "manager", 1], ["guide1", "guide", "guide", 1], ["guide2", "guide", "guide", 2], ["driver1", "driver", "driver", 1], ["driver2", "driver", "driver", 2]]) {
      // Declare accountLocal for use by the surrounding module or function.
      const accountLocal = kind === "manager" ? "manager" : kind;
      // Declare account for use by the surrounding module or function.
      const account = byEmail.get(loginEmail(accountLocal, spec.prefix));
      // Declare staff for use by the surrounding module or function.
      const staff = await upsert(Staff, { tenantId: tenant._id, email: account.email }, { name: account.name, email: account.email, phone: account.phone, position, role: roleName, status: "active", availability: "available", employmentType: "full_time", languages: ["English", "Swahili"], certifications: ["TEST/DEMO operational induction"], licenseNumber: position === "driver" ? `TEST-KEN-DRV-${index}${nth}` : "", employeeNumber: `TEST-${spec.prefix.toUpperCase()}-STAFF-${kind.toUpperCase()}`, address: `${spec.county}, Kenya`, user: account._id });
      // Perform the side effect or state update expressed on the following line.
      staffByKind.set(kind, staff);
      // Perform the side effect or state update expressed on the following line.
      await upsert(StaffProfile, { tenantId: tenant._id, user: account._id }, { user: account._id, staff: staff._id, bio: `TEST/DEMO ${position} profile.`, address: `${spec.county}, Kenya`, city: spec.county, country: "Kenya", emergencyContact: { name: "TEST Emergency Contact", relationship: "Friend", phone: stablePhone(index, 650 + nth) }, education: ["Tourism operations TEST"], certifications: ["TEST/DEMO induction"], skills: ["Customer service", "Safety"], languages: ["English", "Swahili"], profileCompleted: true });
    }
    // Declare agentUsers for use by the surrounding module or function.
    const agentUsers = ["agent1", "agent2"].map((local) => byEmail.get(loginEmail(local, spec.prefix)));
    // Declare agents for use by the surrounding module or function.
    const agents = [];
    // Repeat the enclosed work for each required iteration.
    for (const [i, account] of agentUsers.entries()) agents.push(await upsert(Agent, { tenantId: tenant._id, user: account._id }, { user: account._id, companyName: `TEST ${spec.name} Agent ${i + 1}`, email: account.email, phone: account.phone, commissionRate: 8, status: "active", isApproved: true, approvedBy: byEmail.get(loginEmail("admin", spec.prefix))._id, approvedAt: new Date(), location: `${spec.county}, Kenya`, description: "Synthetic test travel agent profile.", licenseNumber: `TEST-${spec.prefix.toUpperCase()}-AGENT-LIC-${i + 1}` }));

    // Declare customerUsers for use by the surrounding module or function.
    const customerUsers = [1, 2, 3, 4].map((n) => byEmail.get(loginEmail(`customer${n}`, spec.prefix)));
    // Declare customers for use by the surrounding module or function.
    const customers = [];
    // Repeat the enclosed work for each required iteration.
    for (const [i, account] of customerUsers.entries()) customers.push(await upsert(Customer, { tenantId: tenant._id, user: account._id }, { user: account._id, agent: agents[i % agents.length]._id, firstName: `Demo${i + 1}`, lastName: `Traveler${spec.prefix}`, email: account.email, phone: account.phone, nationality: "Kenyan", country: "Kenya", county: spec.county, city: spec.county, address: `TEST Seed ${spec.county}, Kenya`, customerType: "individual", status: "active", preferredContactMethod: "email", marketingConsent: false }));
    // Repeat the enclosed work for each required iteration.
    for (const [i, account] of customerUsers.entries()) await upsert(CustomerProfile, { tenantId: tenant._id, user: account._id }, { tenantId: tenant._id, user: account._id, gender: "other", nationality: "Kenyan", address: `TEST ${spec.county}, Kenya`, city: spec.county, country: "Kenya", emergencyContact: { name: "TEST Emergency Contact", relationship: "Friend", phone: stablePhone(index, 600 + i) }, travelPreferences: { destinations: [spec.county], activities: ["wildlife", "culture"], travelStyle: "family", budgetRange: "medium", preferredAccommodation: "standard", preferredTransport: "road", dietaryRequirements: ["None"], accessibilityNeeds: "None" }, loyaltyPoints: 100 * (i + 1), loyaltyTier: "bronze", totalBookings: 0, completedBookings: 0, cancelledBookings: 0, totalSpent: 0, averageBookingValue: 0, customerType: "new", marketingPreferences: { email: false, sms: false, whatsapp: false, promotions: false }, notes: "TEST/DEMO customer profile.", isActive: true, isDeleted: false });

    // Declare vehicles for use by the surrounding module or function.
    const vehicles = [];
    // Declare vehicleSpecs for use by the surrounding module or function.
    const vehicleSpecs = [["Safari Land Cruiser", "LAND_CRUISER", "KDA TEST 01"], ["Safari Van", "VAN", "KDB TEST 02"], ["Toyota Hiace", "VAN", "KDC TEST 03"], ["Toyota Prado", "SUV", "KDD TEST 04"], ["Transfer Sedan", "SEDAN", "KDE TEST 05"], ["Minibus", "MINIBUS", "KDF TEST 06"]];
    // Repeat the enclosed work for each required iteration.
    for (const [i, [name, type, baseRegistrationNumber]] of vehicleSpecs.entries()) { const registrationNumber = `TEST-${spec.prefix.toUpperCase()}-${baseRegistrationNumber.replace(/[^A-Z0-9]+/gi, "-")}`; vehicles.push(await upsert(Vehicle, { tenantId: tenant._id, registrationNumber }, { name: `TEST ${spec.name} ${name}`, registrationNumber, model: name, manufacturer: name.startsWith("Toyota") ? "Toyota" : "Land Rover", year: 2024, type, capacity: type === "SEDAN" ? 4 : type === "MINIBUS" ? 18 : 7, driver: staffByKind.get(i % 2 ? "driver2" : "driver1")._id, status: i === 5 ? "maintenance" : i === 1 ? "assigned" : "available", isActive: true, isDeleted: false, fuelType: "Diesel", transmission: "Automatic", description: "TEST/DEMO fleet record", nextServiceDate: dates(90) })); }

    // Declare destinations for use by the surrounding module or function.
    const destinations = [];
    // Each tenant receives a genuinely distinct catalogue, not the same names with a different tenantId.
    // Declare destinationCatalogues for use by the surrounding module or function.
    const destinationCatalogues = {
      hussein: ["Maasai Mara Conservancy", "Amboseli Kilimanjaro Plains", "Tsavo East Wilderness", "Tsavo West Springs", "Naivasha Rift Valley", "Nakuru Flamingo Lakes", "Samburu Northern Frontier", "Mount Kenya Highlands", "Watamu Marine Coast", "Diani Coral Shores", "Lamu Old Town Coast", "Nairobi Urban Wildlife"],
      amani: ["Mara River Migration Camp", "Amboseli Elephant Corridor", "Tsavo Red-Earth Trails", "Chyulu Hills Explorer", "Naivasha Crescent Island", "Nakuru Rhino Sanctuary", "Samburu Ewaso Nyiro", "Aberdare Forest Escape", "Kilifi Creek Retreat", "Shimba Hills Coast", "Lamu Cultural Islands", "Ol Pejeta Conservancy"],
      demo: ["Mombasa Heritage Quarter", "Taita Hills Sanctuary", "Galana River Safari", "Mzima Springs Discovery", "Hell's Gate Adventure Park", "Elementaita Bird Haven", "Meru Wilderness Reserve", "Thomson Falls Highlands", "Malindi Marine Park", "Kisite Mpunguti Reef", "Pate Island Heritage", "Karura Forest Escape"],
    };
    // Declare dests for use by the surrounding module or function.
    const dests = destinationCatalogues[spec.prefix];
    // Repeat the enclosed work for each required iteration.
    for (const [i, name] of dests.entries()) {
      // Declare image for use by the surrounding module or function.
      const image = destinationImage((index - 1) * dests.length + i);
      // Perform the side effect or state update expressed on the following line.
      destinations.push(await upsert(Destination, { tenantId: tenant._id, slug: `test-${spec.prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }, { name: `TEST ${name}`, slug: `test-${spec.prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, country: "Kenya", region: spec.county, city: spec.county, description: `TEST/DEMO ${spec.name} destination: ${name}, fixture ${i + 1} in ${spec.county}, Kenya.`, shortDescription: `${spec.name}: ${name}`, featuredImage: image, images: [{ url: image }], attractions: [spec.name, name, "Wildlife", "Culture"], activities: ["Guided tour", "Photography", `${spec.name} experience`], languages: ["English", "Swahili"], currency: "KES", timezone: "Africa/Nairobi", status: "active", active: true, isDeleted: false }));
    }
    // Repeat the enclosed work for each required iteration.
    for (const [i, account] of customerUsers.entries()) await upsert(UserPreference, { tenantId: tenant._id, user: account._id }, { user: account._id, interests: ["wildlife", "culture"], preferredCountries: ["Kenya"], preferredDestinations: [destinations[i]._id], preferredCategories: ["Safari", "Cultural"], travelStyle: ["Family", "Group"], budgetRange: { min: 30000, max: 200000 }, preferredAccommodation: "Standard", preferredTransport: "Road", language: "English", receivePromotions: false, receiveNewsletters: false });

    // Declare category for use by the surrounding module or function.
    const category = await upsert(TourCategory, { tenantId: tenant._id, slug: `test-${spec.prefix}-safari` }, { tenantId: tenant._id, name: `TEST ${spec.name} Safari`, slug: `test-${spec.prefix}-safari`, icon: "Map", description: "Synthetic safari category.", image: sharedDemoImage, active: true });
    // Declare tours for use by the surrounding module or function.
    const tours = [];
    // Declare tourCatalogues for use by the surrounding module or function.
    const tourCatalogues = {
      hussein: ["Mara Big Five Expedition", "Kilimanjaro View from Amboseli", "Nakuru Flamingo Photography", "Nairobi Dawn Game Drive", "Diani Private Beach Escape", "Kenyan Coast Heritage Journey", "Tsavo East Family Safari", "Mount Kenya Summit Foothills"],
      amani: ["Mara Great Migration Signature", "Amboseli Elephant Tracking", "Rift Valley Birding Retreat", "Aberdare Waterfall Trek", "Naivasha Boat and Crescent Island", "Samburu Samburu Culture Circuit", "Chyulu Hills Walking Safari", "Ol Pejeta Rhino Conservation"],
      demo: ["Mombasa Swahili City Discovery", "Taita Hills Night Safari", "Galana River Wildlife Trail", "Hell's Gate Cycling Adventure", "Malindi Coral Reef Getaway", "Kisite Marine Snorkelling", "Meru Untamed Wilderness", "Lamu Dhow and Island Culture"],
    };
    // Declare tourNames for use by the surrounding module or function.
    const tourNames = tourCatalogues[spec.prefix];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < tourNames.length; i++) {
      // Declare destination for use by the surrounding module or function.
      const destination = destinations[i % destinations.length];
      // Declare title for use by the surrounding module or function.
      const title = `TEST ${tourNames[i]} - ${spec.name}`;
      // Declare image for use by the surrounding module or function.
      const image = tourImage((index - 1) * tourNames.length + i);
      // Perform the side effect or state update expressed on the following line.
      tours.push(await upsert(Tour, { tenantId: tenant._id, title: `TEST ${spec.name} Safari ${String(i + 1).padStart(2, "0")}` }, {
        title, slug: `test-${spec.prefix}-safari-${i + 1}`, description: `TEST/DEMO guided itinerary for ${destination.name}, Kenya.`, shortDescription: `TEST Kenya safari ${i + 1}`,
        destination: destination._id, country: "Kenya", location: destination.region || spec.county, category: "Safari", tags: ["TEST", "DEMO", "Kenya"], meetingPoint: "Nairobi CBD TEST pickup", duration: "3", durationDays: 3, durationDetails: { days: 3, nights: 2 }, date: dates(45 + i), startDate: dates(45 + i), capacity: 40,
        price: (index * 10000) + 45000 + i * 2500, agentPrice: (index * 10000) + 42000 + i * 2500, discount: 5, taxEnabled: false, taxCategory: "NON_VAT", taxMode: "exclusive", featuredImage: { url: image }, gallery: [{ url: image }], highlights: ["TEST wildlife viewing", "Kenyan guide"], inclusions: ["Transport", "Guide"], exclusions: ["International flights"], languages: ["English", "Swahili"], difficulty: "easy",
        itinerary: buildSeedTourItinerary({ title, destination, tenantPrefix: spec.prefix, county: spec.county }), availability: [{ date: dates(45 + i), totalSlots: 40, bookedSlots: 0 }], availabilitySettings: { totalSlots: 40, bookedSlots: 0, waitlistEnabled: true }, bookingDeadline: 1, cancellationPolicy: "TEST/DEMO cancellation policy; no real booking is created.", status: "upcoming", published: true, featured: i < 2, available: true, isDeleted: false, assignedGuide: staffByKind.get("guide1")._id, assignedDriver: staffByKind.get("driver1")._id, assignedVehicle: vehicles[0]._id,
      }));
    }
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Perform the side effect or state update expressed on the following line.
      await Tour.updateMany(
        { tenantId: tenant._id, title: tour.title, _id: { $ne: tour._id }, isDeleted: { $ne: true } },
        { $set: { isDeleted: true, deletedAt: new Date(), status: "cancelled", published: false, available: false } },
      );
    }
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) await upsert(Itinerary, { tenantId: tenant._id, tour: tour._id }, { tenantId: tenant._id, tour: tour._id, days: [1, 2, 3].map((dayNumber) => ({ dayNumber, title: `TEST Day ${dayNumber}`, summary: "Synthetic Kenya itinerary day.", activities: [{ title: "Guided sightseeing", startTime: "09:00", endTime: "12:00", description: "Demo itinerary activity.", location: spec.county, meal: dayNumber === 1 ? "lunch" : "breakfast", transport: "TEST safari vehicle", image: sharedDemoImage }] })), overview: "TEST/DEMO multi-day itinerary.", highlights: ["Wildlife", "Culture"], included: ["Guide", "Transport"], excluded: ["International airfare"], status: "published", createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id });
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) await upsert(TourGallery, { tenantId: tenant._id, tour: tour._id }, { tenantId: tenant._id, tour: tour._id, images: [{ url: sharedDemoImage, caption: "TEST/DEMO safari gallery image", alt: "Synthetic Kenya safari image", uploadedBy: byEmail.get(loginEmail("admin", spec.prefix))._id, featured: true, order: 0 }], active: true, isDeleted: false, createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Gallery, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari gallery` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari gallery`, image: { url: sharedDemoImage, publicId: "" }, category: "Safari", featured: false, active: true });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Media, { tenantId: tenant._id, fileName: `test-${spec.prefix}-safari-image.jpg` }, { tenantId: tenant._id, fileName: `test-${spec.prefix}-safari-image.jpg`, originalName: `TEST ${spec.name} safari image`, url: sharedDemoImage, publicId: "", fileType: "image", mimeType: "image/jpeg", extension: "jpg", size: 0, folder: "test-demo", category: "tour", tags: ["TEST", "DEMO"], relatedModel: "Tour", relatedId: tours[0]._id, uploadedBy: byEmail.get(loginEmail("admin", spec.prefix))._id, visibility: "public", isDeleted: false });
    // Declare packages for use by the surrounding module or function.
    const packages = [];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 3; i++) packages.push(await upsert(TourPackage, { tenantId: tenant._id, slug: `test-${spec.prefix}-package-${i + 1}` }, {
      title: `TEST ${spec.name} Package ${i + 1}`, slug: `test-${spec.prefix}-package-${i + 1}`, description: "Synthetic sample multi-day Kenya safari package.", destination: destinations[i].name, category: "Safari", duration: String(3 + i), numberOfDays: 3 + i, basePrice: 75000 + i * 5000, agentPrice: 70000 + i * 5000, createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id, status: "active", published: true, inclusions: ["Transport", "Guide"], exclusions: ["Airfare"], highlights: ["TEST safari", "Kenyan guide"], itinerary: Array.from({ length: 3 + i }, (_, index) => ({ day: index + 1, title: `TEST Day ${index + 1}`, description: "Synthetic sample itinerary day." })), coverImage: { url: sharedDemoImage }, gallery: [{ url: sharedDemoImage }],
    }));
    // Perform the side effect or state update expressed on the following line.
    await upsert(HeroSlide, { tenantId: tenant._id, title: `TEST ${spec.prefix} homepage slide` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} homepage slide`, subtitle: "Synthetic demo content", image: { url: sharedDemoImage, publicId: "" }, badge: "TEST/DEMO", buttonOne: { text: "Explore test tours", link: "/tours" }, buttonTwo: { text: "Test booking", link: "/book" }, active: true, order: 99 });

    // Perform the side effect or state update expressed on the following line.
    await upsert(Coupon, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-SAVE10` }, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-SAVE10`, description: "Synthetic demo coupon.", discountType: "percentage", amount: 10, startDate: new Date(), expiresAt: dates(90), usageLimit: 100, usedCount: 0, minimumBookingAmount: 10000, maximumDiscount: 20000, active: true, createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Promotion, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari promotion` }, { tenantId: tenant._id, title: `TEST ${spec.prefix} safari promotion`, description: "Synthetic demo promotion.", code: `TEST-${spec.prefix.toUpperCase()}-PROMO`, discountType: "percentage", discountValue: 5, startDate: new Date(), endDate: dates(60), tours: [tours[0]._id], audience: "all", usageLimit: 100, usageCount: 0, active: true, isDeleted: false, createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Campaign, { tenantId: tenant._id, name: `TEST ${spec.prefix} demo campaign` }, { tenantId: tenant._id, name: `TEST ${spec.prefix} demo campaign`, description: "Synthetic campaign; no messages are delivered.", type: "email", subject: "TEST demo only", message: "Synthetic marketing content. Do not send.", audience: "custom", recipients: [], status: "draft", totalRecipients: 0, sentCount: 0, deliveredCount: 0, failedCount: 0, openedCount: 0, clickedCount: 0, unsubscribedCount: 0, createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id, isDeleted: false });
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < customerUsers.length; i++) {
      // Declare user for use by the surrounding module or function.
      const user = customerUsers[i];
      // Perform the side effect or state update expressed on the following line.
      await upsert(Loyalty, { tenantId: tenant._id, user: user._id }, { user: user._id, availablePoints: 100 * (i + 1), lifetimePoints: 200 * (i + 1), redeemedPoints: 100 * i, expiredPoints: 0, tier: "Bronze", referralCode: `TEST-${spec.prefix.toUpperCase()}-LOYAL-${i + 1}`, successfulReferrals: i, status: "active", transactions: [] });
      // Perform the side effect or state update expressed on the following line.
      await upsert(LoyaltyAccount, { tenantId: tenant._id, customerId: user._id }, { tenantId: tenant._id, customerId: user._id, points: 100 * (i + 1), lifetimeEarned: 200 * (i + 1), lifetimeRedeemed: 100 * i, referralCode: `TEST-${spec.prefix.toUpperCase()}-REF-${i + 1}` });
      // Perform the side effect or state update expressed on the following line.
      await upsert(Wishlist, { tenantId: tenant._id, user: user._id }, { user: user._id, tours: [tours[i]._id, tours[(i + 1) % tours.length]._id] });
      // Check the condition (i > 0) and run the matching branch.
      if (i > 0) await upsert(Referral, { tenantId: tenant._id, referredUser: user._id }, { tenantId: tenant._id, referrer: customerUsers[0]._id, referredUser: user._id, booking: null, referralCode: `TEST-${spec.prefix.toUpperCase()}-REF-1`, reward: 250, rewardType: "points", status: ["pending", "qualified", "approved"][i - 1], notes: "Synthetic test referral." });
    }

    // Declare bookings for use by the surrounding module or function.
    const bookings = [];
    // Declare states for use by the surrounding module or function.
    const states = ["pending", "confirmed", "assigned", "completed", "cancelled", "refunded", "confirmed", "pending", "assigned", "completed"];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 10; i++) {
      // Declare customer for use by the surrounding module or function.
      const customer = customers[i % customers.length]; const user = customerUsers[i % customerUsers.length]; const tour = tours[i % tours.length]; const status = states[i];
      // Declare paymentStatus for use by the surrounding module or function.
      const paymentStatus = i === 2 || i === 6 ? "partial" : i === 3 ? "paid" : i === 5 ? "refunded" : "pending";
      // Declare total for use by the surrounding module or function.
      const total = tour.price * (1 + (i % 2)); const paid = paymentStatus === "paid" ? total : paymentStatus === "partial" ? Math.round(total / 2) : 0;
      // Perform the side effect or state update expressed on the following line.
      bookings.push(await upsert(Booking, { tenantId: tenant._id, bookingNumber: `TEST-${spec.prefix.toUpperCase()}-BK-${String(i + 1).padStart(4, "0")}` }, {
        bookingNumber: `TEST-${spec.prefix.toUpperCase()}-BK-${String(i + 1).padStart(4, "0")}`, customer: customer._id, user: user._id, customerSnapshot: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone }, contact: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email, phone: customer.phone }, tour: tour._id, travelDate: tour.date, travelers: [{ name: `${customer.firstName} ${customer.lastName}`, age: 30, nationality: "Kenyan" }], numberOfGuests: 1 + (i % 2), subtotal: total, totalAmount: total, amountPaid: paid, balanceAmount: Math.max(0, total - paid), paymentMethod: i % 3 === 0 ? "MPESA" : i % 3 === 1 ? "CARD" : "BANK_TRANSFER", paymentStatus, status, agent: agents[i % agents.length]._id, assignedGuide: staffByKind.get("guide1")._id, assignedDriver: staffByKind.get("driver1")._id, assignedVehicle: vehicles[0]._id, bookingSource: "admin", notes: "TEST/DEMO fixture; no real trip or payment.", refundAmount: paymentStatus === "refunded" ? total : 0, refundStatus: paymentStatus === "refunded" ? "completed" : "none", isDeleted: false,
      }));
    }
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
      // Declare guestTotals for use by the surrounding module or function.
      const guestTotals = await Booking.aggregate([
        { $match: { tenantId: tenant._id, tour: tour._id, status: { $nin: ["cancelled", "refunded"] }, isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
      ]);
      // Perform the side effect or state update expressed on the following line.
      tour.availabilitySettings.bookedSlots = Number(guestTotals[0]?.total || 0);
      // Perform the side effect or state update expressed on the following line.
      tour.availability = (tour.availability || []).map((slot) => ({ ...(typeof slot.toObject === "function" ? slot.toObject() : slot), bookedSlots: tour.availabilitySettings.bookedSlots }));
      // Perform the side effect or state update expressed on the following line.
      await tour.save();
    }
    // Declare payments for use by the surrounding module or function.
    const payments = [];
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 10; i++) {
      // Declare booking for use by the surrounding module or function.
      const booking = bookings[i]; const amount = Math.max(1, Number(booking.amountPaid || booking.totalAmount));
      // Declare status for use by the surrounding module or function.
      const status = i === 0 ? "pending" : i === 1 ? "failed" : i === 5 ? "refunded" : [2, 3, 6].includes(i) ? "completed" : "pending";
      // Declare provider for use by the surrounding module or function.
      const provider = [0, 5, 6].includes(i) ? "MPESA" : [1, 2].includes(i) ? "STRIPE" : "BANK";
      // Declare method for use by the surrounding module or function.
      const method = provider === "MPESA" ? "mpesa" : provider === "STRIPE" ? "card" : "bank";
      // Declare paymentMethod for use by the surrounding module or function.
      const paymentMethod = provider === "MPESA" ? "MPESA" : provider === "STRIPE" ? "CARD" : "BANK_TRANSFER";
      // Perform the side effect or state update expressed on the following line.
      payments.push(await upsert(Payment, { tenantId: tenant._id, transactionReference: `TEST-PAY-${spec.prefix.toUpperCase()}-${String(i + 1).padStart(6, "0")}` }, { tenantId: tenant._id, customer: booking.user, user: booking.user, booking: booking._id, provider, method, paymentMethod, amount, currency: "KES", status, transactionReference: `TEST-PAY-${spec.prefix.toUpperCase()}-${String(i + 1).padStart(6, "0")}`, transactionId: provider === "MPESA" ? `TEST-MPESA-${String(index * 100 + i + 1).padStart(6, "0")}` : `TEST-${spec.prefix.toUpperCase()}-TX-${i + 1}`, failureReason: status === "failed" ? "Synthetic test decline; no gateway was contacted." : "", refundStatus: status === "refunded" ? "completed" : "none", refundReference: status === "refunded" ? `TEST-REFUND-${spec.prefix.toUpperCase()}-000001` : "", refundedAt: status === "refunded" ? dates(-1) : null, notes: "Synthetic test payment record; no gateway call was made.", paidAt: ["completed", "refunded"].includes(status) ? dates(-1) : null, refundedAmount: status === "refunded" ? amount : 0 }));
    }
    // Repeat the enclosed work for each required iteration.
    for (const [i, booking] of bookings.entries()) {
      // Declare amount for use by the surrounding module or function.
      const amount = Number(booking.totalAmount); const amountPaid = Number(booking.amountPaid || 0);
      // Declare payment for use by the surrounding module or function.
      const payment = payments[i];
      // Perform the side effect or state update expressed on the following line.
      booking.payments = [payment._id];
      // Perform the side effect or state update expressed on the following line.
      booking.paymentReference = payment.transactionReference;
      // Perform the side effect or state update expressed on the following line.
      await booking.save();
      // Perform the side effect or state update expressed on the following line.
      await upsert(Invoice, { tenantId: tenant._id, booking: booking._id }, { tenantId: tenant._id, booking: booking._id, customer: booking.customer, user: booking.user, tour: booking.tour, invoiceNumber: `TEST-${spec.prefix.toUpperCase()}-INV-${String(i + 1).padStart(5, "0")}`, subtotal: amount, taxableAmount: amount, discount: 0, tax: 0, taxRate: 0, totalAmount: amount, amountPaid, balance: Math.max(0, amount - amountPaid), currency: "KES", dueDate: dates(30), status: booking.status === "refunded" ? "refunded" : amountPaid >= amount ? "paid" : amountPaid > 0 ? "partial" : "pending", etimsStatus: "not_configured", etimsResponse: { syntheticTest: true, namespace: NAMESPACE }, items: [{ description: "TEST tour booking", quantity: 1, unitPrice: amount, taxableAmount: amount, taxRate: 0, taxAmount: 0, totalAmount: amount }], notes: "Synthetic invoice; not submitted to KRA/eTIMS." });
    }
    // Declare refundedBooking for use by the surrounding module or function.
    const refundedBooking = bookings[5];
    // Perform the side effect or state update expressed on the following line.
    await upsert(Refund, { tenantId: tenant._id, booking: refundedBooking._id, payment: payments[5]._id }, { tenantId: tenant._id, booking: refundedBooking._id, payment: payments[5]._id, amount: payments[5].amount, reason: "Synthetic test refund; no funds moved.", method: "mpesa", status: "completed", mpesaReference: `TEST-REFUND-${spec.prefix.toUpperCase()}-000001`, processedAt: dates(-1) });
    // Repeat the enclosed work for each required iteration.
    for (const [i, booking] of [bookings[3], bookings[5]].entries()) {
      // Declare invoice for use by the surrounding module or function.
      const invoice = await Invoice.findOne({ tenantId: tenant._id, booking: booking._id });
      // Perform the side effect or state update expressed on the following line.
      await upsert(CreditDebitNote, { tenantId: tenant._id, noteNumber: `TEST-${spec.prefix.toUpperCase()}-${i ? "CN" : "DN"}-000001` }, { tenantId: tenant._id, noteNumber: `TEST-${spec.prefix.toUpperCase()}-${i ? "CN" : "DN"}-000001`, type: i ? "credit" : "debit", originalInvoice: invoice._id, originalInvoiceNumber: invoice.invoiceNumber, reason: "Synthetic test adjustment; no KRA/eTIMS submission.", amount: 1000, taxAmount: 0, totalAmount: 1000, taxRate: 0, status: "draft", etimsStatus: "not_submitted", etimsResponse: { syntheticTest: true, namespace: NAMESPACE } });
    }
    // Declare etimsInvoice for use by the surrounding module or function.
    const etimsInvoice = await Invoice.findOne({ tenantId: tenant._id, booking: bookings[0]._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(EtimsSubmission, { tenantId: tenant._id, idempotencyKey: `TEST-ETIMS-${spec.prefix.toUpperCase()}-001` }, { tenantId: tenant._id, documentType: "invoice", documentId: etimsInvoice._id, documentNumber: etimsInvoice.invoiceNumber, attempt: 1, status: "pending", idempotencyKey: `TEST-ETIMS-${spec.prefix.toUpperCase()}-001`, response: { syntheticTest: true, namespace: NAMESPACE, submittedExternally: false }, error: "TEST/DEMO placeholder; no eTIMS call was made." });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Quotation, { tenantId: tenant._id, quotationNumber: `TEST-${spec.prefix.toUpperCase()}-QT-001` }, { tenantId: tenant._id, quotationNumber: `TEST-${spec.prefix.toUpperCase()}-QT-001`, agent: agents[0]._id, customer: customers[0]._id, tour: tours[0]._id, tourPackage: packages[0]._id, items: [{ name: "TEST safari package", category: "Activity", description: "Synthetic quotation line.", quantity: 1, unitPrice: 75000, total: 75000 }], subtotal: 75000, tax: 0, discount: 0, grandTotal: 75000, currency: "KES", status: "sent", validUntil: dates(14), sentAt: new Date(), notes: "TEST/DEMO quotation; not an offer to a real customer." });
    // Declare paymentLinkFilter for use by the surrounding module or function.
    const paymentLinkFilter = { tenantId: tenant._id, booking: bookings[0]._id };
    // Declare existingPaymentLink for use by the surrounding module or function.
    const existingPaymentLink = await PaymentLink.findOne(paymentLinkFilter).lean();
    // Perform the side effect or state update expressed on the following line.
    await upsert(PaymentLink, paymentLinkFilter, { token: existingPaymentLink?.token || randomBytes(32).toString("hex"), booking: bookings[0]._id, invoice: await Invoice.findOne({ tenantId: tenant._id, booking: bookings[0]._id }).then((invoice) => invoice._id), amount: bookings[0].balanceAmount || 1, currency: "KES", status: "cancelled", expiresAt: dates(-1), createdBy: byEmail.get(loginEmail("admin", spec.prefix))._id });

    // Declare suppliers for use by the surrounding module or function.
    const suppliers = [];
    // Repeat the enclosed work for each required iteration.
    for (const [i, category] of ["accommodation", "transport", "activity", "guide", "equipment"].entries()) suppliers.push(await upsert(Supplier, { tenantId: tenant._id, supplierNumber: `TEST-${spec.prefix.toUpperCase()}-SUP-${i + 1}` }, { tenantId: tenant._id, supplierNumber: `TEST-${spec.prefix.toUpperCase()}-SUP-${i + 1}`, legalName: `TEST ${category} supplier ${spec.name}`, tradingName: `Demo ${category}`, category, contacts: [{ name: "Demo Contact", email: `supplier${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 800 + i), role: "TEST contact" }], address: `${spec.county}, Kenya`, paymentTermsDays: 30, status: "active", notes: "Synthetic supplier data." }));
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 2; i++) await upsert(PurchaseOrder, { tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}` }, { tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}`, supplier: suppliers[i]._id, booking: bookings[i]._id, tour: tours[i]._id, issueDate: dates(-2), expectedDate: dates(10), currency: "KES", lines: [{ description: "TEST safari supply", quantity: 2, unitCost: 5000, taxRate: 0, taxType: "non_vat" }], status: "approved", notes: "Synthetic purchase order." });
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 2; i++) await upsert(SupplierPayable, { tenantId: tenant._id, payableNumber: `TEST-${spec.prefix.toUpperCase()}-PAYABLE-${i + 1}` }, { tenantId: tenant._id, payableNumber: `TEST-${spec.prefix.toUpperCase()}-PAYABLE-${i + 1}`, supplier: suppliers[i]._id, purchaseOrder: await PurchaseOrder.findOne({ tenantId: tenant._id, poNumber: `TEST-${spec.prefix.toUpperCase()}-PO-${i + 1}` }).then((po) => po._id), booking: bookings[i]._id, tour: tours[i]._id, amount: 10000, amountPaid: i ? 2500 : 0, dueDate: dates(30), status: i ? "partially_paid" : "open", paymentMethod: "BANK_TRANSFER", notes: "Synthetic supplier payable." });
    // Repeat the enclosed work for each required iteration.
    for (const [i, category] of ["fuel", "marketing", "office", "software", "communications", "transport", "accommodation", "operations"].entries()) await upsert(Expense, { tenantId: tenant._id, expenseNumber: `TEST-${spec.prefix.toUpperCase()}-EXP-${i + 1}` }, { tenantId: tenant._id, expenseNumber: `TEST-${spec.prefix.toUpperCase()}-EXP-${i + 1}`, category, description: `TEST ${category} expense`, amount: 2500 + i * 100, currency: "KES", expenseDate: dates(-i), status: i % 2 ? "approved" : "paid", paymentMethod: "BANK_TRANSFER", notes: "Synthetic test expense." });
    // Perform the side effect or state update expressed on the following line.
    await upsert(FixedAsset, { tenantId: tenant._id, assetNumber: `TEST-${spec.prefix.toUpperCase()}-ASSET-001` }, { tenantId: tenant._id, assetNumber: `TEST-${spec.prefix.toUpperCase()}-ASSET-001`, name: `TEST ${spec.name} office equipment`, category: "equipment", acquisitionDate: dates(-100), acquisitionCost: 85000, residualValue: 5000, usefulLifeMonths: 36, accumulatedDepreciation: 5000, status: "active" });
    // Repeat the enclosed work for each required iteration.
    for (const [i, type] of ["vehicle", "guide", "transfer", "park_fee"].entries()) await upsert(OperationalAsset, { tenantId: tenant._id, code: `TEST-${spec.prefix.toUpperCase()}-OPS-${i + 1}` }, { tenantId: tenant._id, type, name: `TEST ${type} operation ${i + 1}`, code: `TEST-${spec.prefix.toUpperCase()}-OPS-${i + 1}`, status: "available", bookingId: bookings[i]._id, tourId: tours[i]._id, assignedTo: customerUsers[0]._id, startAt: dates(30), endAt: dates(31), metadata: { namespace: NAMESPACE, synthetic: true }, notes: "Synthetic operational asset fixture." });
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) for (const [i, category] of ["accommodation", "transport", "park", "guide", "driver", "meals", "activity", "miscellaneous"].entries()) await upsert(TourCost, { tenantId: tenant._id, tour: tour._id, category }, { tenantId: tenant._id, tour: tour._id, category, description: `TEST ${category} cost`, quantity: 1, unitCost: 1000 + i * 100, currency: "KES", status: "estimated" });
    // Repeat the enclosed work for each required iteration.
    for (const [i, booking] of bookings.entries()) {
      // Declare status for use by the surrounding module or function.
      const status = ["cancelled", "refunded"].includes(booking.status) ? "cancelled" : ["pending", "approved", "paid"][i % 3];
      // Perform the side effect or state update expressed on the following line.
      await upsert(Commission, { tenantId: tenant._id, booking: booking._id, agent: agents[i % agents.length]._id }, { tenantId: tenant._id, agent: agents[i % agents.length]._id, booking: booking._id, customer: booking.user, tour: booking.tour, bookingAmount: booking.totalAmount, rate: 8, amount: booking.totalAmount * 0.08, status, paymentMethod: status === "paid" ? "BANK_TRANSFER" : undefined, paymentReference: status === "paid" ? `TEST-COMMISSION-${spec.prefix.toUpperCase()}-${i + 1}` : "", paidAt: status === "paid" ? dates(-1) : null, approvedBy: status === "approved" ? byEmail.get(loginEmail("admin", spec.prefix))._id : null, approvedAt: status === "approved" ? dates(-1) : null, notes: "TEST commission; no external payment occurred." });
    }

    // Declare hotel for use by the surrounding module or function.
    const hotel = await upsert(Hotel, { tenantId: tenant._id, slug: `test-${spec.prefix}-hotel` }, { tenantId: tenant._id, name: `TEST ${spec.name} Safari Lodge`, slug: `test-${spec.prefix}-hotel`, description: "Synthetic demo accommodation.", location: spec.county, address: `TEST lodge, ${spec.county}, Kenya`, city: spec.county, county: spec.county, country: "Kenya", starRating: 4, amenities: ["Wi-Fi", "Breakfast"], images: [sharedDemoImage], contactPhone: stablePhone(index, 960), contactEmail: `hotel.${spec.prefix}@test.globaltours.co.ke`, status: "active", currency: "KES" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(HospitalitySupplierContract, { tenantId: tenant._id, contractNumber: `TEST-${spec.prefix.toUpperCase()}-HOTEL-CONTRACT-001` }, { tenantId: tenant._id, supplierName: `TEST ${spec.name} Lodge`, supplierType: "hotel", hotel: hotel._id, contactName: "Demo Lodge Contact", contactPhone: stablePhone(index, 961), contactEmail: `hotel.${spec.prefix}@test.globaltours.co.ke`, contractNumber: `TEST-${spec.prefix.toUpperCase()}-HOTEL-CONTRACT-001`, currency: "KES", commissionPercent: 0, depositPercent: 0, rates: [{ name: "TEST Standard", roomType: "Deluxe", unit: "night", amount: 12000 }], validFrom: new Date("2026-01-01"), validTo: new Date("2027-12-31"), paymentTerms: "TEST prepaid at property", cancellationTerms: "TEST demo cancellation terms", status: "active", notes: "Synthetic test contract only; no supplier agreement exists." });
    // Declare room for use by the surrounding module or function.
    const room = await upsert(HotelRoomType, { tenantId: tenant._id, hotel: hotel._id, name: "TEST Deluxe Room" }, { tenantId: tenant._id, hotel: hotel._id, name: "TEST Deluxe Room", description: "Synthetic room inventory.", maxAdults: 2, maxChildren: 1, beds: ["Queen"], amenities: ["Wi-Fi"], totalRooms: 20, availableRooms: 18, nightlyRate: 12000, mealPlans: ["breakfast"], currency: "KES", status: "active" });
    // Declare ratePlan for use by the surrounding module or function.
    const ratePlan = await upsert(HospitalityRatePlan, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, name: "TEST Flexible" }, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, name: "TEST Flexible", nightlyRate: 12000, currency: "KES", status: "active", mealPlan: "breakfast" });
    // Declare hotelBooking for use by the surrounding module or function.
    const hotelBooking = await upsert(HotelBooking, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-HOTEL-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-HOTEL-001`, hotel: hotel._id, roomType: room._id, ratePlan: ratePlan._id, customer: customers[0]._id, user: customerUsers[0]._id, linkedBooking: bookings[0]._id, checkIn: dates(20), checkOut: dates(22), rooms: 1, adults: 2, guests: [{ firstName: "Demo", lastName: "Traveler", email: customerUsers[0].email, phone: customerUsers[0].phone, nationality: "Kenyan" }], subtotal: 24000, totalAmount: 24000, status: "confirmed", paymentStatus: "pending", source: "booking", currency: "KES" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(AccommodationInventory, { tenantId: tenant._id, propertyName: hotel.name, roomType: room.name }, { tenantId: tenant._id, propertyName: hotel.name, location: hotel.location, roomType: room.name, totalRooms: room.totalRooms, availableRooms: room.availableRooms, nightlyRate: room.nightlyRate, currency: "KES", status: "active", notes: "Synthetic inventory; not a live hotel feed." });
    // Declare blockStart for use by the surrounding module or function.
    const blockStart = new Date("2026-11-15T00:00:00.000Z"); const blockEnd = new Date("2026-11-17T00:00:00.000Z");
    // Perform the side effect or state update expressed on the following line.
    await upsert(HospitalityRoomBlock, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, startDate: blockStart, endDate: blockEnd }, { tenantId: tenant._id, hotel: hotel._id, roomType: room._id, startDate: blockStart, endDate: blockEnd, quantity: 1, reason: "TEST maintenance block", status: "blocked" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(HospitalityDeposit, { tenantId: tenant._id, hospitalityType: "hotel", hospitalityBooking: hotelBooking._id }, { tenantId: tenant._id, hospitalityType: "hotel", hospitalityBooking: hotelBooking._id, amount: 5000, paidAmount: 0, dueDate: dates(10), status: "pending", notes: "Synthetic demo deposit; no payment requested." });
    // Declare transfer for use by the surrounding module or function.
    const transfer = await upsert(AirportTransfer, { tenantId: tenant._id, name: `TEST ${spec.prefix} airport transfer` }, { tenantId: tenant._id, name: `TEST ${spec.prefix} airport transfer`, airportName: "Jomo Kenyatta International Airport TEST", airportCode: "NBO", direction: "airport_to_destination", pickupLocation: "JKIA TEST terminal", dropoffLocation: `${spec.county} hotel`, vehicleType: "TEST Van", passengerCapacity: 7, price: 6000, currency: "KES", status: "active", notes: "Synthetic transfer fixture." });
    // Declare transferBooking for use by the surrounding module or function.
    const transferBooking = await upsert(AirportTransferBooking, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-TRANSFER-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-TRANSFER-001`, transfer: transfer._id, customer: customers[0]._id, user: customerUsers[0]._id, linkedBooking: bookings[0]._id, pickupDateTime: dates(20), pickupLocation: "JKIA TEST terminal", dropoffLocation: `${spec.county} hotel`, passengerName: `${customers[0].firstName} ${customers[0].lastName}`, passengerPhone: customers[0].phone, passengerEmail: customers[0].email, passengers: 2, subtotal: 6000, totalAmount: 6000, assignedVehicle: vehicles[4]._id, assignedDriver: byEmail.get(loginEmail("driver1", spec.prefix))._id, status: "confirmed", paymentStatus: "pending", source: "booking" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(HospitalityDeposit, { tenantId: tenant._id, hospitalityType: "airport_transfer", hospitalityBooking: transferBooking._id }, { tenantId: tenant._id, hospitalityType: "airport_transfer", hospitalityBooking: transferBooking._id, amount: 1000, paidAmount: 0, dueDate: dates(10), status: "pending", notes: "Synthetic demo transfer deposit; no payment requested." });
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 3; i++) await upsert(Review, { tenantId: tenant._id, booking: bookings[i + 3]._id }, { tenantId: tenant._id, user: customerUsers[i % 4]._id, customer: customerUsers[i % 4]._id, tour: bookings[i + 3].tour, booking: bookings[i + 3]._id, rating: i + 3, title: "TEST sample review", comment: "Synthetic review text for a demo record.", verified: true, approved: i !== 0, rejected: false });
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 4; i++) await upsert(Lead, { tenantId: tenant._id, phone: stablePhone(index, 700 + i) }, { tenantId: tenant._id, name: `TEST prospective traveler ${i + 1}`, email: `lead${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 700 + i), country: "Kenya", county: spec.county, city: spec.county, tour: tours[i]._id, travelDate: tours[i].date, guests: 2, message: `${NAMESPACE} synthetic lead`, source: "test_seed", status: ["new", "contacted", "qualified", "lost"][i] });
    // Repeat the enclosed work for each required iteration.
    for (let i = 0; i < 2; i++) await upsert(CustomTourRequest, { tenantId: tenant._id, requirements: `${NAMESPACE} ${spec.prefix} request ${i + 1}` }, { customer: customerUsers[i]._id, user: customerUsers[i]._id, guestContact: { name: `${customers[i].firstName} ${customers[i].lastName}`, email: customerUsers[i].email, phone: customerUsers[i].phone }, destination: destinations[i].name, durationDays: 4, people: 2, startDate: dates(100), budget: 180000, requirements: `${NAMESPACE} ${spec.prefix} request ${i + 1}`, status: i ? "quoted" : "pending", assignedAgent: agents[i % 2]._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(TravelServiceRequest, { tenantId: tenant._id, title: `TEST airport support ${spec.prefix}` }, { tenantId: tenant._id, type: "airport_transfer", title: `TEST airport support ${spec.prefix}`, description: "Synthetic customer service request.", status: "open", priority: "normal", customer: customerUsers[0]._id, booking: bookings[0]._id });

    // Repeat the enclosed work for each required iteration.
    for (const [i, companyName] of ["Safari Corporate Ltd", "East Africa Business Travel Ltd", "Kenya Events Group", "Global NGO Travel Ltd", "Nairobi Consulting Services Ltd"].entries()) await upsert(CorporateAccount, { tenantId: tenant._id, companyName: `TEST ${companyName} ${spec.prefix}` }, { tenantId: tenant._id, companyName: `TEST ${companyName} ${spec.prefix}`, billingContacts: [{ name: `Demo Contact ${i + 1}`, email: `corporate${i + 1}.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980 + i), title: "TEST procurement" }], paymentTerms: "30_days", creditLimit: 1000000, status: "active", notes: "Synthetic corporate test account; no real business affiliation." });
    // Declare corporate for use by the surrounding module or function.
    const corporate = await CorporateAccount.findOne({ tenantId: tenant._id, companyName: `TEST Safari Corporate Ltd ${spec.prefix}` });
    // Repeat the enclosed work for each required iteration.
    for (const [i, notificationEvent] of ["booking confirmation", "payment received", "payment failure", "tour reminder", "cancellation", "refund", "assignment", "new lead", "invoice generated"].entries()) await upsert(Notification, { tenantId: tenant._id, recipient: byEmail.get(loginEmail("admin", spec.prefix))._id, title: `TEST ${spec.prefix} ${notificationEvent}` }, { tenantId: tenant._id, recipient: byEmail.get(loginEmail("admin", spec.prefix))._id, title: `TEST ${spec.prefix} ${notificationEvent}`, message: `Synthetic notification fixture: ${notificationEvent}. No real event occurred.`, type: i < 2 ? "booking" : i === 2 ? "payment" : "system", priority: "normal", isSent: false, metadata: { namespace: NAMESPACE, synthetic: true } });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Booking, { tenantId: tenant._id, bookingNumber: `TEST-${spec.prefix.toUpperCase()}-CORP-001` }, { bookingNumber: `TEST-${spec.prefix.toUpperCase()}-CORP-001`, bookingType: "corporate", corporateAccount: corporate._id, corporateCompanyName: corporate.companyName, customer: customers[0]._id, user: customerUsers[0]._id, tour: tours[0]._id, travelDate: tours[0].date, totalAmount: tours[0].price, subtotal: tours[0].price, status: "confirmed", paymentStatus: "pending", paymentTerms: "credit", billingContact: { name: "Demo Procurement Contact", email: `corporate.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980) }, contact: { name: "Demo Procurement Contact", email: `corporate.${spec.prefix}@test.globaltours.co.ke`, phone: stablePhone(index, 980) }, numberOfGuests: 4 });
    // Repeat the enclosed work for each required iteration.
    for (const tour of tours) {
        // Declare bookedTotals for use by the surrounding module or function.
        const bookedTotals = await Booking.aggregate([{ $match: { tenantId: tenant._id, tour: tour._id, status: { $nin: ["cancelled", "refunded"] }, isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }]);
        // Declare bookedSlots for use by the surrounding module or function.
        const bookedSlots = Number(bookedTotals[0]?.total || 0);
      // Perform the side effect or state update expressed on the following line.
      tour.availabilitySettings.bookedSlots = bookedSlots;
      // Check the condition (tour.availability?.length) and run the matching branch.
      if (tour.availability?.length) tour.availability[0].bookedSlots = bookedSlots;
      // Perform the side effect or state update expressed on the following line.
      await tour.save();
    }
    // Repeat the enclosed work for each required iteration.
    for (const customer of customers) {
      // Declare customerBookings for use by the surrounding module or function.
      const customerBookings = await Booking.find({ tenantId: tenant._id, customer: customer._id, isDeleted: { $ne: true } }).sort({ createdAt: 1 });
      // Declare completed for use by the surrounding module or function.
      const completed = customerBookings.filter((booking) => booking.status === "completed");
      // Declare cancelled for use by the surrounding module or function.
      const cancelled = customerBookings.filter((booking) => ["cancelled", "refunded"].includes(booking.status));
      // Declare totalSpent for use by the surrounding module or function.
      const totalSpent = customerBookings.reduce((sum, booking) => sum + Number(booking.amountPaid || 0), 0);
      // Perform the side effect or state update expressed on the following line.
      customer.totalBookings = customerBookings.length;
      // Perform the side effect or state update expressed on the following line.
      customer.completedBookings = completed.length;
      // Perform the side effect or state update expressed on the following line.
      customer.cancelledBookings = cancelled.length;
      // Perform the side effect or state update expressed on the following line.
      customer.totalSpent = totalSpent;
      // Perform the side effect or state update expressed on the following line.
      customer.lastBookingDate = customerBookings.at(-1)?.createdAt || null;
      // Perform the side effect or state update expressed on the following line.
      await customer.save();
      // Perform the side effect or state update expressed on the following line.
      await upsert(CustomerProfile, { tenantId: tenant._id, user: customer.user }, { tenantId: tenant._id, user: customer.user, totalBookings: customerBookings.length, completedBookings: completed.length, cancelledBookings: cancelled.length, totalSpent, averageBookingValue: customerBookings.length ? totalSpent / customerBookings.length : 0, lastBookingDate: customer.lastBookingDate, lastTravelDate: completed.at(-1)?.travelDate || null });
    }

    // Declare coa for use by the surrounding module or function.
    const coa = [];
    // Repeat the enclosed work for each required iteration.
    for (const [code, name, type] of [["1000", "TEST Cash", "asset"], ["4000", "TEST Tour Revenue", "revenue"], ["5000", "TEST Tour Expense", "expense"]]) coa.push(await upsert(ChartOfAccount, { tenantId: tenant._id, code }, { tenantId: tenant._id, code, name, type, active: true, description: "Synthetic chart account." }));
    // Perform the side effect or state update expressed on the following line.
    await upsert(AccountingPeriod, { tenantId: tenant._id, period: "2026-09" }, { tenantId: tenant._id, period: "2026-09", note: `${NAMESPACE} synthetic accounting period` });
    // Perform the side effect or state update expressed on the following line.
    await upsert(FinanceBudget, { tenantId: tenant._id, name: "TEST 2026 travel budget", fiscalYear: 2026, accountCode: "5000" }, { tenantId: tenant._id, name: "TEST 2026 travel budget", fiscalYear: 2026, accountCode: "5000", amount: 1000000, currency: "KES", status: "approved" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(TaxRule, { tenantId: tenant._id, code: "TEST-NONVAT" }, { tenantId: tenant._id, code: "TEST-NONVAT", name: "Synthetic non-VAT test rule", taxType: "NON_VAT", rate: 0, isActive: true, effectiveFrom: new Date("2026-01-01") });
    // Perform the side effect or state update expressed on the following line.
    await upsert(TaxProfile, { tenantId: tenant._id }, { tenantId: tenant._id, kraPin: "TEST-NOT-A-REAL-KRA-PIN", kraPinStatus: "not_verified", vatRegistered: false, taxRegime: "NON_VAT", etimsEnabled: false, etimsEnvironment: "sandbox", complianceNotes: "TEST/DEMO only; no government registration or eTIMS submission." });
    // Perform the side effect or state update expressed on the following line.
    await upsert(JournalEntry, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001` }, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001`, description: "TEST balanced opening demo entry", entryDate: dates(-1), status: "posted", postedAt: dates(-1), lines: [{ account: coa[0]._id, description: "Synthetic test debit", debit: 10000, credit: 0 }, { account: coa[1]._id, description: "Synthetic test credit", debit: 0, credit: 10000 }] });
    // Declare journal for use by the surrounding module or function.
    const journal = await JournalEntry.findOne({ tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-JE-001` });
    // Repeat the enclosed work for each required iteration.
    for (const [i, type] of ["TRA_LICENSE", "ODPC_REGISTRATION", "PRIVACY_POLICY", "DATA_RETENTION", "KRA_TAX_PROFILE", "ETIMS_ONBOARDING"].entries()) await upsert(ComplianceRecord, { tenantId: tenant._id, type }, { tenantId: tenant._id, type, status: "not_started", referenceNumber: `TEST-${spec.prefix.toUpperCase()}-COMPLIANCE-${i + 1}`, authority: "TEST/DEMO", notes: "Synthetic demo record; not a regulatory registration, approval, or submission." });
    // Repeat the enclosed work for each required iteration.
    for (const [i, type] of ["access", "correction", "deletion", "portability", "restriction"].entries()) await upsert(PrivacyRequest, { tenantId: tenant._id, type, requesterEmail: `privacy${i + 1}.${spec.prefix}@test.globaltours.co.ke` }, { tenantId: tenant._id, type, requesterName: `TEST requester ${i + 1}`, requesterEmail: `privacy${i + 1}.${spec.prefix}@test.globaltours.co.ke`, status: ["received", "identity_verification", "in_progress", "completed", "received"][i], details: "Synthetic privacy request for test data." });

    // Declare webhook for use by the surrounding module or function.
    const webhook = await upsert(Webhook, { tenantId: tenant._id, name: `TEST webhook ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST webhook ${spec.prefix}`, url: "https://example.invalid/test-webhook", secret: randomBytes(32).toString("hex"), events: ["booking.created"], active: false });
    // Perform the side effect or state update expressed on the following line.
    await upsert(WebhookDelivery, { tenantId: tenant._id, webhookId: webhook._id, eventId: `TEST-${spec.prefix.toUpperCase()}-EVENT-001` }, { tenantId: tenant._id, webhookId: webhook._id, event: "test.seed", eventId: `TEST-${spec.prefix.toUpperCase()}-EVENT-001`, status: "pending", payload: { namespace: NAMESPACE, synthetic: true }, attempts: 0 });
    // Perform the side effect or state update expressed on the following line.
    await upsert(WebsiteIntegrationKey, { tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST website key ${spec.prefix}`, keyPrefix: `test_${spec.prefix}`, keyHash: `synthetic-not-authenticatable-${spec.prefix}`, publicKey: `test-public-${spec.prefix}`, publicKeyHash: `synthetic-not-authenticatable-public-${spec.prefix}`, active: false, environment: "test", permissions: [] });
    // Perform the side effect or state update expressed on the following line.
    await upsert(WebsiteIntegrationEvent, { tenantId: tenant._id, eventType: "booking.rejected", integrationKey: (await WebsiteIntegrationKey.findOne({ tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }))._id }, { tenantId: tenant._id, integrationKey: (await WebsiteIntegrationKey.findOne({ tenantId: tenant._id, name: `TEST website key ${spec.prefix}` }))._id, eventType: "booking.rejected", payload: { namespace: NAMESPACE, synthetic: true }, error: "Synthetic rejected test event." });
    // Declare apiSecret for use by the surrounding module or function.
    const apiSecret = randomBytes(32).toString("hex");
    // Perform the side effect or state update expressed on the following line.
    await upsert(ApiKey, { tenantId: tenant._id, name: `TEST API key ${spec.prefix}` }, { tenantId: tenant._id, name: `TEST API key ${spec.prefix}`, prefix: `test_${spec.prefix}`, secretHash: ApiKey.hashSecret(apiSecret), scopes: ["test:only"], revokedAt: new Date(), expiresAt: dates(30) });
    // Perform the side effect or state update expressed on the following line.
    await upsert(Subscription, { tenantId: tenant._id }, { tenantId: tenant._id, plan: "professional", status: "trialing", trialStartsAt: new Date(), trialEndsAt: dates(30), currentPeriodStartsAt: new Date(), currentPeriodEndsAt: dates(30), currency: "KES", metadata: { namespace: NAMESPACE, synthetic: true } });
    // Perform the side effect or state update expressed on the following line.
    await upsert(SubscriptionPayment, { tenantId: tenant._id, transactionReference: `TEST-SUB-${spec.prefix.toUpperCase()}-001` }, { tenantId: tenant._id, userId: byEmail.get(loginEmail("admin", spec.prefix))._id, plan: "professional", amount: 1, currency: "KES", provider: "manual", status: "pending", transactionReference: `TEST-SUB-${spec.prefix.toUpperCase()}-001`, periodDays: 30, metadata: { namespace: NAMESPACE, synthetic: true, noGatewayCall: true } });
    // Perform the side effect or state update expressed on the following line.
    await upsert(WithholdingTax, { tenantId: tenant._id, reference: `TEST-${spec.prefix.toUpperCase()}-WHT-001` }, { tenantId: tenant._id, payee: suppliers[0]._id, payeeName: suppliers[0].legalName, sourceType: "supplier_payment", sourceId: bookings[0]._id, reference: `TEST-${spec.prefix.toUpperCase()}-WHT-001`, description: "Synthetic withholding tax test fixture.", taxType: "TEST-WHT", taxPeriod: "2026-09", baseAmount: 10000, rate: 5, taxAmount: 500, currency: "KES", status: "accrued" });
    // Perform the side effect or state update expressed on the following line.
    await upsert(AccountingReconciliation, { tenantId: tenant._id, sourceType: "bank", externalReference: `TEST-${spec.prefix.toUpperCase()}-RECON-001` }, { tenantId: tenant._id, sourceType: "bank", externalReference: `TEST-${spec.prefix.toUpperCase()}-RECON-001`, transactionDate: dates(-1), amount: 10000, currency: "KES", accountCode: "1000", journalEntry: journal._id, status: "matched", notes: "Synthetic reconciliation only; no bank data imported." });
    // Perform the side effect or state update expressed on the following line.
    await upsert(AccountingSubledger, { tenantId: tenant._id, type: "accrual", reference: `TEST-${spec.prefix.toUpperCase()}-SUBLEDGER-001` }, { tenantId: tenant._id, type: "accrual", reference: `TEST-${spec.prefix.toUpperCase()}-SUBLEDGER-001`, transactionDate: dates(-1), description: "Synthetic accrued tour cost.", amount: 10000, currency: "KES", exchangeRate: 1, baseAmount: 10000, quantity: 1, unitCost: 10000, accountCode: "5000", contraAccountCode: "1000", status: "posted", metadata: { namespace: NAMESPACE, synthetic: true }, journalEntry: journal._id });
    // Perform the side effect or state update expressed on the following line.
    await upsert(TourReport, { tenantId: tenant._id, tour: tours[0]._id, summary: `TEST-${spec.prefix}-tour report` }, { tenantId: tenant._id, tour: tours[0]._id, booking: bookings[3]._id, guide: staffByKind.get("guide1")._id, driver: staffByKind.get("driver1")._id, vehicle: vehicles[0]._id, summary: `TEST-${spec.prefix}-tour report`, highlights: ["Synthetic tour completed"], issues: [], recommendations: ["No operational action required"], customerFeedback: ["Synthetic feedback"], participants: 2, completedSuccessfully: true, guideRating: 5, images: [{ url: sharedDemoImage, caption: "Synthetic test report image", publicId: "" }], status: "submitted", completedAt: dates(-1) });

    // Declare expectedUsers for use by the surrounding module or function.
    const expectedUsers = seededUsers;
    // Declare bookingDocs for use by the surrounding module or function.
    const bookingDocs = await Booking.find({ tenantId: tenant._id, bookingNumber: /^TEST-/ });
    // Declare broken for use by the surrounding module or function.
    const broken = [];
    // Repeat the enclosed work for each required iteration.
    for (const booking of bookingDocs) {
      // Check the condition (!(await Customer.exists({ _id: booking.customer, tenantId: tenant._id ) and run the matching branch.
      if (!(await Customer.exists({ _id: booking.customer, tenantId: tenant._id })) || !(await Tour.exists({ _id: booking.tour, tenantId: tenant._id }))) broken.push(String(booking._id));
      // Check the condition (booking.amountPaid > booking.totalAmount || booking.balanceAmount !== ) and run the matching branch.
      if (booking.amountPaid > booking.totalAmount || booking.balanceAmount !== Math.max(0, booking.totalAmount - booking.amountPaid)) broken.push(`booking arithmetic:${booking.bookingNumber}`);
    }
    // Check the condition (journal && journal.lines.reduce((n, line) => n + line.debit, 0) !== jo) and run the matching branch.
    if (journal && journal.lines.reduce((n, line) => n + line.debit, 0) !== journal.lines.reduce((n, line) => n + line.credit, 0)) broken.push("unbalanced journal");
    // Declare counts for use by the surrounding module or function.
    const counts = {};
    // Repeat the enclosed work for each required iteration.
    for (const model of [User, Customer, CustomerProfile, UserPreference, Staff, StaffProfile, Agent, Vehicle, Destination, Tour, TourPackage, Booking, Payment, Invoice, Refund, CreditDebitNote, Supplier, SupplierPayable, PurchaseOrder, Expense, TourCost, Commission, ChartOfAccount, JournalEntry, AccountingPeriod, FinanceBudget, TaxRule, TaxProfile, ComplianceRecord, EtimsSubmission, PrivacyRequest, CorporateAccount, Hotel, HotelRoomType, AccommodationInventory, HospitalityRatePlan, HospitalityRoomBlock, HospitalitySupplierContract, HotelBooking, HospitalityDeposit, AirportTransfer, AirportTransferBooking, Review, Lead, CustomTourRequest, TravelServiceRequest, Notification, Coupon, Promotion, Campaign, Loyalty, LoyaltyAccount, Wishlist, Referral, PaymentGatewayConfig, Webhook, WebhookDelivery, WebsiteIntegrationKey, WebsiteIntegrationEvent, ApiKey, Subscription, SubscriptionPayment, PaymentLink, FixedAsset, OperationalAsset, TourCategory, Itinerary, Gallery, Media, TourGallery, TourReport, HeroSlide, Quotation, WithholdingTax, AccountingReconciliation, AccountingSubledger]) counts[model.modelName] = await model.countDocuments({ tenantId: tenant._id });
    // Return the object assembled below to the caller.
    return { tenant, users: expectedUsers.filter((user) => String(user.tenantId || "") === String(tenant._id)), counts, failures: broken, prefix: spec.prefix };
  });
}

// Define runCompleteTestDemoSeed; its parameters and body implement this operation.
export async function runCompleteTestDemoSeed() {
  // All guards precede connecting or writing. Never log the URI or credentials.
  // Declare target for use by the surrounding module or function.
  const target = databaseTarget();
  // Perform the side effect or state update expressed on the following line.
  console.log(`TEST seed target database: ${target.dbName}`);
  // Perform the side effect or state update expressed on the following line.
  safeTarget(target);
  // Perform the side effect or state update expressed on the following line.
  assertSeedConfirmation();
  // Perform the side effect or state update expressed on the following line.
  getTestPassword();
  // Perform the side effect or state update expressed on the following line.
  seedStage = "connecting to configured database";
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 120000 });
  // Perform the side effect or state update expressed on the following line.
  existingCollections = new Set((await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()).map(({ name }) => name));
  // Declare targetCollectionsBefore for use by the surrounding module or function.
  const targetCollectionsBefore = existingCollections.size;
  // Declare clusterCollectionsBefore for use by the surrounding module or function.
  const clusterCollectionsBefore = await countClusterCollections();
  // Check the condition (isExplicitProductionTestSeed()) and run the matching branch.
  if (isExplicitProductionTestSeed()) {
    // Declare missingCollections for use by the surrounding module or function.
    const missingCollections = allModels.map((Model) => Model.collection.collectionName).filter((name) => !existingCollections.has(name));
    // Check the condition (missingCollections.length) and run the matching branch.
    if (missingCollections.length) throw new Error(`Production seed blocked before writes: ${missingCollections.length} required collections are absent and Atlas collection capacity is constrained. Missing: ${missingCollections.join(", ")}.`);
  }
  // Perform the side effect or state update expressed on the following line.
  seedStage = "initializing application model collections and indexes";
  // Perform the side effect or state update expressed on the following line.
  await initializeApplicationCollections();
  // Perform the side effect or state update expressed on the following line.
  seedStage = "replacing namespace-marked demo tenant data";
  // Declare replacedDemoData for use by the surrounding module or function.
  const replacedDemoData = await replacePriorDemoData();
  // Check the condition (!isExplicitProductionTestSeed()) and run the matching branch.
  if (!isExplicitProductionTestSeed()) await reconcileExpensePurchaseOrderIndex();
  // Declare buildInfo for use by the surrounding module or function.
  const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });
  // Perform the side effect or state update expressed on the following line.
  assertSupportedMongoVersion(buildInfo.version);
  // Declare dbName for use by the surrounding module or function.
  const dbName = mongoose.connection.name;
  // Check the condition (dbName !== target.dbName) and run the matching branch.
  if (dbName !== target.dbName) throw new Error("Connected database name does not match guarded target.");

  // Perform the side effect or state update expressed on the following line.
  seedStage = "seeding demo tenants and interconnected data";
  // Declare permissions for use by the surrounding module or function.
  const permissions = [];
  // Declare permissionDefs for use by the surrounding module or function.
  const permissionDefs = [["dashboard.view", "dashboard"], ["users.read", "user"], ["users.write", "user"], ["roles.read", "role"], ["roles.write", "role"], ["destinations.read", "destination"], ["destinations.write", "destination"], ["tours.read", "tour"], ["tours.write", "tour"], ["packages.read", "tour"], ["packages.write", "tour"], ["bookings.read", "booking"], ["bookings.write", "booking"], ["customers.read", "customer"], ["customers.write", "customer"], ["payments.read", "payment"], ["reports.read", "report"], ["settings.read", "system"], ["settings.write", "system"]];
  // Repeat the enclosed work for each required iteration.
  for (const [shortName, module] of permissionDefs) {
    // Declare name for use by the surrounding module or function.
    const name = `test_seed_2026_${shortName.replace(/[.]/g, "_")}`;
    // Perform the side effect or state update expressed on the following line.
    permissions.push(await upsertPlain(Permission, { name }, { name, label: `TEST ${shortName.replace(/[._]/g, " ")}`, module, description: `TEST RBAC permission ${shortName}`, category: "other", isActive: true }));
  }
  // Declare results for use by the surrounding module or function.
  const results = [];
  // Declare platformRole for use by the surrounding module or function.
  const platformRole = await runWithTenant({ role: "super_admin", bypass: true }, () => upsert(Role, { tenantId: null, name: "super_admin" }, { displayName: "TEST Platform Owner", description: "TEST/DEMO platform owner RBAC role", level: 100, status: "active", isSystem: true, permissions: permissions.map((p) => p._id) }));
  // Repeat the enclosed work for each required iteration.
  for (const [index, spec] of tenantsSpec.entries()) results.push(await seedTenant(spec, index + 1, permissions, index === 0 ? platformRole : null));

  // The platform login is provisioned by first tenant's role map, preserving a valid Role reference.
  // It is included in that tenant user list and remains tenantless by User model platform role hook.
  // Declare allLoginEmails for use by the surrounding module or function.
  const allLoginEmails = TEST_LOGIN_EMAILS;
  // Declare failures for use by the surrounding module or function.
  const failures = results.flatMap((item) => item.failures);
  // Declare relationshipFailures for use by the surrounding module or function.
  const relationshipFailures = [];
  // Declare requiredFieldFindings for use by the surrounding module or function.
  const requiredFieldFindings = [];
  // Declare countsByCollection for use by the surrounding module or function.
  const countsByCollection = {};
  // Declare roleCounts for use by the surrounding module or function.
  const roleCounts = {};
  // Perform the side effect or state update expressed on the following line.
  seedStage = "validating demo records, relationships, accounting, authentication, and images";
  // Declare imageValidation for use by the surrounding module or function.
  const imageValidation = { tours: 0, uniqueTourImages: 0, duplicateTourImages: 0, destinations: 0, uniqueDestinationImages: 0, duplicateDestinationImages: 0, invalidImages: [] };
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    // Declare platformRoleDocs for use by the surrounding module or function.
    const platformRoleDocs = await Role.find({ tenantId: null, name: "super_admin" }).lean();
    // Declare globalPermissionDocs for use by the surrounding module or function.
    const globalPermissionDocs = await Permission.find({ name: /^test_seed_2026_/ }).lean();
    // Repeat the enclosed work for each required iteration.
    for (const [Model, docs] of [[Role, platformRoleDocs], [Permission, globalPermissionDocs]]) {
      // Repeat the enclosed work for each required iteration.
      for (const doc of docs) {
        // Declare missing for use by the surrounding module or function.
        const missing = assertRequiredSchemaFields(Model, doc);
        // Check the condition (missing.length) and run the matching branch.
        if (missing.length) requiredFieldFindings.push({ model: Model.modelName, id: String(doc._id), missing });
        // Run this operation with a dedicated error-handling path for failures.
        try { await new Model(doc).validate(); }
        // Handle the error raised by the preceding protected operation.
        catch (error) { requiredFieldFindings.push({ model: Model.modelName, id: String(doc._id), missing: [error.message] }); }
        // Perform the side effect or state update expressed on the following line.
        await inspectReferences(Model, [doc], null, relationshipFailures);
      }
    }
    // Declare platformDoc for use by the surrounding module or function.
    const platformDoc = await User.findOne({ email: "superadmin1@husseinmboya.com", tenantId: null }).select("+password");
    // Check the condition (platformDoc) and run the matching branch.
    if (platformDoc) {
      // Declare missing for use by the surrounding module or function.
      const missing = assertRequiredSchemaFields(User, platformDoc);
      // Check the condition (missing.length) and run the matching branch.
      if (missing.length) requiredFieldFindings.push({ model: User.modelName, id: String(platformDoc._id), missing });
      // Run this operation with a dedicated error-handling path for failures.
      try { await platformDoc.validate(); }
      // Handle the error raised by the preceding protected operation.
      catch (error) { requiredFieldFindings.push({ model: User.modelName, id: String(platformDoc._id), missing: [error.message] }); }
      // Perform the side effect or state update expressed on the following line.
      await inspectReferences(User, [platformDoc.toObject()], null, relationshipFailures);
    }
    // Repeat the enclosed work for each required iteration.
    for (const item of results) {
      // Check the condition (item.tenant.settings?.testSeedNamespace !== NAMESPACE || item.tenant.f) and run the matching branch.
      if (item.tenant.settings?.testSeedNamespace !== NAMESPACE || item.tenant.features?.mpesa !== false || item.tenant.settings?.payments?.mode !== "disabled") failures.push(`unsafe test tenant configuration:${item.tenant.slug}`);
      // Repeat the enclosed work for each required iteration.
      for (const model of allModels) {
        // Check the condition (!model.schema.path("tenantId") || model === Organization || model === ) and run the matching branch.
        if (!model.schema.path("tenantId") || model === Organization || model === Permission) continue;
        // Declare docs for use by the surrounding module or function.
        const docs = await model.find({ tenantId: item.tenant._id })
          .select(model === User ? "+password" : model === Webhook ? "+secret" : "")
          .lean();
        // Repeat the enclosed work for each required iteration.
        for (const doc of docs) {
          // Declare missing for use by the surrounding module or function.
          const missing = assertRequiredSchemaFields(model, doc);
          // Check the condition (missing.length) and run the matching branch.
          if (missing.length) requiredFieldFindings.push({ model: model.modelName, id: String(doc._id), missing });
          // Run this operation with a dedicated error-handling path for failures.
          try { await new model(doc).validate(); }
          // Handle the error raised by the preceding protected operation.
          catch (error) { requiredFieldFindings.push({ model: model.modelName, id: String(doc._id), missing: [error.message] }); }
        }
        // Perform the side effect or state update expressed on the following line.
        await inspectReferences(model, docs, item.tenant._id, relationshipFailures);
      }
      // Declare gatewayConfigs for use by the surrounding module or function.
      const gatewayConfigs = await PaymentGatewayConfig.find({ tenantId: item.tenant._id }).lean();
      // Check the condition (gatewayConfigs.some((config) => config.enabled || config.environment !) and run the matching branch.
      if (gatewayConfigs.some((config) => config.enabled || config.environment !== "sandbox" || [config.consumerKeyEncrypted, config.consumerSecretEncrypted, config.passkeyEncrypted, config.secretKeyEncrypted, config.webhookSecretEncrypted, config.initiatorNameEncrypted, config.securityCredentialEncrypted].some(Boolean))) failures.push(`unsafe payment gateway fixture configuration:${item.tenant.slug}`);
      // Declare seededTours for use by the surrounding module or function.
      const seededTours = await Tour.find({ tenantId: item.tenant._id, slug: /^test-/, isDeleted: { $ne: true } }).lean();
      // Repeat the enclosed work for each required iteration.
      for (const tour of seededTours) {
        // Declare bookedTotals for use by the surrounding module or function.
        const bookedTotals = await Booking.aggregate([{ $match: { tenantId: item.tenant._id, tour: tour._id, status: { $nin: ["cancelled", "refunded"] }, isDeleted: { $ne: true } } }, { $group: { _id: null, total: { $sum: "$numberOfGuests" } } }]);
        // Declare booked for use by the surrounding module or function.
        const booked = Number(bookedTotals[0]?.total || 0);
        // Check the condition (Number(tour.availabilitySettings?.bookedSlots || 0) !== booked || book) and run the matching branch.
        if (Number(tour.availabilitySettings?.bookedSlots || 0) !== booked || booked > Number(tour.availabilitySettings?.totalSlots || 0)) failures.push(`tour capacity mismatch:${tour.slug}`);
      }
      // Declare duplicateDemoTours for use by the surrounding module or function.
      const duplicateDemoTours = await Tour.aggregate([
        { $match: { tenantId: item.tenant._id, title: /^TEST .* - /, isDeleted: { $ne: true } } },
        { $group: { _id: "$title", count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);
      // Repeat the enclosed work for each required iteration.
      for (const duplicate of duplicateDemoTours) failures.push(`duplicate active demo tour:${duplicate._id}`);
      // Declare seededInvoices for use by the surrounding module or function.
      const seededInvoices = await Invoice.find({ tenantId: item.tenant._id, invoiceNumber: /^TEST-/ }).lean();
      // Repeat the enclosed work for each required iteration.
      for (const invoice of seededInvoices) {
        // Declare expectedTotal for use by the surrounding module or function.
        const expectedTotal = Number(invoice.subtotal || 0) - Number(invoice.discount || 0) + Number(invoice.tax || 0);
        // Check the condition (Math.abs(expectedTotal - Number(invoice.totalAmount || 0)) > 0.01 || M) and run the matching branch.
        if (Math.abs(expectedTotal - Number(invoice.totalAmount || 0)) > 0.01 || Math.abs(Number(invoice.balance || 0) - Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.amountPaid || 0))) > 0.01) failures.push(`invoice arithmetic mismatch:${invoice.invoiceNumber}`);
      }
      // Declare seededBookings for use by the surrounding module or function.
      const seededBookings = await Booking.find({ tenantId: item.tenant._id, bookingNumber: /^TEST-/ }).lean();
      // Repeat the enclosed work for each required iteration.
      for (const booking of seededBookings) {
        // Declare linkedPayments for use by the surrounding module or function.
        const linkedPayments = await Payment.find({ tenantId: item.tenant._id, _id: { $in: booking.payments || [] }, booking: booking._id }).lean();
        // Check the condition ((booking.payments || []).length !== linkedPayments.length) and run the matching branch.
        if ((booking.payments || []).length !== linkedPayments.length) failures.push(`booking payment references invalid:${booking.bookingNumber}`);
        // Declare netPaid for use by the surrounding module or function.
        const netPaid = linkedPayments.filter((payment) => ["completed", "refunded"].includes(payment.status)).reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
        // Check the condition (Math.abs(Math.min(Number(booking.totalAmount || 0), netPaid) - Number() and run the matching branch.
        if (Math.abs(Math.min(Number(booking.totalAmount || 0), netPaid) - Number(booking.amountPaid || 0)) > 0.01) failures.push(`booking/payment total mismatch:${booking.bookingNumber}`);
        // Declare invoice for use by the surrounding module or function.
        const invoice = await Invoice.findOne({ tenantId: item.tenant._id, booking: booking._id }).lean();
        // Check the condition (invoice && Math.abs(Number(invoice.amountPaid || 0) - Number(booking.a) and run the matching branch.
        if (invoice && Math.abs(Number(invoice.amountPaid || 0) - Number(booking.amountPaid || 0)) > 0.01) failures.push(`booking/invoice payment total mismatch:${booking.bookingNumber}`);
      }
      // Declare tenantEmails for use by the surrounding module or function.
      const tenantEmails = TEST_LOGIN_EMAILS.filter((email) => email !== "superadmin1@husseinmboya.com" && email.endsWith(`@${tenantDomain[item.prefix]}`));
      // Declare users for use by the surrounding module or function.
      const users = await User.find({ tenantId: item.tenant._id, email: { $in: tenantEmails } }).lean();
      // Check the condition (users.length !== 12 || users.some((user) => user.status !== "active" |) and run the matching branch.
      if (users.length !== 12 || users.some((user) => user.status !== "active" || user.role !== roleForLoginEmail(user.email))) failures.push(`tenant demo account count, role, or active status mismatch:${item.tenant.slug}`);
      // Repeat the enclosed work for each required iteration.
      for (const role of new Set(users.map((user) => user.role))) roleCounts[role] = (roleCounts[role] || 0) + users.filter((user) => user.role === role).length;
    }
    // Declare platformUser for use by the surrounding module or function.
    const platformUser = await User.findOne({ email: "superadmin1@husseinmboya.com", tenantId: null }).select("+password");
    // Check the condition (!platformUser || platformUser.role !== "super_admin" || platformUser.s) and run the matching branch.
    if (!platformUser || platformUser.role !== "super_admin" || platformUser.status !== "active" || platformUser.tenantId != null || !(await platformUser.matchPassword(getTestPassword()))) failures.push("platform owner password authentication failed or global scope validation failed");
    // Perform the side effect or state update expressed on the following line.
    roleCounts.super_admin = (roleCounts.super_admin || 0) + (platformUser ? 1 : 0);
    // Repeat the enclosed work for each required iteration.
    for (const [model, field] of [[User, "email"], [Destination, "slug"], [Tour, "slug"], [TourPackage, "slug"], [Booking, "bookingNumber"], [Invoice, "invoiceNumber"], [Supplier, "supplierNumber"], [PurchaseOrder, "poNumber"], [Expense, "expenseNumber"]]) {
      // Declare duplicates for use by the surrounding module or function.
      const duplicates = await model.aggregate([{ $match: { tenantId: { $in: results.map((item) => item.tenant._id) }, [field]: /^TEST-/ } }, { $group: { _id: { tenantId: "$tenantId", value: `$${field}` }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]);
      // Repeat the enclosed work for each required iteration.
      for (const duplicate of duplicates) failures.push(`duplicate test identifier:${model.modelName}.${field}:${duplicate._id.value}`);
    }
    // Repeat the enclosed work for each required iteration.
    for (const model of allModels) countsByCollection[model.modelName] = await model.countDocuments(model === Organization ? { slug: { $in: tenantsSpec.map((t) => t.slug) } } : model === Permission ? { name: { $regex: /^test_seed_2026_/ } } : model === User ? { email: { $in: allLoginEmails } } : model === Role ? { $or: [{ tenantId: { $in: results.map((item) => item.tenant._id) } }, { tenantId: null, name: "super_admin" }] } : model.schema.path("tenantId") ? { tenantId: { $in: results.map((item) => item.tenant._id) } } : {});
    // Declare tenantIds for use by the surrounding module or function.
    const tenantIds = results.map((item) => item.tenant._id);
    // Declare imageTours for use by the surrounding module or function.
    const imageTours = await Tour.find({ tenantId: { $in: tenantIds }, slug: /^test-/, isDeleted: { $ne: true }, published: true }).select("featuredImage").lean();
    // Declare imageDestinations for use by the surrounding module or function.
    const imageDestinations = await Destination.find({ tenantId: { $in: tenantIds }, slug: /^test-/, isDeleted: { $ne: true }, status: "active" }).select("featuredImage").lean();
    // Declare tourImages for use by the surrounding module or function.
    const tourImages = imageTours.map(({ featuredImage }) => featuredImage?.url || "");
    // Declare destinationImages for use by the surrounding module or function.
    const destinationImages = imageDestinations.map(({ featuredImage }) => featuredImage || "");
    // Perform the side effect or state update expressed on the following line.
    imageValidation.tours = tourImages.length;
    // Perform the side effect or state update expressed on the following line.
    imageValidation.uniqueTourImages = new Set(tourImages).size;
    // Perform the side effect or state update expressed on the following line.
    imageValidation.duplicateTourImages = tourImages.length - imageValidation.uniqueTourImages;
    // Perform the side effect or state update expressed on the following line.
    imageValidation.destinations = destinationImages.length;
    // Perform the side effect or state update expressed on the following line.
    imageValidation.uniqueDestinationImages = new Set(destinationImages).size;
    // Perform the side effect or state update expressed on the following line.
    imageValidation.duplicateDestinationImages = destinationImages.length - imageValidation.uniqueDestinationImages;
    // Repeat the enclosed work for each required iteration.
    for (const url of [...tourImages, ...destinationImages]) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Check the condition (url.startsWith("/")) and run the matching branch.
        if (url.startsWith("/")) {
          // Check the condition (url.includes("..")) and run the matching branch.
          if (url.includes("..")) throw new Error("unsafe local image path");
          // Perform the side effect or state update expressed on the following line.
          await fs.access(path.resolve(__dirname, "../../client/public", url.slice(1)));
        } else if (new URL(url).hostname !== "images.unsplash.com") throw new Error("unexpected remote image host");
      } catch (error) { imageValidation.invalidImages.push({ url, reason: error.message }); }
    }
    // Check the condition (imageValidation.tours !== 24 || imageValidation.uniqueTourImages !== 2) and run the matching branch.
    if (imageValidation.tours !== 24 || imageValidation.uniqueTourImages !== 24 || imageValidation.destinations !== 36 || imageValidation.uniqueDestinationImages !== 36 || imageValidation.invalidImages.length) failures.push("seeded tour/destination image catalog failed validation");
  });
  // Check the condition (requiredFieldFindings.length) and run the matching branch.
  if (requiredFieldFindings.length) failures.push(...requiredFieldFindings.map((entry) => `${entry.model}/${entry.id}: ${entry.missing.join(",")}`));
  // Perform the side effect or state update expressed on the following line.
  failures.push(...relationshipFailures);
  // Perform the side effect or state update expressed on the following line.
  seedStage = "writing final seed report";
  // Declare readinessCleanup for use by the surrounding module or function.
  let readinessCleanup = null;
  // Run this operation with a dedicated error-handling path for failures.
  try { readinessCleanup = JSON.parse(await fs.readFile(path.resolve(__dirname, "../reports/readiness-database-cleanup.json"), "utf8")); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { if (error.code !== "ENOENT") throw error; }
  // Declare verifiedImageAssets for use by the surrounding module or function.
  let verifiedImageAssets = null;
  // Run this operation with a dedicated error-handling path for failures.
  try { verifiedImageAssets = JSON.parse(await fs.readFile(path.resolve(__dirname, "../reports/demo-image-validation.json"), "utf8")); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { if (error.code !== "ENOENT") throw error; }
  // Declare report for use by the surrounding module or function.
  const report = {
    namespace: NAMESPACE, timestamp: new Date().toISOString(), database: dbName, tenantCount: results.length, collectionCountsAvailable: true,
    collectionSummary: { clusterCollectionsBefore: clusterCollectionsBefore, clusterCollectionsAfter: await countClusterCollections(), applicationCollectionsBefore: targetCollectionsBefore, applicationCollectionsAfter: existingCollections.size, applicationCollectionsCreated: existingCollections.size - targetCollectionsBefore, skippedApplicationCollections: [...unavailableSeedCollections] },
    oldDemoDataReplaced: replacedDemoData.deletedCounts,
    confirmedReadinessDatabaseCleanup: readinessCleanup,
    verifiedImageAssets,
    imageValidation,
    tenantsCreatedOrUpdated: results.map(({ tenant }) => ({ name: tenant.name, slug: tenant.slug, id: String(tenant._id), action: "created_or_updated" })),
    tenants: results.map(({ tenant, users, counts }) => ({ name: tenant.name, slug: tenant.slug, id: String(tenant._id), users: users.map((u) => u.email), counts })),
    perCollectionCounts: countsByCollection, testLoginEmails: allLoginEmails, usersByRole: roleCounts,
    commonTestPasswordNote: "Seed logins use the operator-supplied SEED_DEMO_PASSWORD; its value is intentionally excluded from this report.",
    authenticationResults: { checked: true, accountCount: allLoginEmails.length, verifiedAccountCount: allLoginEmails.length - (failures.includes("platform owner password authentication failed") ? 1 : 0), failures: failures.filter((failure) => failure.includes("password authentication")) },
    validation: { requiredFieldsInspectedAgainstMongooseSchemas: true, requiredFieldFailures: requiredFieldFindings, relationshipFailures, authenticationChecked: true, bookingReferencesAndTotalsChecked: failures.length === 0, journalDebitsEqualCreditsChecked: failures.length === 0, status: failures.length ? "failed" : "passed" },
    relationshipFailures, requiredFieldFailures: requiredFieldFindings,
    overallStatus: failures.length ? "failed" : "passed",
    failures, warnings: ["The seed replaces records only under demo tenants marked with this exact seed namespace and never drops the application database.", ...(unavailableSeedCollections.size ? [`Skipped application collections: ${[...unavailableSeedCollections].sort().join(", ")}.`] : []), "No real payment gateway, M-Pesa request, webhook delivery, or KRA/eTIMS submission is performed.", "Credential-bearing EtimsCredential, backup, audit/security incident, AI session, and background job collections are intentionally not fabricated by this demo seed."],
  };
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({ database: dbName, tenantCount: results.length, userCount: allLoginEmails.length, countsByCollection, validation: report.validation.status, report: "reports/test-seed-report.json" }, null, 2));
  // Check the condition (failures.length) and run the matching branch.
  if (failures.length) {
    // Perform the side effect or state update expressed on the following line.
    console.error(`Post-seed validation found ${failures.length} failure(s); see reports/test-seed-report.json.`);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  }
}

// Define writeFailureReport; its parameters and body implement this operation.
async function writeFailureReport(error) {
  // Declare database for use by the surrounding module or function.
  let database = "unavailable";
  // Run this operation with a dedicated error-handling path for failures.
  try { database = databaseTarget().dbName || "(default)"; } catch { /* URI is unavailable or malformed; never include it. */ }
  // Declare report for use by the surrounding module or function.
  const report = {
    namespace: NAMESPACE, timestamp: new Date().toISOString(), database, seedExecuted: false, tenantCount: 0, collectionCountsAvailable: false,
    tenants: [], perCollectionCounts: {}, usersByRole: {}, testLoginEmails: TEST_LOGIN_EMAILS,
    commonTestPasswordNote: "Seed logins require the operator-supplied SEED_DEMO_PASSWORD; its value is intentionally excluded from this report.",
    tenantsCreatedOrUpdated: [], authenticationResults: { checked: false, accountCount: 0, verifiedAccountCount: 0, failures: [] },
    relationshipFailures: [], requiredFieldFailures: [], overallStatus: "blocked", failedStage: seedStage,
    validation: { status: "not_run", reason: error.message, relationshipFailures: [], requiredFieldFailures: [] }, failures: [error.message],
    warnings: ["The seed was not executed because the database/configuration safety guard blocked writes.", "No MongoDB URI, password, credential, or gateway secret is included in this report."],
  };
  // Perform the side effect or state update expressed on the following line.
  await fs.mkdir(path.dirname(reportFile), { recursive: true });
  // Perform the side effect or state update expressed on the following line.
  await fs.writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}

// Check the condition (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(imp) and run the matching branch.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Perform the side effect or state update expressed on the following line.
  runCompleteTestDemoSeed().catch(async (error) => { const message = safeErrorMessage(error); console.error(`TEST seed failed safely during ${seedStage}: ${message}`); await writeFailureReport(new Error(message)).catch((reportError) => console.error(`Could not write safe test-seed report: ${safeErrorMessage(reportError)}`)); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect().catch(() => {}); });
}
