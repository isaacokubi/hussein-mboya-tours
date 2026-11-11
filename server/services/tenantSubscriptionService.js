/**
 * Purpose: tenant Subscription Service business-logic service. Main declarations: getTenantPlanPrices, getTenantPlanPrice, normalizeSubscriptionPhone, activateTenantSubscription, switchTenantSubscriptionPlan.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "axios";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../models/SystemSetting.js so this module can use its exported dependencies.
import SystemSetting from "../models/SystemSetting.js";
// Load ../models/Subscription.js so this module can use its exported dependencies.
import Subscription from "../models/Subscription.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant } from "../tenancy/context.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { mpesaConfig, getMpesaUrls, hasLegacyMpesaConfig } from "../config/mpesa.js";
// Load ./mpesaService.js so this module can use its exported dependencies.
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

// Declare ENV_PLAN_PRICES for use by the surrounding module or function.
const ENV_PLAN_PRICES = Object.freeze({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0), enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0) });
// Declare PLAN_FIELDS for use by the surrounding module or function.
const PLAN_FIELDS = Object.freeze({ starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterprisePriceKes" });
// Declare PLAN_SEATS for use by the surrounding module or function.
const PLAN_SEATS = Object.freeze({ starter: 5, professional: 15, business: 50, enterprise: 250 });
// Declare SUBSCRIPTION_GRACE_PERIOD_DAYS for use by the surrounding module or function.
const SUBSCRIPTION_GRACE_PERIOD_DAYS = Math.max(0, Math.min(Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS || 3), 30));
// Declare DAY_MS for use by the surrounding module or function.
const DAY_MS = 86400000;

// Declare getTenantPlanPrices for use by the surrounding module or function.
export const getTenantPlanPrices = async () => runWithTenant({ role: "super_admin", bypass: true }, async () => {
  // Declare settings for use by the surrounding module or function.
  const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean();
  // Return the result of Object.fromEntries() to the caller.
  return Object.fromEntries(Object.entries(PLAN_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? ENV_PLAN_PRICES[plan] ?? 0)]));
});
// Declare getTenantPlanPrice for use by the surrounding module or function.
export const getTenantPlanPrice = async (plan) => Number((await getTenantPlanPrices())[String(plan || "").toLowerCase()] || 0);

// Declare normalizeSubscriptionPhone for use by the surrounding module or function.
export const normalizeSubscriptionPhone = (phone) => {
  // Declare value for use by the surrounding module or function.
  let value = String(phone || "").trim().replace(/\s+/g, "");
  // Check the condition (value.startsWith("+254")) and run the matching branch.
  if (value.startsWith("+254")) value = value.slice(1);
  // Check the condition (/^0[17]\d{8}$/.test(value)) and run the matching branch.
  if (/^0[17]\d{8}$/.test(value)) value = `254${value.slice(1)}`;
  // Check the condition (!/^254[17]\d{8}$/.test(value)) and run the matching branch.
  if (!/^254[17]\d{8}$/.test(value)) throw new Error("Enter a valid Kenyan M-Pesa phone number.");
  // Return the value of value to the caller.
  return value;
};

// Declare activateTenantSubscription for use by the surrounding module or function.
export const activateTenantSubscription = async ({ tenantId, plan, provider = "mpesa", periodDays = 30, payment, transactionReference = "" }) => {
  // Check the condition (!mongoose.isValidObjectId(tenantId)) and run the matching branch.
  if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");
  // Declare normalizedPlan for use by the surrounding module or function.
  const normalizedPlan = String(plan || "").toLowerCase();
  // Check the condition (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) and run the matching branch.
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  // Declare organization for use by the surrounding module or function.
  const organization = await Organization.findById(tenantId);
  // Check the condition (!organization) and run the matching branch.
  if (!organization) throw new Error("Company not found.");
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare days for use by the surrounding module or function.
  const days = Math.max(1, Math.min(Number(periodDays) || 30, 3660));
  // Declare end for use by the surrounding module or function.
  const end = new Date(now.getTime() + days * DAY_MS);
  // Declare existingSubscription for use by the surrounding module or function.
  const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};
  // Declare seats for use by the surrounding module or function.
  const seats = PLAN_SEATS[normalizedPlan];
  // Perform the side effect or state update expressed on the following line.
  organization.status = "active";
  // Perform the side effect or state update expressed on the following line.
  organization.subscription = { ...existingSubscription, plan: normalizedPlan, seats, trialEndsAt: existingSubscription.trialEndsAt || null, renewsAt: end };
  // Perform the side effect or state update expressed on the following line.
  await organization.save();
  // Perform the side effect or state update expressed on the following line.
  await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate({ tenantId: organization._id }, { $set: { tenantId: organization._id, plan: normalizedPlan, status: "active", provider, currentPeriodStartsAt: now, currentPeriodEndsAt: end, cancelledAt: null, trialStartsAt: existingSubscription.trialStartsAt || organization.createdAt || now, trialEndsAt: existingSubscription.trialEndsAt || now, seats } }, { upsert: true, new: true, setDefaultsOnInsert: true }));
  // Check the condition (payment) and run the matching branch.
  if (payment) { payment.status = "completed"; payment.paidAt = payment.paidAt || now; payment.transactionReference = transactionReference || payment.transactionReference || payment.mpesaReceiptNumber || ""; await payment.save(); }
  // Return the object assembled below to the caller.
  return { organization, periodStartsAt: now, periodEndsAt: end };
};

// Declare switchTenantSubscriptionPlan for use by the surrounding module or function.
export const switchTenantSubscriptionPlan = async ({ tenantId, plan }) => {
  // Check the condition (!mongoose.isValidObjectId(tenantId)) and run the matching branch.
  if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");
  // Declare normalizedPlan for use by the surrounding module or function.
  const normalizedPlan = String(plan || "").toLowerCase();
  // Check the condition (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) and run the matching branch.
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  // Declare organization for use by the surrounding module or function.
  const organization = await Organization.findById(tenantId);
  // Check the condition (!organization) and run the matching branch.
  if (!organization) throw new Error("Company not found.");

  // Declare existing for use by the surrounding module or function.
  const existing = organization.subscription?.toObject?.() || organization.subscription || {};
  // Declare currentEnd for use by the surrounding module or function.
  const currentEnd = existing.renewsAt || null;
  // Declare seats for use by the surrounding module or function.
  const seats = PLAN_SEATS[normalizedPlan];
  // Perform the side effect or state update expressed on the following line.
  organization.status = organization.status === "suspended" ? "active" : organization.status;
  // Perform the side effect or state update expressed on the following line.
  organization.subscription = { ...existing, plan: normalizedPlan, seats, renewsAt: currentEnd };
  // Perform the side effect or state update expressed on the following line.
  await organization.save();

  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare subscription for use by the surrounding module or function.
  const subscription = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate(
    { tenantId: organization._id },
    { $set: { tenantId: organization._id, plan: normalizedPlan, seats, status: currentEnd && new Date(currentEnd) > now ? "active" : "active" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  // Return the object assembled below to the caller.
  return { organization, subscription, previousPlan: String(existing.plan || "starter").toLowerCase(), plan: normalizedPlan };
};

// Declare expireTenantSubscriptions for use by the surrounding module or function.
export const expireTenantSubscriptions = async () => {
  // Declare now for use by the surrounding module or function.
  const now = new Date();
  // Declare trialOrgs for use by the surrounding module or function.
  const trialOrgs = await Organization.find({ status: "trial", "subscription.trialEndsAt": { $lte: now } }).select("_id").lean();
  // Declare expiredPaidOrgs for use by the surrounding module or function.
  const expiredPaidOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id").lean();
  // Declare graceOrgs for use by the surrounding module or function.
  const graceOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id subscription.renewsAt").lean();
  // Declare pastDueSubscriptions for use by the surrounding module or function.
  const pastDueSubscriptions = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.find({ status: "past_due", currentPeriodEndsAt: { $lte: new Date(now.getTime() - SUBSCRIPTION_GRACE_PERIOD_DAYS * DAY_MS) } }).select("tenantId").lean());
  // Declare trialIds for use by the surrounding module or function.
  const trialIds = trialOrgs.map((item) => item._id);
  // Declare graceIds for use by the surrounding module or function.
  const graceIds = graceOrgs.map((item) => item._id);
  // Check the condition (graceIds.length) and run the matching branch.
  if (graceIds.length) await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: graceIds }, status: "active", currentPeriodEndsAt: { $lte: now } }, { $set: { status: "past_due" } }));
  // Declare paidPastDueIds for use by the surrounding module or function.
  const paidPastDueIds = pastDueSubscriptions.map((item) => item.tenantId);
  // Declare expiredIds for use by the surrounding module or function.
  const expiredIds = [...new Map([...trialIds.map((id) => [String(id), id]), ...paidPastDueIds.map((id) => [String(id), id])]).values()];
  // Check the condition (expiredIds.length) and run the matching branch.
  if (expiredIds.length) {
    // Perform the side effect or state update expressed on the following line.
    await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: expiredIds }, status: { $in: ["trialing", "past_due"] } }, { $set: { status: "expired", currentPeriodEndsAt: now } }));
    // Perform the side effect or state update expressed on the following line.
    await Organization.updateMany({ _id: { $in: expiredIds } }, { $set: { status: "suspended", "subscription.renewsAt": null } });
  }
  // Return the expression shown below to the caller.
  return expiredIds.length + graceIds.length;
};

// Declare startTenantSubscriptionScheduler for use by the surrounding module or function.
export const startTenantSubscriptionScheduler = () => { const run = () => expireTenantSubscriptions().catch((error) => console.error("Tenant subscription expiry sync failed:", error)); run(); return setInterval(run, 60 * 60 * 1000); };

// Declare initiateTenantMpesaPayment for use by the surrounding module or function.
export const initiateTenantMpesaPayment = async ({ tenantId, userId, plan, phone }) => {
  // Declare organization for use by the surrounding module or function.
  const organization = await Organization.findById(tenantId).lean();
  // Check the condition (!organization) and run the matching branch.
  if (!organization) throw new Error("Company not found.");
  // Check the condition (!hasLegacyMpesaConfig() || !mpesaConfig.callbackUrl) and run the matching branch.
  if (!hasLegacyMpesaConfig() || !mpesaConfig.callbackUrl) throw new Error("Platform M-Pesa subscription checkout is not configured. Configure the M-Pesa credentials and callback URL in the server deployment environment.");
  // Declare normalizedPlan for use by the surrounding module or function.
  const normalizedPlan = String(plan || "").toLowerCase();
  // Check the condition (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) and run the matching branch.
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  // Declare paymentAmount for use by the surrounding module or function.
  const paymentAmount = await getTenantPlanPrice(normalizedPlan);
  // Check the condition (!Number.isInteger(paymentAmount) || paymentAmount < 1) and run the matching branch.
  if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");
  // Declare normalizedPhone for use by the surrounding module or function.
  const normalizedPhone = normalizeSubscriptionPhone(phone);
    // Declare token for use by the surrounding module or function.
    const token = await generateAccessToken(mpesaConfig);
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = generateTimestamp();
  // Declare password for use by the surrounding module or function.
  const password = generatePassword(timestamp);
  // Declare urls for use by the surrounding module or function.
  const urls = getMpesaUrls();
  // Declare payment for use by the surrounding module or function.
  const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan: normalizedPlan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await axios.post(urls.stkPush, { BusinessShortCode: mpesaConfig.shortcode, Password: password, Timestamp: timestamp, TransactionType: "CustomerPayBillOnline", Amount: Math.round(paymentAmount), PartyA: normalizedPhone, PartyB: mpesaConfig.shortcode, PhoneNumber: normalizedPhone, CallBackURL: mpesaConfig.callbackUrl, AccountReference: `SUB-${String(tenantId).slice(-8)}`, TransactionDesc: `${organization.name} subscription` }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });
    // Perform the side effect or state update expressed on the following line.
    payment.merchantRequestID = data.MerchantRequestID || "";
    // Perform the side effect or state update expressed on the following line.
    payment.checkoutRequestID = data.CheckoutRequestID || "";
    // Perform the side effect or state update expressed on the following line.
    await payment.save();
    // Return the object assembled below to the caller.
    return { payment, response: data };
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    payment.status = "failed";
    // Perform the side effect or state update expressed on the following line.
    payment.failureReason = error.response?.data?.errorMessage || error.message || "M-Pesa subscription request failed.";
    // Perform the side effect or state update expressed on the following line.
    await payment.save();
    // Stop the current operation by raising a new Error instance.
    throw new Error(payment.failureReason);
  }
};
