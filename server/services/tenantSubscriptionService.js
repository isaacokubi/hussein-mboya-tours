import axios from "axios";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { runWithTenant } from "../tenancy/context.js";
import { mpesaConfig, getMpesaUrls } from "../config/mpesa.js";
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

const PLAN_PRICES = Object.freeze({
  starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0),
  professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0),
  business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0),
  enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0),
});

export const getTenantPlanPrice = (plan) => Number(PLAN_PRICES[String(plan || "").toLowerCase()] || 0);
export const getTenantPlanPrices = () => ({ ...PLAN_PRICES });

export const normalizeSubscriptionPhone = (phone) => {
  let value = String(phone || "").trim().replace(/\s+/g, "");
  if (value.startsWith("+254")) value = value.slice(1);
  if (/^0[17]\d{8}$/.test(value)) value = `254${value.slice(1)}`;
  if (!/^254[17]\d{8}$/.test(value)) throw new Error("Enter a valid Kenyan M-Pesa phone number.");
  return value;
};

export const activateTenantSubscription = async ({ tenantId, plan, provider = "mpesa", periodDays = 30, payment, transactionReference = "" }) => {
  if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");
  const normalizedPlan = String(plan || "").toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PLAN_PRICES, normalizedPlan)) throw new Error("Invalid subscription plan.");
  const organization = await Organization.findById(tenantId);
  if (!organization) throw new Error("Company not found.");

  const now = new Date();
  const days = Math.max(1, Math.min(Number(periodDays) || 30, 3660));
  const end = new Date(now.getTime() + days * 86400000);
  const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};

  organization.status = "active";
  organization.subscription = {
    ...existingSubscription,
    plan: normalizedPlan,
    seats: Number(existingSubscription.seats) || 5,
    trialEndsAt: existingSubscription.trialEndsAt || null,
    renewsAt: end,
  };
  await organization.save();

  await runWithTenant({ role: "super_admin", bypass: true }, () =>
    Subscription.findOneAndUpdate(
      { tenantId: organization._id },
      {
        $set: {
          tenantId: organization._id,
          plan: normalizedPlan,
          status: "active",
          provider,
          currentPeriodStartsAt: now,
          currentPeriodEndsAt: end,
          cancelledAt: null,
          trialStartsAt: existingSubscription.trialStartsAt || organization.createdAt || now,
          trialEndsAt: existingSubscription.trialEndsAt || now,
          seats: Number(existingSubscription.seats) || 5,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  );

  if (payment) {
    payment.status = "completed";
    payment.paidAt = payment.paidAt || now;
    payment.transactionReference = transactionReference || payment.transactionReference || payment.mpesaReceiptNumber || "";
    await payment.save();
  }

  return { organization, periodStartsAt: now, periodEndsAt: end };
};

export const expireTenantSubscriptions = async () => {
  const now = new Date();

  // Evaluate trial and paid expiry independently. A paid tenant may retain its
  // historical trialEndsAt, so a single OR condition can suspend paid tenants.
  const trialOrgs = await Organization.find({
    status: "trial",
    "subscription.trialEndsAt": { $lte: now },
  }).select("_id").lean();

  const paidOrgs = await Organization.find({
    status: "active",
    "subscription.renewsAt": { $lte: now },
  }).select("_id").lean();

  const ids = [...new Map([...trialOrgs, ...paidOrgs].map((item) => [String(item._id), item])).values()].map((item) => item._id);
  if (!ids.length) return 0;

  await runWithTenant({ role: "super_admin", bypass: true }, () =>
    Subscription.updateMany(
      { tenantId: { $in: ids }, status: { $in: ["trialing", "active", "past_due"] } },
      { $set: { status: "expired", currentPeriodEndsAt: now } }
    )
  );

  await Organization.updateMany(
    { _id: { $in: ids } },
    { $set: { status: "suspended", "subscription.renewsAt": null } }
  );

  return ids.length;
};

export const startTenantSubscriptionScheduler = () => {
  const run = () => expireTenantSubscriptions().catch((error) => console.error("Tenant subscription expiry sync failed:", error));
  run();
  return setInterval(run, 60 * 60 * 1000);
};

export const initiateTenantMpesaPayment = async ({ tenantId, userId, plan, phone, amount }) => {
  const organization = await Organization.findById(tenantId).lean();
  if (!organization) throw new Error("Company not found.");

  const normalizedPlan = String(plan || "").toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PLAN_PRICES, normalizedPlan)) throw new Error("Invalid subscription plan.");
  const paymentAmount = Number(amount || getTenantPlanPrice(normalizedPlan));
  if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");

  const normalizedPhone = normalizeSubscriptionPhone(phone);
  const token = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const urls = getMpesaUrls();
  const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan: normalizedPlan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });

  try {
    const { data } = await axios.post(urls.stkPush, {
      BusinessShortCode: mpesaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(paymentAmount),
      PartyA: normalizedPhone,
      PartyB: mpesaConfig.shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: mpesaConfig.callbackUrl,
      AccountReference: `SUB-${String(tenantId).slice(-8)}`,
      TransactionDesc: `${organization.name} subscription`,
    }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });

    payment.merchantRequestID = data.MerchantRequestID || "";
    payment.checkoutRequestID = data.CheckoutRequestID || "";
    await payment.save();
    return { payment, response: data };
  } catch (error) {
    payment.status = "failed";
    payment.failureReason = error.response?.data?.errorMessage || error.message || "M-Pesa subscription request failed.";
    await payment.save();
    throw new Error(payment.failureReason);
  }
};
