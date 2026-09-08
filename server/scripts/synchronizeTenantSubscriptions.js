import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import { runWithTenant } from "../tenancy/context.js";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const serverDirectory = resolve(scriptDirectory, "..");
const projectDirectory = resolve(serverDirectory, "..");

dotenv.config({ path: resolve(serverDirectory, ".env") });
dotenv.config({ path: resolve(projectDirectory, ".env"), override: false });

const databaseUri = process.env.DB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

const DAY = 24 * 60 * 60 * 1000;
const DEFAULT_PERIOD_DAYS = 30;
const PLAN_SEATS = { starter: 5, professional: 20, business: 50, enterprise: 100 };

const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());

async function synchronize() {
  if (!databaseUri) {
    throw new Error(
      "MongoDB connection string is missing. Set DB_URL, MONGO_URI, or MONGODB_URI in server/.env or the project .env file."
    );
  }

  await mongoose.connect(databaseUri);
  const organizations = await Organization.find({}).lean();
  const now = new Date();
  const results = [];

  for (const organization of organizations) {
    const existing = await runWithTenant({ role: "super_admin", bypass: true }, () =>
      Subscription.findOne({ tenantId: organization._id }).lean()
    );
    const plan = organization.subscription?.plan || existing?.plan || "starter";
    const seats = Number(
      organization.subscription?.seats || existing?.seats || PLAN_SEATS[plan] || 5
    );
    const renewal = validDate(organization.subscription?.renewsAt)
      ? new Date(organization.subscription.renewsAt)
      : validDate(existing?.currentPeriodEndsAt)
        ? new Date(existing.currentPeriodEndsAt)
        : new Date(now.getTime() + DEFAULT_PERIOD_DAYS * DAY);
    const periodStart = validDate(existing?.currentPeriodStartsAt)
      ? new Date(existing.currentPeriodStartsAt)
      : now;
    const status =
      organization.status === "active"
        ? "active"
        : organization.status === "trial"
          ? "trialing"
          : existing?.status || "expired";

    await Organization.updateOne(
      { _id: organization._id },
      {
        $set: {
          "subscription.plan": plan,
          "subscription.seats": seats,
          "subscription.renewsAt":
            organization.status === "active"
              ? renewal
              : organization.subscription?.renewsAt || null,
        },
      }
    );

    await runWithTenant({ role: "super_admin", bypass: true }, () =>
      Subscription.findOneAndUpdate(
        { tenantId: organization._id },
        {
          $set: {
            tenantId: organization._id,
            plan,
            seats,
            status,
            currentPeriodStartsAt: periodStart,
            currentPeriodEndsAt: renewal,
          },
          $setOnInsert: {
            trialStartsAt: organization.createdAt || now,
            trialEndsAt: organization.subscription?.trialEndsAt || now,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    results.push({
      tenantId: String(organization._id),
      name: organization.name,
      status,
      plan,
      renewsAt: renewal.toISOString(),
    });
  }

  console.table(results);
  await mongoose.disconnect();
}

synchronize().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
