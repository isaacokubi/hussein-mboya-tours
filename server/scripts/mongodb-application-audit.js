/**
 * Purpose: mongodb application audit operational script. Main declarations: fail, pass, tenantLabel, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import "dotenv/config";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/AccommodationInventory.js so this module can use its exported dependencies.
import AccommodationInventory from "../models/AccommodationInventory.js";
// Load ../models/TravelServiceRequest.js so this module can use its exported dependencies.
import TravelServiceRequest from "../models/TravelServiceRequest.js";
// Load ../models/WebsiteIntegrationEvent.js so this module can use its exported dependencies.
import WebsiteIntegrationEvent from "../models/WebsiteIntegrationEvent.js";
// Load ../models/PaymentGatewayConfig.js so this module can use its exported dependencies.
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
// Load ../models/HotelRoomType.js so this module can use its exported dependencies.
import HotelRoomType from "../models/HotelRoomType.js";
// Load ../models/HospitalityRatePlan.js so this module can use its exported dependencies.
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
// Load ../models/HotelBooking.js so this module can use its exported dependencies.
import HotelBooking from "../models/HotelBooking.js";
// Load ../models/AirportTransferBooking.js so this module can use its exported dependencies.
import AirportTransferBooking from "../models/AirportTransferBooking.js";

// Declare uri for use by the surrounding module or function.
const uri = process.env.MONGODB_URI;

// Check the condition (!uri) and run the matching branch.
if (!uri) {
  // Stop the current operation by raising a new Error instance.
  throw new Error("MONGODB_URI is required.");
}

// Declare requiredModels for use by the surrounding module or function.
const requiredModels = [
  {
    key: "accommodationInventory",
    label: "Accommodation inventory",
    model: AccommodationInventory,
    requireTenantData: true,
  },
  {
    key: "travelServiceRequests",
    label: "Travel service requests",
    model: TravelServiceRequest,
    requireTenantData: true,
  },
  {
    key: "websiteIntegrationEvents",
    label: "Website integration events",
    model: WebsiteIntegrationEvent,
    requireTenantData: true,
  },
  {
    key: "paymentGatewayConfigs",
    label: "Payment gateway configurations",
    model: PaymentGatewayConfig,
    requireTenantData: true,
  },
  {
    key: "hotelRoomTypes",
    label: "Hotel room types",
    model: HotelRoomType,
    requireTenantData: true,
  },
  {
    key: "hospitalityRatePlans",
    label: "Hospitality rate plans",
    model: HospitalityRatePlan,
    requireTenantData: true,
  },
  {
    key: "hotelBookings",
    label: "Hotel reservations",
    model: HotelBooking,
    requireTenantData: true,
  },
  {
    key: "airportTransferBookings",
    label: "Airport transfer reservations",
    model: AirportTransferBooking,
    requireTenantData: true,
  },
];

// Declare failures for use by the surrounding module or function.
const failures = [];

// Define fail; its parameters and body implement this operation.
function fail(message) {
  // Perform the side effect or state update expressed on the following line.
  failures.push(message);
  // Perform the side effect or state update expressed on the following line.
  console.error(`✗ ${message}`);
}

// Define pass; its parameters and body implement this operation.
function pass(message) {
  // Perform the side effect or state update expressed on the following line.
  console.log(`✓ ${message}`);
}

// Define tenantLabel; its parameters and body implement this operation.
function tenantLabel(tenant) {
  // Return the expression shown below to the caller.
  return tenant.name || tenant.slug || String(tenant._id);
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(uri);

  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("MONGODB APPLICATION COLLECTION AUDIT");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log(`Database: ${mongoose.connection.name}`);

  // Declare physicalCollections for use by the surrounding module or function.
  const physicalCollections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  // Declare physicalNames for use by the surrounding module or function.
  const physicalNames = new Set(
    physicalCollections.map((collection) => collection.name)
  );

  // Perform the side effect or state update expressed on the following line.
  console.log(`Physical collections discovered: ${physicalNames.size}`);
  // Perform the side effect or state update expressed on the following line.
  console.log("");

  /*
   * ============================================================
   * ORGANIZATION / TENANT SOURCE
   * ============================================================
   *
   * This application uses Organization as the tenant model.
   * Do NOT query a guessed "tenants" collection.
   */
  // Declare organizationCollection for use by the surrounding module or function.
  const organizationCollection = Organization.collection.name;

  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT MODEL → PHYSICAL COLLECTION");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");
  // Perform the side effect or state update expressed on the following line.
  console.log(
    `${Organization.modelName.padEnd(30)} → ${organizationCollection}`
  );

  // Check the condition (!physicalNames.has(organizationCollection)) and run the matching branch.
  if (!physicalNames.has(organizationCollection)) {
    // Perform the side effect or state update expressed on the following line.
    fail(
      `Tenant source collection "${organizationCollection}" does not exist.`
    );
  } else {
    // Perform the side effect or state update expressed on the following line.
    pass(
      `Tenant source collection "${organizationCollection}" exists.`
    );
  }

  // Declare tenants for use by the surrounding module or function.
  const tenants = await Organization.find({})
    .select("_id name slug status isActive")
    .sort({ name: 1 })
    .lean();

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT DATA COVERAGE");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Check the condition (!tenants.length) and run the matching branch.
  if (!tenants.length) {
    // Perform the side effect or state update expressed on the following line.
    fail(
      `No organizations exist in the application tenant collection "${organizationCollection}".`
    );
  } else {
    // Perform the side effect or state update expressed on the following line.
    pass(`Found ${tenants.length} organization/tenant records.`);
  }

  // Declare activeTenants for use by the surrounding module or function.
  const activeTenants = tenants.filter((tenant) => {
    // Check the condition (tenant.isActive === false) and run the matching branch.
    if (tenant.isActive === false) return false;

    // Check the condition (typeof tenant.status === "string" && ["inactive", "disabled", "deleted) and run the matching branch.
    if (
      typeof tenant.status === "string" &&
      ["inactive", "disabled", "deleted"].includes(
        tenant.status.toLowerCase()
      )
    ) {
      // Return the expression shown below to the caller.
      return false;
    }

    // Return the expression shown below to the caller.
    return true;
  });

  // Perform the side effect or state update expressed on the following line.
  console.log(`Active tenants: ${activeTenants.length}`);

  // Check the condition (tenants.length && activeTenants.length === 0) and run the matching branch.
  if (tenants.length && activeTenants.length === 0) {
    // Perform the side effect or state update expressed on the following line.
    fail("Organizations exist, but none are currently active.");
  }

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("MODEL → PHYSICAL COLLECTION MAPPING");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Repeat the enclosed work for each required iteration.
  for (const item of requiredModels) {
    // Declare modelName for use by the surrounding module or function.
    const modelName = item.model.modelName;
    // Declare collectionName for use by the surrounding module or function.
    const collectionName = item.model.collection.name;

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `${modelName.padEnd(30)} → ${collectionName}`
    );

    // Check the condition (!physicalNames.has(collectionName)) and run the matching branch.
    if (!physicalNames.has(collectionName)) {
      // Perform the side effect or state update expressed on the following line.
      fail(
        `${item.label}: required collection "${collectionName}" does not exist.`
      );
    } else {
      // Perform the side effect or state update expressed on the following line.
      pass(
        `${item.label}: collection "${collectionName}" exists.`
      );
    }
  }

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("COLLECTION COUNTS");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Repeat the enclosed work for each required iteration.
  for (const item of requiredModels) {
    // Declare collectionName for use by the surrounding module or function.
    const collectionName = item.model.collection.name;

    // Check the condition (!physicalNames.has(collectionName)) and run the matching branch.
    if (!physicalNames.has(collectionName)) {
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }

    // Declare count for use by the surrounding module or function.
    const count = await item.model.collection.countDocuments({});

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `${item.label.padEnd(38)} ${String(count).padStart(6)} docs`
    );

    // Check the condition (count === 0) and run the matching branch.
    if (count === 0) {
      // Perform the side effect or state update expressed on the following line.
      fail(
        `${item.label}: collection "${collectionName}" exists but contains zero records.`
      );
    } else {
      // Perform the side effect or state update expressed on the following line.
      pass(`${item.label}: populated.`);
    }
  }

  /*
   * ============================================================
   * TENANT COVERAGE
   * ============================================================
   */

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("PER-TENANT OPERATIONAL COVERAGE");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Repeat the enclosed work for each required iteration.
  for (const tenant of activeTenants) {
    // Perform the side effect or state update expressed on the following line.
    console.log("");
    // Perform the side effect or state update expressed on the following line.
    console.log(`Tenant: ${tenantLabel(tenant)}`);
    // Perform the side effect or state update expressed on the following line.
    console.log(`ID: ${tenant._id}`);

    // Repeat the enclosed work for each required iteration.
    for (const item of requiredModels) {
      // Declare collectionName for use by the surrounding module or function.
      const collectionName = item.model.collection.name;

      // Check the condition (!physicalNames.has(collectionName)) and run the matching branch.
      if (!physicalNames.has(collectionName)) {
        // Skip the remainder of this iteration and continue with the next one.
        continue;
      }

      // Declare count for use by the surrounding module or function.
      const count = await item.model.collection.countDocuments({
        tenantId: tenant._id,
      });

      // Perform the side effect or state update expressed on the following line.
      console.log(
        `  ${item.label.padEnd(36)} ${String(count).padStart(5)}`
      );

      // Check the condition (item.requireTenantData && count === 0) and run the matching branch.
      if (item.requireTenantData && count === 0) {
        // Perform the side effect or state update expressed on the following line.
        fail(
          `Tenant "${tenantLabel(tenant)}" has no ${item.label}.`
        );
      }
    }
  }

  /*
   * ============================================================
   * TENANT ISOLATION
   * ============================================================
   */

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT ISOLATION SANITY CHECK");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Declare knownTenantIds for use by the surrounding module or function.
  const knownTenantIds = new Set(
    tenants.map((tenant) => String(tenant._id))
  );

  // Repeat the enclosed work for each required iteration.
  for (const item of requiredModels) {
    // Declare collectionName for use by the surrounding module or function.
    const collectionName = item.model.collection.name;

    // Check the condition (!physicalNames.has(collectionName)) and run the matching branch.
    if (!physicalNames.has(collectionName)) {
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }

    // Declare tenantIds for use by the surrounding module or function.
    const tenantIds = await item.model.collection.distinct("tenantId", {
      tenantId: {
        $exists: true,
        $ne: null,
      },
    });

    // Declare orphanTenantIds for use by the surrounding module or function.
    const orphanTenantIds = tenantIds
      .map((id) => String(id))
      .filter((id) => !knownTenantIds.has(id));

    // Check the condition (orphanTenantIds.length) and run the matching branch.
    if (orphanTenantIds.length) {
      // Perform the side effect or state update expressed on the following line.
      fail(
        `${item.label}: ${orphanTenantIds.length} tenantId value(s) do not correspond to an existing Organization.`
      );

      // Repeat the enclosed work for each required iteration.
      for (const orphanId of orphanTenantIds) {
        // Perform the side effect or state update expressed on the following line.
        console.error(`    orphan tenantId: ${orphanId}`);
      }
    } else {
      // Perform the side effect or state update expressed on the following line.
      pass(`${item.label}: no orphan tenantId values.`);
    }
  }

  /*
   * ============================================================
   * CROSS-CHECK TENANT IDS
   * ============================================================
   */

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT ID CROSS-CHECK");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Repeat the enclosed work for each required iteration.
  for (const tenant of tenants) {
    // Declare id for use by the surrounding module or function.
    const id = String(tenant._id);

    // Declare populatedCollections for use by the surrounding module or function.
    let populatedCollections = 0;

    // Repeat the enclosed work for each required iteration.
    for (const item of requiredModels) {
      // Declare collectionName for use by the surrounding module or function.
      const collectionName = item.model.collection.name;

      // Check the condition (!physicalNames.has(collectionName)) and run the matching branch.
      if (!physicalNames.has(collectionName)) {
        // Skip the remainder of this iteration and continue with the next one.
        continue;
      }

      // Declare count for use by the surrounding module or function.
      const count = await item.model.collection.countDocuments({
        tenantId: tenant._id,
      });

      // Check the condition (count > 0) and run the matching branch.
      if (count > 0) {
        // Perform the side effect or state update expressed on the following line.
        populatedCollections++;
      }
    }

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `${tenantLabel(tenant).padEnd(35)} ${populatedCollections}/${requiredModels.length} operational collections`
    );

    // Check the condition (populatedCollections === 0) and run the matching branch.
    if (populatedCollections === 0) {
      // Perform the side effect or state update expressed on the following line.
      fail(
        `Tenant "${tenantLabel(tenant)}" has no operational records in the audited collections.`
      );
    }
  }

  /*
   * ============================================================
   * PLATFORM OWNER
   * ============================================================
   */

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("PLATFORM OWNER CHECK");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Declare ownerCount for use by the surrounding module or function.
  const ownerCount = await db.collection("users").countDocuments({
    role: {
      $in: [
        "super_admin",
        "superadmin",
      ],
    },
  });

  // Perform the side effect or state update expressed on the following line.
  console.log(`Platform owners: ${ownerCount}`);

  // Check the condition (ownerCount < 1) and run the matching branch.
  if (ownerCount < 1) {
    // Perform the side effect or state update expressed on the following line.
    fail("No platform super-admin/superadmin account exists.");
  } else {
    // Perform the side effect or state update expressed on the following line.
    pass("Platform owner account exists.");
  }

  /*
   * ============================================================
   * UNEXPECTED LEGACY COLLECTION CHECK
   * ============================================================
   *
   * These are NOT required application collections.
   * They are only reported if they happen to exist.
   */
  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("LEGACY / SIMILAR COLLECTION CHECK");
  // Perform the side effect or state update expressed on the following line.
  console.log("------------------------------------------------------------");

  // Declare legacyNames for use by the surrounding module or function.
  const legacyNames = [
    "accommodationinventory",
    "servicerequests",
    "websiteevents",
    "paymentgateways",
    "roomtypes",
    "rateplans",
    "hotelreservations",
    "transferreservations",
  ];

  // Repeat the enclosed work for each required iteration.
  for (const name of legacyNames) {
    // Check the condition (physicalNames.has(name)) and run the matching branch.
    if (physicalNames.has(name)) {
      // Perform the side effect or state update expressed on the following line.
      console.log(
        `INFO: legacy/similarly named collection exists: ${name}`
      );
    }
  }

  /*
   * ============================================================
   * RESULT
   * ============================================================
   */

  // Perform the side effect or state update expressed on the following line.
  console.log("");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("AUDIT RESULT");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");

  // Check the condition (failures.length) and run the matching branch.
  if (failures.length) {
    // Perform the side effect or state update expressed on the following line.
    console.error(
      `FAILED: ${failures.length} issue(s) detected.`
    );

    // Repeat the enclosed work for each required iteration.
    for (const failure of failures) {
      // Perform the side effect or state update expressed on the following line.
      console.error(`  - ${failure}`);
    }

    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  } else {
    // Perform the side effect or state update expressed on the following line.
    console.log(
      "PASSED: application tenant source, required models, physical collections, tenant coverage, tenant isolation, and owner data are consistent."
    );
  }
}

// Perform the side effect or state update expressed on the following line.
main()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("");
    // Perform the side effect or state update expressed on the following line.
    console.error("MONGODB APPLICATION AUDIT FAILED:");
    // Perform the side effect or state update expressed on the following line.
    console.error(error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect().catch(() => {});
  });
