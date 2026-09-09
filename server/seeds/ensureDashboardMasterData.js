import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const supplierTemplates = [
  { category: "transport", legalName: "Global Demo Transport Services", tradingName: "Global Demo Transport", paymentTermsDays: 14 },
  { category: "accommodation", legalName: "Global Demo Safari Lodges", tradingName: "Global Demo Lodges", paymentTermsDays: 30 },
  { category: "guide", legalName: "Global Demo Guide Services", tradingName: "Global Demo Guides", paymentTermsDays: 7 },
  { category: "park", legalName: "Global Demo Park Services", tradingName: "Global Demo Parks", paymentTermsDays: 14 },
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);

  const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.`);

  const results = [];
  for (const tenant of tenants) {
    await runWithTenant({ tenantId: tenant._id, role: "super_admin", bypass: true }, async () => {
      // All tenant-scoped reads and writes must execute inside the tenant context.
      const users = await User.find({ isDeleted: { $ne: true } }).limit(100).lean();
      const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;

      let suppliers = await Supplier.find({ isDeleted: { $ne: true } }).lean();
      for (let i = suppliers.length; i < 2; i += 1) {
        const template = supplierTemplates[i % supplierTemplates.length];
        const supplier = await Supplier.create({
          tenantId: tenant._id,
          legalName: `${template.legalName} ${tenant.name || "Tenant"}`.slice(0, 160),
          tradingName: template.tradingName,
          category: template.category,
          vatRegistered: false,
          contacts: [{ name: "Demo Accounts", email: `accounts${i + 1}@demo.co.ke`, phone: "0712000000", role: "Accounts" }],
          address: "Kenya",
          paymentTermsDays: template.paymentTermsDays,
          status: "active",
          createdBy: actor?._id || null,
          updatedBy: actor?._id || null,
          notes: "Synthetic master data used to keep operational and financial dashboards populated. Not a real supplier.",
        });
        suppliers.push(supplier.toObject());
      }
      results.push({ tenant: tenant.name || String(tenant._id), suppliers: suppliers.length });
    });
  }

  console.table(results);
  console.log("Dashboard master-data preparation complete. Existing master data was preserved; only missing supplier records were added.");
}

main()
  .catch((error) => {
    console.error("Dashboard master-data preparation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
