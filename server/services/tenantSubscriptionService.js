import axios from "axios";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { runWithTenant } from "../tenancy/context.js";
import { mpesaConfig, getMpesaUrls } from "../config/mpesa.js";
import { generateAccessToken, generateTimestamp, generatePassword } from "./mpesaService.js";

const DEFAULT_PLAN_PRICES = Object.freeze({ starter: 5000, professional: 10000, business: 20000, enterprise: 50000 });
const envPrice = (key, fallback) => { const value = process.env[key]; if (value === undefined || value === "") return fallback; const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback; };
const PLAN_PRICES = Object.freeze({ starter: envPrice("TENANT_PLAN_STARTER_PRICE_KES", DEFAULT_PLAN_PRICES.starter), professional: envPrice("TENANT_PLAN_PROFESSIONAL_PRICE_KES", DEFAULT_PLAN_PRICES.professional), business: envPrice("TENANT_PLAN_BUSINESS_PRICE_KES", DEFAULT_PLAN_PRICES.business), enterprise: envPrice("TENANT_PLAN_ENTERPRISE_PRICE_KES", DEFAULT_PLAN_PRICES.enterprise) });
export const getTenantPlanPrice = (plan) => Number(PLAN_PRICES[String(plan || "").toLowerCase()] || 0);
export const getTenantPlanPrices = () => ({ ...PLAN_PRICES });
export const normalizeSubscriptionPhone = (phone) => { let value = String(phone || "").trim().replace(/\s+/g, ""); if (value.startsWith("+254")) value = value.slice(1); if (/^0[17]\d{8}$/.test(value)) value = `254${value.slice(1)}`; if (!/^254[17]\d{8}$/.test(value)) throw new Error("Enter a valid Kenyan M-Pesa phone number."); return value; };

export const ensureActiveSubscriptionSchedule = async (tenantId, organization, subscription) => {
  if (String(organization?.status || "").toLowerCase() !== "active") return { organization, subscription };
  const organizationRenewal = organization.subscription?.renewsAt;
  const subscriptionEnd = subscription?.currentPeriodEndsAt;
  const validDate = (value) => value && !Number.isNaN(new Date(value).getTime());
  if (validDate(organizationRenewal)) return { organization, subscription };
  if (validDate(subscriptionEnd)) {
    await Organization.updateOne({ _id: tenantId, status: "active", "subscription.renewsAt": null }, { $set: { "subscription.renewsAt": new Date(subscriptionEnd) } });
    organization.subscription = { ...(organization.subscription || {}), renewsAt: new Date(subscriptionEnd) };
    return { organization, subscription };
  }
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 86400000);
  const plan = organization.subscription?.plan || subscription?.plan || "starter";
  const seats = organization.subscription?.seats || subscription?.seats || 5;
  await Organization.updateOne({ _id: tenantId, status: "active", "subscription.renewsAt": null }, { $set: { "subscription.plan": plan, "subscription.seats": seats, "subscription.renewsAt": end } });
  await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate({ tenantId }, { $set: { tenantId, plan, status: "active", provider: subscription?.provider || "internal", currentPeriodStartsAt: subscription?.currentPeriodStartsAt || now, currentPeriodEndsAt: end, seats }, $setOnInsert: { trialStartsAt: organization.createdAt || now, trialEndsAt: organization.subscription?.trialEndsAt || now } }, { upsert: true, new: true, setDefaultsOnInsert: true }));
  organization.subscription = { ...(organization.subscription || {}), plan, seats, renewsAt: end };
  return { organization, subscription: { ...(subscription || {}), plan, status: "active", currentPeriodEndsAt: end, seats } };
};

