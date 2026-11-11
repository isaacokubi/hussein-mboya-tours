/**
 * Purpose: tenant Subscription Controller HTTP controller. Main declarations: isAdmin, isPlatformSuperAdmin, getTenantSubscription, startTenantSubscriptionPayment, getTenantSubscriptionPaymentStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Organization from "../models/Organization.js";
// Load ../models/Subscription.js so this module can use its exported dependencies.
import Subscription from "../models/Subscription.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../services/tenantSubscriptionService.js so this module can use its exported dependencies.
import { activateTenantSubscription, getTenantPlanPrice, getTenantPlanPrices, initiateTenantMpesaPayment, switchTenantSubscriptionPlan } from "../services/tenantSubscriptionService.js";
// Load ../services/planFeatureService.js so this module can use its exported dependencies.
import { getPlanFeatureCatalog, getTenantPlanFeatures } from "../services/planFeatureService.js";

// Declare isAdmin for use by the surrounding module or function.
const isAdmin = (user) => ["admin", "administrator", "super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());
// Declare isPlatformSuperAdmin for use by the surrounding module or function.
const isPlatformSuperAdmin = (user) => ["super_admin", "superadmin"].includes(String(user?.role || user?.legacyRole || "").toLowerCase());

// Declare getTenantSubscription for use by the surrounding module or function.
export const getTenantSubscription = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId || req.user?.tenantId;
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return res.status(400).json({ success: false, message: "No tenant is selected." });
    // Declare organization for use by the surrounding module or function.
    const organization = await Organization.findById(tenantId).lean();
    // Check the condition (!organization) and run the matching branch.
    if (!organization) return res.status(404).json({ success: false, message: "Company not found." });
    // Declare subscription for use by the surrounding module or function.
    const subscription = await Subscription.findOne({ tenantId }).lean();
    // Declare payments for use by the surrounding module or function.
    const payments = await SubscriptionPayment.find({ tenantId }).sort({ createdAt: -1 }).limit(10).lean();
    // Declare plan for use by the surrounding module or function.
    const plan = String(organization.subscription?.plan || subscription?.plan || "starter").toLowerCase();
    // Declare planPrices for use by the surrounding module or function.
    const planPrices = await getTenantPlanPrices();
    // Declare features for use by the surrounding module or function.
    const features = await getTenantPlanFeatures(plan);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, tenant: organization, subscription: subscription || null, plan, amountDue: planPrices[plan] || 0, planPrices, features, featureCatalog: getPlanFeatureCatalog(), payments });
  } catch (error) { next(error); }
};

// Declare startTenantSubscriptionPayment for use by the surrounding module or function.
export const startTenantSubscriptionPayment = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.tenantId || req.user?.tenantId;
    // Check the condition (!tenantId || !isAdmin(req.user)) and run the matching branch.
    if (!tenantId || !isAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the company administrator can pay for the company subscription." });
    // Declare plan for use by the surrounding module or function.
    const plan = String(req.body?.plan || "").toLowerCase();
    // Declare phone for use by the surrounding module or function.
    const phone = String(req.body?.phone || req.user?.phone || "").trim();
    // Declare amount for use by the surrounding module or function.
    const amount = await getTenantPlanPrice(plan);
    // Check the condition (!Number.isInteger(amount) || amount < 1) and run the matching branch.
    if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });
    // Declare result for use by the surrounding module or function.
    const result = await initiateTenantMpesaPayment({ tenantId, userId: req.user._id, plan, phone });
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({ success: true, message: `M-Pesa payment request sent for KES ${amount.toLocaleString()}.`, payment: result.payment, data: result.response });
  } catch (error) { next(error); }
};

// Declare getTenantSubscriptionPaymentStatus for use by the surrounding module or function.
export const getTenantSubscriptionPaymentStatus = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare payment for use by the surrounding module or function.
    const payment = await SubscriptionPayment.findOne({ checkoutRequestID: req.params.checkoutRequestId, tenantId: req.tenantId || req.user?.tenantId }).lean();
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return res.status(404).json({ success: false, message: "Subscription payment not found." });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, payment });
  } catch (error) { next(error); }
};

// Declare approveTenantSubscription for use by the surrounding module or function.
export const approveTenantSubscription = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isPlatformSuperAdmin(req.user)) and run the matching branch.
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can manually activate subscriptions." });
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.params.id;
    // Declare tenant for use by the surrounding module or function.
    const tenant = await Organization.findById(tenantId);
    // Check the condition (!tenant) and run the matching branch.
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found." });
    // Declare plan for use by the surrounding module or function.
    const plan = String(req.body?.plan || tenant.subscription?.plan || "starter").toLowerCase();
    // Declare days for use by the surrounding module or function.
    const days = Math.max(1, Math.min(Number(req.body?.periodDays) || 30, 3660));
    // Declare amount for use by the surrounding module or function.
    const amount = await getTenantPlanPrice(plan);
    // Check the condition (!Number.isInteger(amount) || amount < 1) and run the matching branch.
    if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ success: false, message: "The selected plan price is not configured by the platform owner." });
    // Declare reference for use by the surrounding module or function.
    const reference = String(req.body?.reference || "").trim();
    // Check the condition (!reference) and run the matching branch.
    if (!reference) return res.status(400).json({ success: false, message: "A verified payment reference is required for manual activation." });
    // Declare payment for use by the surrounding module or function.
    const payment = await SubscriptionPayment.create({ tenantId, userId: req.user._id, plan, amount, provider: "manual", status: "pending", periodDays: days, transactionReference: reference, metadata: { approvedBy: req.user._id, note: req.body?.note || "" } });
    // Declare result for use by the surrounding module or function.
    const result = await activateTenantSubscription({ tenantId, plan, provider: "manual", periodDays: days, payment, transactionReference: reference });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `Subscription activated for ${days} days.`, tenant: result.organization, payment });
  } catch (error) { next(error); }
};

// Declare switchTenantSubscription for use by the surrounding module or function.
export const switchTenantSubscription = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isPlatformSuperAdmin(req.user)) and run the matching branch.
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can switch tenant subscription plans." });
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = req.params.id;
    // Declare plan for use by the surrounding module or function.
    const plan = String(req.body?.plan || "").toLowerCase();
    // Check the condition (!plan) and run the matching branch.
    if (!plan) return res.status(400).json({ success: false, message: "A subscription plan is required." });
    // Declare result for use by the surrounding module or function.
    const result = await switchTenantSubscriptionPlan({ tenantId, plan });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: `${result.organization.name} switched from ${result.previousPlan} to ${result.plan} for testing. Existing renewal period was preserved.`, tenant: result.organization, subscription: result.subscription });
  } catch (error) { next(error); }
};

// Declare listSubscriptionPayments for use by the surrounding module or function.
export const listSubscriptionPayments = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isPlatformSuperAdmin(req.user)) and run the matching branch.
    if (!isPlatformSuperAdmin(req.user)) return res.status(403).json({ success: false, message: "Only the platform SuperAdmin can view all subscription payments." });
    // Declare payments for use by the surrounding module or function.
    const payments = await SubscriptionPayment.find({}).sort({ createdAt: -1 }).limit(100).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, payments });
  } catch (error) { next(error); }
};
