import mongoose from "mongoose";
import env from "../config/env.js";
import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";

const tenantModels = [
  "AIConversation", "AITask", "Agent", "AuditLog", "Booking", "Campaign", "Commission", "Coupon",
  "CustomTourRequest", "Customer", "CustomerProfile", "DatabaseBackup", "Destination", "Gallery", "HeroSlide",
  "Invoice", "Itinerary", "Loyalty", "Media", "Notification", "Payment", "Promotion", "Quotation", "Referral",
  "Refund", "RefundAudit", "Review", "Role", "SecurityLog", "Staff", "StaffProfile", "SystemSetting",
  "SystemSettings", "Tour", "TourCategory", "TourGallery", "TourPackage", "TourReport", "User", "UserPreference",
  "Vehicle", "WalletTransaction", "Wishlist",
];

const models = await Promise.all(tenantModels.map(async (name) => {
  try { return (await import(`../models/${name}.js`)).default; } catch (error) { console.warn(`Skipping ${name}: ${error.message}`); return null; }
}));

await mongoose.connect(env.MONGODB_URI);

const existing = await Organization.findOne({ slug: "hussein-mboya-tours" });
const organization = existing || await Organization.create({
  name: process.env.DEFAULT_TENANT_NAME || "Hussein Mboya Tours",
  slug: "hussein-mboya-tours",
  country: "Kenya",
  timezone: "Africa/Nairobi",
  currency: "KES",
  status: "active",
  subscription: { plan: "business", seats: 50 },
});

console.log(`Default tenant: ${organization.name} (${organization._id})`);

await runWithTenant({ bypass: true }, async () => {
  for (const Model of models.filter(Boolean)) {
    const result = await Model.updateMany(
      { $or: [{ tenantId: { $exists: false } }, { tenantId: null }] },
      { $set: { tenantId: organization._id } },
    );
    console.log(`${Model.modelName}: assigned ${result.modifiedCount || 0} records`);
    try {
      await Model.syncIndexes();
      console.log(`${Model.modelName}: indexes synchronized`);
    } catch (error) {
      console.warn(`${Model.modelName}: index sync warning: ${error.message}`);
    }
  }
});

console.log(`\nDEFAULT_TENANT_ID=${organization._id}`);
await mongoose.disconnect();