export const activateTenantSubscription = async ({ tenantId, plan, provider = "mpesa", periodDays = 30, payment, transactionReference = "" }) => {
  if (!mongoose.isValidObjectId(tenantId)) throw new Error("Invalid tenant ID.");
  const organization = await Organization.findById(tenantId);
  if (!organization) throw new Error("Company not found.");
  const now = new Date();
  const days = Math.max(1, Number(periodDays) || 30);
  const existingSubscription = organization.subscription?.toObject?.() || organization.subscription || {};
  const currentRenewal = existingSubscription.renewsAt && !Number.isNaN(new Date(existingSubscription.renewsAt).getTime()) ? new Date(existingSubscription.renewsAt) : null;
  const periodStart = currentRenewal && currentRenewal > now ? currentRenewal : now;
  const end = new Date(periodStart.getTime() + days * 86400000);
  organization.status = "active";
  organization.subscription = { ...existingSubscription, plan, seats: existingSubscription.seats || 5, trialEndsAt: existingSubscription.trialEndsAt || null, renewsAt: end };
  await organization.save();
  await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.findOneAndUpdate({ tenantId: organization._id }, { $set: { tenantId: organization._id, plan, status: "active", provider, currentPeriodStartsAt: periodStart, currentPeriodEndsAt: end, cancelledAt: null, seats: existingSubscription.seats || 5 }, $setOnInsert: { trialStartsAt: organization.createdAt || now, trialEndsAt: existingSubscription.trialEndsAt || now } }, { upsert: true, new: true, setDefaultsOnInsert: true }));
  if (payment) { payment.status = "completed"; payment.paidAt = payment.paidAt || now; payment.transactionReference = transactionReference || payment.transactionReference || payment.mpesaReceiptNumber || ""; await payment.save(); }
  return { organization, periodStartsAt: periodStart, periodEndsAt: end };
};

export const expireTenantSubscriptions = async () => {
  const now = new Date();
  const trialOrgs = await Organization.find({ status: "trial", "subscription.trialEndsAt": { $lte: now } }).select("_id").lean();
  const paidOrgs = await Organization.find({ status: "active", $or: [{ "subscription.renewsAt": { $lte: now } }, { "subscription.renewsAt": null, "subscription.currentPeriodEndsAt": { $lte: now } }] }).select("_id").lean();
  const trialIds = trialOrgs.map((item) => item._id); const paidIds = paidOrgs.map((item) => item._id); const ids = [...trialIds, ...paidIds]; if (!ids.length) return 0;
  await runWithTenant({ role: "super_admin", bypass: true }, () => Subscription.updateMany({ tenantId: { $in: ids } }, { $set: { status: "expired", currentPeriodEndsAt: now } }));
  await Organization.updateMany({ _id: { $in: ids } }, { $set: { status: "suspended", "subscription.renewsAt": null } });
  return ids.length;
};
export const startTenantSubscriptionScheduler = () => { const run = () => expireTenantSubscriptions().catch((error) => console.error("Tenant subscription expiry sync failed:", error)); run(); return setInterval(run, 60 * 60 * 1000); };

export const initiateTenantMpesaPayment = async ({ tenantId, userId, plan, phone, amount }) => {
  const organization = await Organization.findById(tenantId).lean(); if (!organization) throw new Error("Company not found.");
  const paymentAmount = Number(amount || getTenantPlanPrice(plan)); if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");
  const normalizedPhone = normalizeSubscriptionPhone(phone); const token = await generateAccessToken(); const timestamp = generateTimestamp(); const password = generatePassword(timestamp); const urls = getMpesaUrls();
  const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });
  try {
    const { data } = await axios.post(urls.stkPush, { BusinessShortCode: mpesaConfig.shortcode, Password: password, Timestamp: timestamp, TransactionType: "CustomerPayBillOnline", Amount: Math.round(paymentAmount), PartyA: normalizedPhone, PartyB: mpesaConfig.shortcode, PhoneNumber: normalizedPhone, CallBackURL: mpesaConfig.callbackUrl, AccountReference: `SUB-${String(tenantId).slice(-8)}`, TransactionDesc: `${organization.name} subscription` }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });
    payment.merchantRequestID = data.MerchantRequestID || ""; payment.checkoutRequestID = data.CheckoutRequestID || ""; await payment.save(); return { payment, response: data };
  } catch (error) {
    payment.status = "failed"; payment.failureReason = error.response?.data?.errorMessage || error.message || "M-Pesa subscription request failed."; await payment.save(); throw new Error(payment.failureReason);
  }
};
