import axios from "axios";
import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
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
  const organization = await Organization.findById(tenantId);
  if (!organization) throw new Error("Company not found.");
  const now = new Date();
  const days = Math.max(1, Number(periodDays) || 30);
  const end = new Date(now.getTime() + days * 86400000);

  organization.status = "active";
  organization.subscription = {
    ...(organization.subscription?.toObject?.() || organization.subscription || {}),
    plan,
    seats: organization.subscription?.seats || 5,
    trialEndsAt: organization.subscription?.trialEndsAt || null,
    renewsAt: end,
  };
  await organization.save();

  await Subscription.findOneAndUpdate(
    { tenantId: organization._id },
    { $set: { tenantId: organization._id, plan, status: "active", provider, currentPeriodStartsAt: now, currentPeriodEndsAt: end, cancelledAt: null, trialStartsAt: organization.createdAt || now, trialEndsAt: organization.subscription?.trialEndsAt || now, seats: organization.subscription?.seats || 5 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
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
  const expired = await Subscription.find({ status: { $in: ["trialing", "active", "past_due"] }, $or: [{ trialEndsAt: { $lte: now } }, { currentPeriodEndsAt: { $lte: now } }] }).select("tenantId status").lean();
  if (!expired.length) return 0;
  const ids = expired.map((item) => item.tenantId).filter(Boolean);
  await Subscription.updateMany({ tenantId: { $in: ids } }, { $set: { status: "expired", currentPeriodEndsAt: now } });
  await Organization.updateMany({ _id: { $in: ids }, status: { $in: ["trial", "active"] } }, { $set: { status: "suspended", "subscription.renewsAt": null } });
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
  const configuredAmount = getTenantPlanPrice(plan);
  const paymentAmount = Number(amount || configuredAmount);
  if (!Number.isInteger(paymentAmount) || paymentAmount < 1) throw new Error("This subscription plan has no configured payment amount. Ask the platform owner to configure the plan price.");
  const normalizedPhone = normalizeSubscriptionPhone(phone);
  const token = await generateAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const urls = getMpesaUrls();
  const callbackUrl = mpesaConfig.callbackUrl;
  const payment = await SubscriptionPayment.create({ tenantId, userId: userId || null, plan, amount: paymentAmount, provider: "mpesa", phoneNumber: normalizedPhone, status: "pending", periodDays: 30 });
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
      CallBackURL: callbackUrl,
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
