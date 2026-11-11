/**
 * Purpose: ensure Dashboard Master Data database seed module. Main declarations: main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/Supplier.js so this module can use its exported dependencies.
import Supplier from "../models/Supplier.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare supplierTemplates for use by the surrounding module or function.
const supplierTemplates = [
  { category: "transport", legalName: "Global Demo Transport Services", tradingName: "Global Demo Transport", paymentTermsDays: 14 },
  { category: "accommodation", legalName: "Global Demo Safari Lodges", tradingName: "Global Demo Lodges", paymentTermsDays: 30 },
  { category: "guide", legalName: "Global Demo Guide Services", tradingName: "Global Demo Guides", paymentTermsDays: 7 },
  { category: "park", legalName: "Global Demo Park Services", tradingName: "Global Demo Parks", paymentTermsDays: 14 },
];

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
  for (const tenant of tenants) {
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ tenantId: tenant._id, role: "manager", bypass: false }, async () => {
      // All tenant-scoped reads and writes must execute inside the tenant context.
      // Declare users for use by the surrounding module or function.
      const users = await User.find({ isDeleted: { $ne: true } }).limit(100).lean();
      // Declare actor for use by the surrounding module or function.
      const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;

      // Declare suppliers for use by the surrounding module or function.
      let suppliers = await Supplier.find({ isDeleted: { $ne: true } }).lean();
      // Repeat the enclosed work for each required iteration.
      for (let i = suppliers.length; i < 2; i += 1) {
        // Declare template for use by the surrounding module or function.
        const template = supplierTemplates[i % supplierTemplates.length];
        // Declare supplier for use by the surrounding module or function.
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
        // Perform the side effect or state update expressed on the following line.
        suppliers.push(supplier.toObject());
      }
      // Perform the side effect or state update expressed on the following line.
      results.push({ tenant: tenant.name || String(tenant._id), suppliers: suppliers.length });
    });
  }

  // Perform the side effect or state update expressed on the following line.
  console.table(results);
  // Perform the side effect or state update expressed on the following line.
  console.log("Dashboard master-data preparation complete. Existing master data was preserved; only missing supplier records were added.");
}

// Perform the side effect or state update expressed on the following line.
main()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Dashboard master-data preparation failed:", error.message);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });
