import mongoose from "mongoose";
import crypto from "node:crypto";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import CorporateAccount from "../models/CorporateAccount.js";
import AccommodationInventory from "../models/AccommodationInventory.js";
import TravelServiceRequest from "../models/TravelServiceRequest.js";
import PrivacyRequest from "../models/PrivacyRequest.js";
import ComplianceRecord from "../models/ComplianceRecord.js";
import WebsiteIntegrationKey from "../models/WebsiteIntegrationKey.js";
import WebsiteIntegrationEvent from "../models/WebsiteIntegrationEvent.js";
import PaymentGatewayConfig from "../models/PaymentGatewayConfig.js";
import { runWithTenant } from "../tenancy/context.js";

dotenv.config();

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const hash = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

async function seedTenant(tenant, tenantIndex) {
  return runWithTenant({ tenantId: tenant._id, role: "super_admin", bypass: true }, async () => {
    const [users, customers, bookings] = await Promise.all([
      User.find({ isDeleted: { $ne: true } }).limit(100).lean(),
      Customer.find({ isDeleted: { $ne: true } }).limit(30).lean(),
      Booking.find({ isDeleted: { $ne: true } }).sort({ travelDate: 1 }).limit(30),
    ]);
    const actor = users.find((u) => ["admin", "manager", "super_admin", "superadmin"].includes(String(u.role || "").toLowerCase())) || users[0] || null;
    const customer = customers[tenantIndex % Math.max(customers.length, 1)] || null;

    const corporateDefinitions = [
      { suffix: "Enterprise", balance: 28000, limit: 150000, terms: "30_days", po: true },
      { suffix: "Corporate Travel", balance: 12500, limit: 100000, terms: "14_days", po: true },
    ];
    const corporates = [];
    for (let i = 0; i < corporateDefinitions.length; i += 1) {
      const d = corporateDefinitions[i];
      const account = await CorporateAccount.findOneAndUpdate(
        { tenantId: tenant._id, accountNumber: `CORP-DEMO-${tenantIndex + 1}-${i + 1}` },
        {
          $set: {
            companyName: `Kenya ${d.suffix} ${tenantIndex + 1}`,
            kraPin: `P05${tenantIndex + 1}8${i}7${tenantIndex + 1}A`,
            vatRegistered: i === 0,
            billingContacts: [{ name: "Accounts Department", email: `corp${tenantIndex + 1}${i + 1}@demo.co.ke`, phone: "0712000010", title: "Finance Manager" }],
            paymentTerms: d.terms,
            creditLimit: d.limit,
            currentBalance: d.balance,
            preferredPaymentMethod: i === 0 ? "BANK_TRANSFER" : "MPESA",
            requiresPurchaseOrder: d.po,
            status: "active",
            notes: "Synthetic corporate account for dashboard demonstration; not a real customer account.",
            createdBy: actor?._id || null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      corporates.push(account);
    }

    // Attach a portion of the seeded corporate bookings to real corporate-account records.
    for (let i = 0; i < bookings.length; i += 1) {
      if (i % 5 === 0 && corporates.length) {
        await Booking.updateOne(
          { _id: bookings[i]._id, tenantId: tenant._id },
          { $set: { corporateAccount: corporates[(i / 5) % corporates.length]._id, corporateCompanyName: corporates[(i / 5) % corporates.length].companyName } }
        );
      }
    }

    const accommodationRows = [
      ["Global Demo Nairobi Hotel", "Nairobi", "Standard Room", 24, 17, 8500],
      ["Global Demo Safari Lodge", "Maasai Mara", "Deluxe Tent", 18, 11, 14500],
      ["Global Demo Coast Resort", "Mombasa", "Ocean View", 20, 13, 12000],
    ];
    for (const [propertyName, location, roomType, totalRooms, availableRooms, nightlyRate] of accommodationRows) {
      await AccommodationInventory.updateOne(
        { tenantId: tenant._id, propertyName, roomType },
        { $set: { location, totalRooms, availableRooms, nightlyRate, currency: "KES", status: "active", notes: "Synthetic inventory for dashboard demonstration.", createdBy: actor?._id || null, updatedBy: actor?._id || null } },
        { upsert: true }
      );
    }

    // Service desk workload for transfers, accommodation, documents, manifests and incidents.
    const requestTypes = ["airport_transfer", "accommodation", "rooming_list", "travel_document", "manifest", "incident"];
    const requestStatuses = ["open", "in_progress", "awaiting_customer", "resolved", "in_progress", "open"];
    for (let i = 0; i < requestTypes.length; i += 1) {
      const booking = bookings[i % Math.max(bookings.length, 1)];
      await TravelServiceRequest.findOneAndUpdate(
        { tenantId: tenant._id, title: `DEMO-${tenantIndex + 1}-${requestTypes[i]}` },
        {
          $set: {
            booking: booking?._id,
            customer: booking?.user || customer?.user || null,
            type: requestTypes[i],
            status: requestStatuses[i],
            priority: i === 4 ? "high" : i === 5 ? "urgent" : "normal",
            description: `Synthetic ${requestTypes[i].replace(/_/g, " ")} request for operations dashboard coverage.`,
            requestedDate: daysFromNow(i - 2),
            dueDate: daysFromNow(i + 3),
            assignedTo: actor?._id || null,
            location: i % 2 ? "Nairobi" : "JKIA",
            contactPhone: booking?.contact?.phone || "0712000000",
            metadata: { demo: true, tenantIndex: tenantIndex + 1 },
            resolution: requestStatuses[i] === "resolved" ? "Synthetic request resolved for dashboard demonstration." : "",
            resolvedAt: requestStatuses[i] === "resolved" ? new Date() : null,
            createdBy: actor?._id || null,
            updatedBy: actor?._id || null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Kenya compliance workspace: populated records without falsely claiming a government submission.
    const complianceTypes = [
      ["TRA_LICENSE", "in_progress", "TRA-DEMO"],
      ["ODPC_REGISTRATION", "in_progress", "ODPC-DEMO"],
      ["PRIVACY_POLICY", "approved", "POLICY-DEMO"],
      ["DATA_RETENTION", "approved", "RETENTION-DEMO"],
      ["DPA_REVIEW", "action_required", "DPA-DEMO"],
      ["BREACH_RESPONSE", "approved", "BREACH-DEMO"],
      ["KRA_TAX_PROFILE", "approved", `KRA-DEMO-${tenantIndex + 1}`],
      ["ETIMS_ONBOARDING", "in_progress", `ETIMS-DEMO-${tenantIndex + 1}`],
    ];
    for (let i = 0; i < complianceTypes.length; i += 1) {
      const [type, status, referenceNumber] = complianceTypes[i];
      await ComplianceRecord.updateOne(
        { tenantId: tenant._id, type },
        {
          $set: {
            status,
            referenceNumber,
            authority: type === "ETIMS_ONBOARDING" || type === "KRA_TAX_PROFILE" ? "Kenya Revenue Authority" : type === "ODPC_REGISTRATION" ? "Office of the Data Protection Commissioner" : "Internal compliance register",
            issueDate: daysFromNow(-45),
            expiryDate: daysFromNow(180 + i * 15),
            owner: actor?._id || null,
            notes: "Synthetic compliance workspace record. No government approval or submission is being represented as real.",
            lastReviewedAt: daysFromNow(-5),
            nextReviewAt: daysFromNow(25 + i),
            createdBy: actor?._id || null,
          },
        },
        { upsert: true }
      );
    }

    // Privacy/data-subject workload for the governance dashboard.
    const privacyTypes = ["access", "correction", "portability"];
    const privacyStatuses = ["received", "in_progress", "completed"];
    for (let i = 0; i < privacyTypes.length; i += 1) {
      await PrivacyRequest.findOneAndUpdate(
        { tenantId: tenant._id, requestNumber: `DSR-DEMO-${tenantIndex + 1}-${i + 1}` },
        {
          $set: {
            type: privacyTypes[i],
            customer: customers[i % Math.max(customers.length, 1)]?._id || null,
            requesterName: customer ? `${customer.firstName} ${customer.lastName}` : `Demo Requester ${i + 1}`,
            requesterEmail: customer?.email || `privacy${tenantIndex + 1}${i + 1}@demo.co.ke`,
            requesterPhone: customer?.phone || "0712000000",
            status: privacyStatuses[i],
            receivedAt: daysFromNow(-i - 2),
            dueAt: daysFromNow(30 - i - 2),
            completedAt: privacyStatuses[i] === "completed" ? daysFromNow(-1) : null,
            assignedTo: actor?._id || null,
            resolutionNotes: privacyStatuses[i] === "completed" ? "Synthetic privacy request completed for governance dashboard coverage." : "",
            createdBy: actor?._id || null,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // External website connector activity: one active demo key and several captured/rejected events.
    const rawKey = `gt_demo_${tenantIndex + 1}_website_${hash(`${tenant._id}:website`).slice(0, 20)}`;
    const publicKey = `gt_pub_${hash(`${tenant._id}:public`).slice(0, 28)}`;
    const integrationKey = await WebsiteIntegrationKey.findOneAndUpdate(
      { tenantId: tenant._id, name: "Global Tours Demo Website" },
      {
        $set: {
          keyPrefix: rawKey.slice(0, 12),
          keyHash: hash(rawKey),
          publicKey,
          publicKeyHash: hash(publicKey),
          active: true,
          permissions: ["booking:create", "customer:create", "tour:read"],
          allowedOrigins: ["https://demo.globaltours.co.ke"],
          environment: "test",
          createdBy: actor?._id || null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await WebsiteIntegrationEvent.deleteMany({ tenantId: tenant._id, origin: "https://demo.globaltours.co.ke" });
    for (let i = 0; i < 3; i += 1) {
      const booking = bookings[i % Math.max(bookings.length, 1)];
      await WebsiteIntegrationEvent.create({
        tenantId: tenant._id,
        integrationKey: integrationKey._id,
        eventType: i === 2 ? "booking.rejected" : "booking.created",
        externalBookingId: `WEB-DEMO-${tenantIndex + 1}-${i + 1}`,
        booking: i === 2 ? null : booking?._id || null,
        origin: "https://demo.globaltours.co.ke",
        ip: "127.0.0.1",
        requestId: `req-demo-${tenantIndex + 1}-${i + 1}`,
        payload: { demo: true, source: "external_website", customerCaptured: true },
        error: i === 2 ? "Synthetic validation rejection for dashboard demonstration." : "",
      });
    }

    // Payment gateway control-plane coverage. All records are sandbox/disabled so demo data can never be mistaken for live credentials.
    for (const provider of ["MPESA", "STRIPE", "PESAPAL", "BANK"]) {
      await PaymentGatewayConfig.updateOne(
        { tenantId: tenant._id, provider },
        { $set: { environment: "sandbox", enabled: false, accountName: `Global Tours Demo ${provider}`, merchantId: `DEMO-${provider}-${tenantIndex + 1}`, callbackUrl: "https://demo.globaltours.co.ke/api/payments/callback", updatedBy: actor?._id || null } },
        { upsert: true }
      );
    }

    return {
      tenant: tenant.name || String(tenant._id),
      corporateAccounts: await CorporateAccount.countDocuments({ tenantId: tenant._id }),
      accommodationInventory: await AccommodationInventory.countDocuments({ tenantId: tenant._id }),
      serviceRequests: await TravelServiceRequest.countDocuments({ tenantId: tenant._id }),
      complianceRecords: await ComplianceRecord.countDocuments({ tenantId: tenant._id }),
      privacyRequests: await PrivacyRequest.countDocuments({ tenantId: tenant._id }),
      websiteEvents: await WebsiteIntegrationEvent.countDocuments({ tenantId: tenant._id }),
      paymentGateways: await PaymentGatewayConfig.countDocuments({ tenantId: tenant._id }),
    };
  });
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");
  await mongoose.connect(process.env.MONGODB_URI);
  const tenants = await Organization.find({ isDeleted: { $ne: true } }).sort({ createdAt: 1 }).lean();
  if (tenants.length !== 3) throw new Error(`SAFE STOP: expected exactly 3 tenants, found ${tenants.length}.`);

  const results = [];
  for (let i = 0; i < tenants.length; i += 1) results.push(await seedTenant(tenants[i], i));

  console.table(results);
  console.log("Dashboard operational seed complete. Existing tenants and master data were preserved; synthetic operational/compliance/demo connector records were upserted.");
}

main()
  .catch((error) => {
    console.error("Dashboard operational seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
