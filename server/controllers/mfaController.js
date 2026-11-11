/**
 * Purpose: mfa Controller HTTP controller. Main declarations: isCustomer, createCustomerLoginChallenge, sendCustomerLoginPin, verifyCustomerLoginPin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import User from "../models/User.js";
// Load ../models/Organization.js so this module can use its exported dependencies.
import Organization from "../models/Organization.js";
// Load ../services/auditService.js so this module can use its exported dependencies.
import { createAuditLog } from "../services/auditService.js";
// Load ../services/mfaService.js so this module can use its exported dependencies.
import { generateLoginPin, hashLoginPin, verifyLoginPin, normalizeMfaPhone } from "../services/mfaService.js";
// Load ../services/smsService.js so this module can use its exported dependencies.
import { sendSMS } from "../services/smsService.js";
// Load ../utils/generateToken.js so this module can use its exported dependencies.
import generateToken from "../utils/generateToken.js";
// Load ../utils/buildPermissions.js so this module can use its exported dependencies.
import buildPermissions from "../utils/buildPermissions.js";
// Load ../utils/authCookie.js so this module can use its exported dependencies.
import { setAuthCookie } from "../utils/authCookie.js";

// Declare MAX_MFA_ATTEMPTS for use by the surrounding module or function.
const MAX_MFA_ATTEMPTS = 5;
// Declare MFA_EXPIRY_MS for use by the surrounding module or function.
const MFA_EXPIRY_MS = 5 * 60 * 1000;
// Declare MFA_RESEND_DELAY_MS for use by the surrounding module or function.
const MFA_RESEND_DELAY_MS = 30 * 1000;

// Declare isCustomer for use by the surrounding module or function.
const isCustomer = (user) => {
  // Declare role for use by the surrounding module or function.
  const role = String(user?.roleId?.name || user?.role || user?.legacyRole || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  // Return the expression shown below to the caller.
  return role === "customer";
};

// Declare createCustomerLoginChallenge for use by the surrounding module or function.
export const createCustomerLoginChallenge = async (user) => {
  // Check the condition (!user?._id) and run the matching branch.
  if (!user?._id) throw new Error("Invalid MFA user.");
  // Declare phone for use by the surrounding module or function.
  const phone = normalizeMfaPhone(user.phone);
  // Check the condition (!phone) and run the matching branch.
  if (!phone) throw new Error("This account does not have a valid registered phone number.");

  // Declare now for use by the surrounding module or function.
  const now = Date.now();
  // Check the condition (user.loginPinLastSentAt && now - new Date(user.loginPinLastSentAt).get) and run the matching branch.
  if (user.loginPinLastSentAt && now - new Date(user.loginPinLastSentAt).getTime() < MFA_RESEND_DELAY_MS) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Please wait before requesting another verification PIN.");
  }

  // Declare pin for use by the surrounding module or function.
  const pin = generateLoginPin();
  // Perform the side effect or state update expressed on the following line.
  user.loginPinHash = await hashLoginPin(pin);
  // Perform the side effect or state update expressed on the following line.
  user.loginPinExpiresAt = new Date(now + MFA_EXPIRY_MS);
  // Perform the side effect or state update expressed on the following line.
  user.loginPinAttempts = 0;
  // Perform the side effect or state update expressed on the following line.
  user.loginPinLastSentAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  await user.save({ validateBeforeSave: false });

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare companyName for use by the surrounding module or function.
    let companyName = "Your Travel Company";

    // Check the condition (user.tenantId) and run the matching branch.
    if (user.tenantId) {
      // Declare organization for use by the surrounding module or function.
      const organization = await Organization.findById(user.tenantId)
        .select("name")
        .lean();

      // Check the condition (organization?.name) and run the matching branch.
      if (organization?.name) {
        // Perform the side effect or state update expressed on the following line.
        companyName = organization.name;
      }
    }

    // Perform the side effect or state update expressed on the following line.
    await sendSMS(
      phone,
      `Your ${companyName} login PIN is ${pin}. It expires in 5 minutes. Do not share this PIN with anyone.`
    );
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    user.loginPinHash = "";
    // Perform the side effect or state update expressed on the following line.
    user.loginPinExpiresAt = null;
    // Perform the side effect or state update expressed on the following line.
    user.loginPinAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    await user.save({ validateBeforeSave: false });
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Return the object assembled below to the caller.
  return { userId: user._id, phone, pin };
};

// Declare sendCustomerLoginPin for use by the surrounding module or function.
export const sendCustomerLoginPin = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare userId for use by the surrounding module or function.
    const userId = String(req.body?.userId || "").trim();
    // Check the condition (!userId) and run the matching branch.
    if (!userId) return res.status(400).json({ success: false, message: "MFA user ID is required." });
    // Declare user for use by the surrounding module or function.
    const user = await User.findById(userId).select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt");
    // Check the condition (!user || !isCustomer(user)) and run the matching branch.
    if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });

    // Declare challenge for use by the surrounding module or function.
    const challenge = await createCustomerLoginChallenge(user);
    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      mfaRequired: true,
      userId: user._id,
      devPin: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true" ? challenge.pin : undefined,
      message: String(process.env.MFA_DEV_MODE || "").toLowerCase() === "true"
        ? `Development PIN: ${challenge.pin}`
        : "A 4-digit verification PIN has been sent to your registered phone."
    });
  } catch (error) {
    // Check the condition (error.message.includes("wait before requesting")) and run the matching branch.
    if (error.message.includes("wait before requesting")) return res.status(429).json({ success: false, message: error.message });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare verifyCustomerLoginPin for use by the surrounding module or function.
export const verifyCustomerLoginPin = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare userId for use by the surrounding module or function.
    const userId = String(req.body?.userId || "").trim();
    // Declare pin for use by the surrounding module or function.
    const pin = String(req.body?.pin || "").trim();
    // Check the condition (!userId || !/^\d{4}$/.test(pin)) and run the matching branch.
    if (!userId || !/^\d{4}$/.test(pin)) return res.status(400).json({ success: false, message: "User ID and 4-digit PIN are required." });

    // Declare user for use by the surrounding module or function.
    const user = await User.findById(userId)
      .select("+loginPinHash +loginPinExpiresAt +loginPinAttempts +loginPinLastSentAt")
      .populate({ path: "roleId", populate: { path: "permissions" } })
      .populate("permissionsOverride");

    // Check the condition (!user || !isCustomer(user)) and run the matching branch.
    if (!user || !isCustomer(user)) return res.status(401).json({ success: false, message: "Invalid MFA request." });
    // Check the condition (!user.loginPinHash || !user.loginPinExpiresAt) and run the matching branch.
    if (!user.loginPinHash || !user.loginPinExpiresAt) return res.status(400).json({ success: false, message: "No active login PIN exists. Request a new PIN." });

    // Check the condition (new Date(user.loginPinExpiresAt).getTime() < Date.now()) and run the matching branch.
    if (new Date(user.loginPinExpiresAt).getTime() < Date.now()) {
      // Perform the side effect or state update expressed on the following line.
      user.loginPinHash = "";
      // Perform the side effect or state update expressed on the following line.
      user.loginPinExpiresAt = null;
      // Perform the side effect or state update expressed on the following line.
      user.loginPinAttempts = 0;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "The login PIN has expired. Request a new PIN." });
    }

    // Declare attempts for use by the surrounding module or function.
    const attempts = Number(user.loginPinAttempts || 0);
    // Check the condition (attempts >= MAX_MFA_ATTEMPTS) and run the matching branch.
    if (attempts >= MAX_MFA_ATTEMPTS) return res.status(429).json({ success: false, message: "Too many incorrect PIN attempts. Request a new PIN." });

    // Declare valid for use by the surrounding module or function.
    const valid = await verifyLoginPin(pin, user.loginPinHash);
    // Check the condition (!valid) and run the matching branch.
    if (!valid) {
      // Perform the side effect or state update expressed on the following line.
      user.loginPinAttempts = attempts + 1;
      // Perform the side effect or state update expressed on the following line.
      await user.save({ validateBeforeSave: false });
      // Return the result of res.status(401).json() to the caller.
      return res.status(401).json({ success: false, message: "Incorrect verification PIN.", attemptsRemaining: Math.max(0, MAX_MFA_ATTEMPTS - user.loginPinAttempts) });
    }

    // Declare permissions for use by the surrounding module or function.
    const permissions = buildPermissions(user);
    // Declare effectiveRole for use by the surrounding module or function.
    const effectiveRole = String(user.roleId?.name || user.role || user.legacyRole || "customer").trim().toLowerCase().replace(/[\s-]+/g, "_");

    // Perform the side effect or state update expressed on the following line.
    user.loginPinHash = "";
    // Perform the side effect or state update expressed on the following line.
    user.loginPinExpiresAt = null;
    // Perform the side effect or state update expressed on the following line.
    user.loginPinAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    user.loginAttempts = 0;
    // Perform the side effect or state update expressed on the following line.
    user.lockUntil = null;
    // Perform the side effect or state update expressed on the following line.
    user.lastLoginAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    await user.save({ validateBeforeSave: false });

    // Declare token for use by the surrounding module or function.
    const token = generateToken({
      _id: user._id,
      role: effectiveRole,
      roleId: user.roleId,
      email: user.email,
      permissions,
      tenantId: user.tenantId || req.headers["x-tenant-id"] || null
    });

    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({
      user: user._id,
      action: "mfa_verified",
      resource: "Authentication",
      description: "Customer successfully completed MFA verification.",
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    // Perform the side effect or state update expressed on the following line.
    setAuthCookie(res, token);

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      mfaVerified: true,
      token,
      user: { ...user.toObject(), password: undefined, loginPinHash: undefined, loginPinExpiresAt: undefined, loginPinAttempts: undefined, loginPinLastSentAt: undefined, permissions, role: effectiveRole }
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
