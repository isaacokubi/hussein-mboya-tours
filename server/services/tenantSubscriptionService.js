import axios from "axios";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import SystemSetting from "../models/SystemSetting.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { runWithTenant } from "../tenancy/context.js";
import { mpesaConfig, getMpesaUrls, hasLegacyMpesaConfig } from "../config/mpesa.js";
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

const ENV_PLAN_PRICES = Object.freeze({ starter: Number(process.env.TENANT_PLAN_STARTER_PRICE_KES || 0), professional: Number(process.env.TENANT_PLAN_PROFESSIONAL_PRICE_KES || 0), business: Number(process.env.TENANT_PLAN_BUSINESS_PRICE_KES || 0), enterprise: Number(process.env.TENANT_PLAN_ENTERPRISE_PRICE_KES || 0) });
const PLAN_FIELDS = Object.freeze({ starter: "tenantPlanStarterPriceKes", professional: "tenantPlanProfessionalPriceKes", business: "tenantPlanBusinessPriceKes", enterprise: "tenantPlanEnterprisePriceKes" });
const PLAN_SEATS = Object.freeze({ starter: 5, professional: 15, business: 50, enterprise: 250 });
const SUBSCRIPTION_GRACE_PERIOD_DAYS = Math.max(0, Math.min(Number(process.env.SUBSCRIPTION_GRACE_PERIOD_DAYS || 3), 30));
const DAY_MS = 86400000;

export const getTenantPlanPrices = async () => runWithTenant({ role: "super_admin", bypass: true }, async () => {
  const settings = await SystemSetting.findOne({ tenantId: null, key: "platform" }).lean();
  return Object.fromEntries(Object.entries(PLAN_FIELDS).map(([plan, field]) => [plan, Number(settings?.[field] ?? ENV_PLAN_PRICES[plan] ?? 0)]));
});
export const getTenantPlanPrice = async (plan) => Number((await getTenantPlanPrices())[String(plan || "").toLowerCase()] || 0);

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
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  const organization = await Organization.findById(tenantId);
  if (!organization) throw new Error("Company not found.");
  const now = new Date();
  const days = Math.max(1, Math.min(Number(periodDays) || 30, 3660));
  const end = new Date(now.getTime() + days * DAY_MS);
  const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};
  const seats = PLAN_SEATS[normalizedPlan];
  organization.status = "active";
  organization.subscription = { ...existingSubscription, plan: normalizedPlan, seats, trialEndsAt: existingSubscription.trialEndsAt || null, renewsAt: end };
  await organization.save();
  await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate({ tenantId: organization._id }, { $set: { tenantId: organization._id, plan: normalizedPlan, status: "active", provider, currentPeriodStartsAt: now, currentPeriodEndsAt: end, cancelledAt: null, trialStartsAt: existingSubscription.trialStartsAt || organization.createdAt || now, trialEndsAt: existingSubscription.trialEndsAt || now, seats } }, { upsert: true, new: true, setDefaultsOnInsert: true }));
  if (payment) { payment.status = "completed"; payment.paidAt = payment.paidAt || now; payment.transactionReference = transactionReference || payment.transactionReference || payment.mpesaReceiptNumber || ""; await payment.save(); }
  return { organization, periodStartsAt: now, periodEndsAt: end };
};

export const switchTenantSubscriptionPlan = async ({ tenantId, plan }) => {
  if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");
  const normalizedPlan = String(plan || "").toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  const organization = await Organization.findById(tenantId);
  if (!organization) throw new Error("Company not found.");

  const existing = organization.subscription?.toObject?.() || organization.subscription || {};
  const currentEnd = existing.renewsAt || null;
  const seats = PLAN_SEATS[normalizedPlan];
  organization.status = organization.status === "suspended" ? "active" : organization.status;
  organization.subscription = { ...existing, plan: normalizedPlan, seats, renewsAt: currentEnd };
  await organization.save();

  const now = new Date();
  const subscription = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate(
    { tenantId: organization._id },
    { $set: { tenantId: organization._id, plan: normalizedPlan, seats, status: currentEnd && new Date(currentEnd) > now ? "active" : "active" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ));

  return { organization, subscription, previousPlan: String(existing.plan || "starter").toLowerCase(), plan: normalizedPlan };
};

export const expireTenantSubscriptions = async () => {
  const now = new Date();
  const trialOrgs = await Organization.find({ status: "trial", "subscription.trialEndsAt": { $lte: now } }).select("_id").lean();
  const expiredPaidOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id").lean();
  const graceOrgs = await Organization.find({ status: "active", "subscription.renewsAt": { $lte: now } }).select("_id subscription.renewsAt").lean();
  const pastDueSubscriptions = await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.find({ status: "past_due", currentPeriodEndsAt: { $lte: new Date(now.getTime() - SUBSCRIPTION_GRACE_PERIOD_DAYS * DAY_MS) } }).select("tenantId").lean());
  const trialIds = trialOrgs.map((item) => item._id);
  const graceIds = graceOrgs.map((item) => item._id);
  if (graceIds.length) await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: graceIds }, status: "active", currentPeriodEndsAt: { $lte: now } }, { $set: { status: "past_due" } }));
  const paidPastDueIds = pastDueSubscriptions.map((item) => item.tenantId);
  const expiredIds = [...new Map([...trialIds.map((id) => [String(id), id]), ...paidPastDueIds.map((id) => [String(id), id])]).values()];
  if (expiredIds.length) {
    await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: expiredIds }, status: { $in: ["trialing", "past_due"] } }, { $set: { status: "expired", currentPeriodEndsAt: now } }));
    await Organization.updateMany({ _id: { $in: expiredIds } }, { $set: { status: "suspended", "subscription.renewsAt": null } });
  }
  return expiredIds.length + graceIds.length;
};

export const startTenantSubscriptionScheduler = () => { const run = () => expireTenantSubscriptions().catch((error) => console.error("Tenant subscription expiry sync failed:", error)); run(); return setInterval(run, 60 * 60 * 1000); };

export const initiateTenantMpesaPayment = async ({ tenantId, userId, plan, phone }) => {
  const organization = await Organization.findById(tenantId).lean();
  if (!organization) throw new Error("Company not found.");
  if (!hasLegacyMpesaConfig() || !mpesaConfig.callbackUrl) throw new Error("Platform M-Pesa subscription checkout is not configured. Configure the M-Pesa credentials and callback URL in the server deployment environment.");
  const normalizedPlan = String(plan || "").toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(PLAN_FIELDS, normalizedPlan)) throw new Error("Invalid subscription plan.");
  const paymentAmount = await getTenantPlanPrice(normalizedPlan);
  if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");
  const normalizedPhone = normalizeSubscriptionPhone(phone);
  const token = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const urls = getMpesaUrls();
  const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan: normalizedPlan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });
  try {
    const { data } = await axios.post(urls.stkPush, { BusinessShortCode: mpesaConfig.shortcode, Password: password, Timestamp: timestamp, TransactionType: "CustomerPayBillOnline", Amount: Math.round(paymentAmount), PartyA: normalizedPhone, PartyB: mpesaConfig.shortcode, PhoneNumber: normalizedPhone, CallBackURL: mpesaConfig.callbackUrl, AccountReference: `SUB-${String(tenantId).slice(-8)}`, TransactionDesc: `${organization.name} subscription` }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });
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