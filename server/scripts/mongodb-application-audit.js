import "dotenv/config";
import mongoose from "mongoose";

import Organization from "../models/Organization.js";
import AccommodationInventory from "../models/AccommodationInventory.js";
import TravelServiceRequest from "../models/TravelServiceRequest.js";
import WebsiteIntegrationEvent from "../models/WebsiteIntegrationEvent.js";
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
import HotelRoomType from "../models/HotelRoomType.js";
import HospitalityRatePlan from "../models/HospitalityRatePlan.js";
import HotelBooking from "../models/HotelBooking.js";
import AirportTransferBooking from "../models/AirportTransferBooking.js";

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  throw new Error("MONGODB_URI/MONGO_URI is required.");
}

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

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`✗ ${message}`);
}

function pass(message) {
  console.log(`✓ ${message}`);
}

function tenantLabel(tenant) {
  return tenant.name || tenant.slug || String(tenant._id);
}

async function main() {
  await mongoose.connect(uri);

  const db = mongoose.connection.db;

  console.log("");
  console.log("============================================================");
  console.log("MONGODB APPLICATION COLLECTION AUDIT");
  console.log("============================================================");
  console.log(`Database: ${mongoose.connection.name}`);

  const physicalCollections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const physicalNames = new Set(
    physicalCollections.map((collection) => collection.name)
  );

  console.log(`Physical collections discovered: ${physicalNames.size}`);
  console.log("");

  /*
   * ============================================================
   * ORGANIZATION / TENANT SOURCE
   * ============================================================
   *
   * This application uses Organization as the tenant model.
   * Do NOT query a guessed "tenants" collection.
   */
  const organizationCollection = Organization.collection.name;

  console.log("TENANT MODEL → PHYSICAL COLLECTION");
  console.log("------------------------------------------------------------");
  console.log(
    `${Organization.modelName.padEnd(30)} → ${organizationCollection}`
  );

  if (!physicalNames.has(organizationCollection)) {
    fail(
      `Tenant source collection "${organizationCollection}" does not exist.`
    );
  } else {
    pass(
      `Tenant source collection "${organizationCollection}" exists.`
    );
  }

  const tenants = await Organization.find({})
    .select("_id name slug status isActive")
    .sort({ name: 1 })
    .lean();

  console.log("");
  console.log("TENANT DATA COVERAGE");
  console.log("------------------------------------------------------------");

  if (!tenants.length) {
    fail(
      `No organizations exist in the application tenant collection "${organizationCollection}".`
    );
  } else {
    pass(`Found ${tenants.length} organization/tenant records.`);
  }

  const activeTenants = tenants.filter((tenant) => {
    if (tenant.isActive === false) return false;

    if (
      typeof tenant.status === "string" &&
      ["inactive", "disabled", "deleted"].includes(
        tenant.status.toLowerCase()
      )
    ) {
      return false;
    }

    return true;
  });

  console.log(`Active tenants: ${activeTenants.length}`);

  if (tenants.length && activeTenants.length === 0) {
    fail("Organizations exist, but none are currently active.");
  }

  console.log("");
  console.log("MODEL → PHYSICAL COLLECTION MAPPING");
  console.log("------------------------------------------------------------");

  for (const item of requiredModels) {
    const modelName = item.model.modelName;
    const collectionName = item.model.collection.name;

    console.log(
      `${modelName.padEnd(30)} → ${collectionName}`
    );

    if (!physicalNames.has(collectionName)) {
      fail(
        `${item.label}: required collection "${collectionName}" does not exist.`
      );
    } else {
      pass(
        `${item.label}: collection "${collectionName}" exists.`
      );
    }
  }

  console.log("");
  console.log("COLLECTION COUNTS");
  console.log("------------------------------------------------------------");

  for (const item of requiredModels) {
    const collectionName = item.model.collection.name;

    if (!physicalNames.has(collectionName)) {
      continue;
    }

    const count = await item.model.collection.countDocuments({});

    console.log(
      `${item.label.padEnd(38)} ${String(count).padStart(6)} docs`
    );

    if (count === 0) {
      fail(
        `${item.label}: collection "${collectionName}" exists but contains zero records.`
      );
    } else {
      pass(`${item.label}: populated.`);
    }
  }

  /*
   * ============================================================
   * TENANT COVERAGE
   * ============================================================
   */

  console.log("");
  console.log("PER-TENANT OPERATIONAL COVERAGE");
  console.log("------------------------------------------------------------");

  for (const tenant of activeTenants) {
    console.log("");
    console.log(`Tenant: ${tenantLabel(tenant)}`);
    console.log(`ID: ${tenant._id}`);

    for (const item of requiredModels) {
      const collectionName = item.model.collection.name;

      if (!physicalNames.has(collectionName)) {
        continue;
      }

      const count = await item.model.collection.countDocuments({
        tenantId: tenant._id,
      });

      console.log(
        `  ${item.label.padEnd(36)} ${String(count).padStart(5)}`
      );

      if (item.requireTenantData && count === 0) {
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

  console.log("");
  console.log("TENANT ISOLATION SANITY CHECK");
  console.log("------------------------------------------------------------");

  const knownTenantIds = new Set(
    tenants.map((tenant) => String(tenant._id))
  );

  for (const item of requiredModels) {
    const collectionName = item.model.collection.name;

    if (!physicalNames.has(collectionName)) {
      continue;
    }

    const tenantIds = await item.model.collection.distinct("tenantId", {
      tenantId: {
        $exists: true,
        $ne: null,
      },
    });

    const orphanTenantIds = tenantIds
      .map((id) => String(id))
      .filter((id) => !knownTenantIds.has(id));

    if (orphanTenantIds.length) {
      fail(
        `${item.label}: ${orphanTenantIds.length} tenantId value(s) do not correspond to an existing Organization.`
      );

      for (const orphanId of orphanTenantIds) {
        console.error(`    orphan tenantId: ${orphanId}`);
      }
    } else {
      pass(`${item.label}: no orphan tenantId values.`);
    }
  }

  /*
   * ============================================================
   * CROSS-CHECK TENANT IDS
   * ============================================================
   */

  console.log("");
  console.log("TENANT ID CROSS-CHECK");
  console.log("------------------------------------------------------------");

  for (const tenant of tenants) {
    const id = String(tenant._id);

    let populatedCollections = 0;

    for (const item of requiredModels) {
      const collectionName = item.model.collection.name;

      if (!physicalNames.has(collectionName)) {
        continue;
      }

      const count = await item.model.collection.countDocuments({
        tenantId: tenant._id,
      });

      if (count > 0) {
        populatedCollections++;
      }
    }

    console.log(
      `${tenantLabel(tenant).padEnd(35)} ${populatedCollections}/${requiredModels.length} operational collections`
    );

    if (populatedCollections === 0) {
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

  console.log("");
  console.log("PLATFORM OWNER CHECK");
  console.log("------------------------------------------------------------");

  const ownerCount = await db.collection("users").countDocuments({
    role: {
      $in: [
        "super_admin",
        "superadmin",
      ],
    },
  });

  console.log(`Platform owners: ${ownerCount}`);

  if (ownerCount < 1) {
    fail("No platform super-admin/superadmin account exists.");
  } else {
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
  console.log("");
  console.log("LEGACY / SIMILAR COLLECTION CHECK");
  console.log("------------------------------------------------------------");

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

  for (const name of legacyNames) {
    if (physicalNames.has(name)) {
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

  console.log("");
  console.log("============================================================");
  console.log("AUDIT RESULT");
  console.log("============================================================");

  if (failures.length) {
    console.error(
      `FAILED: ${failures.length} issue(s) detected.`
    );

    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }

    process.exitCode = 1;
  } else {
    console.log(
      "PASSED: application tenant source, required models, physical collections, tenant coverage, tenant isolation, and owner data are consistent."
    );
  }
}

main()
  .catch((error) => {
    console.error("");
    console.error("MONGODB APPLICATION AUDIT FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
