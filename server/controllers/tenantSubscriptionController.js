import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import User from "../models/User.js";
import { activateTenantSubscription, getTenantPlanPrice, getTenantPlanPrices, initiateTenantMpesaPayment, switchTenantSubscriptionPlan } from "../services/tenantSubscriptionService.js";
import { getPlanFeatureCatalog, getTenantPlanFeatures } from "../services/planFeatureService.js";

const isAdmin = (user) => ["admin", "administrator", "super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());
const isPlatformSuperAdmin = (user) => ["super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());

export const getTenantSubscription = async (req, res, next) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ success: false, message: "No tenant is selected." });
    const organization = await Organization.findById(tenantId).lean();
    if (!organization) return res.status(404).json({ success: false, message: "Company not found." });
    const subscription = await Subscription.findOne({ tenantId }).lean();
    const payments = await SubscriptionPayment.find({ tenantId }).sort({ createdAt: -1 }).limit(10).lean();
    const plan = String(organization.subscription?.plan || subscription?.plan || "starter").toLowerCase();
    const planPrices = await getTenantPlanPrices();
    const features = await getTenantPlanFeatures(plan);
    return res.json({ success: true, tenant: organization, subscription: subscription || null, plan, amountDue: planPrices[plan] || 0, planPrices, features, featureCatalog: getPlanFeatureCatalog(), payments });
  } catch (error) { next(error); }
};

export const startTenantSubscriptionPayment = async (req, res, next) => {
  try {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId || !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the company administrator can pay for the company subscription." });
    const plan = String(req.body?.plan || "").toLowerCase();
    const phone = String(req.body?.phone || req.user?.phone || "").trim();
    const amount = await getTenantPlanPrice(plan);
    if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });
    const result = await initiateTenantMpesaPayment({ tenantId, userId: req.user._id, plan, phone });
    return res.status(200).json({ success: true, message: `M-Pesa payment request sent for KES ${amount.toLocaleString()}.`, payment: result.payment, data: result.response });
  } catch (error) { next(error); }
};

export const getTenantSubscriptionPaymentStatus = async (req, res, next) => {
  try {
    const payment = await SubscriptionPayment.findOne({ checkoutRequestID: req.params.checkoutRequestId, tenantId: req.tenantId || req.user?.tenantId }).lean();
    if (!payment) return res.status(404).json({ success: false, message: "Subscription payment not found." });
    return res.json({ success: true, payment });
  } catch (error) { next(error); }
};

export const approveTenantSubscription = async (req, res, next) => {
  try {
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can manually activate subscriptions." });
    const tenantId = req.params.id;
    const tenant = await Organization.findById(tenantId);
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found." });
    const plan = String(req.body?.plan || tenant.subscription?.plan || "starter").toLowerCase();
    const days = Math.max(1, Math.min(Number(req.body?.periodDays) || 30, 3660));
    const amount = await getTenantPlanPrice(plan);
    if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });
    const reference = String(req.body?.reference || "").trim();
    if (!reference) return res.status(400).json({ success: false, message: "A verified payment reference is required for manual activation." });
    const payment = await SubscriptionPayment.create({ tenantId, userId: req.user._id, plan, amount, provider: "manual", status: "pending", periodDays: days, transactionReference: reference, metadata: { approvedBy: req.user._id, note: req.body?.note || "" } });
    const result = await activateTenantSubscription({ tenantId, plan, provider: "manual", periodDays: days, payment, transactionReference: reference });
    return res.json({ success: true, message: `Subscription activated for ${days} days.`, tenant: result.organization, payment });
  } catch (error) { next(error); }
};

export const switchTenantSubscription = async (req, res, next) => {
  try {
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can switch tenant subscription plans." });
    const tenantId = req.params.id;
    const plan = String(req.body?.plan || "").toLowerCase();
    if (!plan) return res.status(400).json({ success: false, message: "A subscription plan is required." });
    const result = await switchTenantSubscriptionPlan({ tenantId, plan });
    return res.json({ success: true, message: `${result.organization.name} switched from ${result.previousPlan} to ${result.plan} for testing. Existing renewal period was preserved.`, tenant: result.organization, subscription: result.subscription });
  } catch (error) { next(error); }
};

export const listSubscriptionPayments = async (req, res, next) => {
  try {
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can view all subscription payments." });
    const payments = await SubscriptionPayment.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, payments });
  } catch (error) { next(error); }
};
