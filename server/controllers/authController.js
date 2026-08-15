import { createAuditLog } from "../services/auditService.js";
import { getSystemSettings } from "../services/settingsService.js";

import crypto from "crypto";

import "../models/Role.js";
import "../models/Permission.js";

import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";

import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    })
      .select("+password")
      .populate({
        path: "roleId",
        populate: {
          path: "permissions",
        },
      })
      .populate("permissionsOverride");

    if (!user) {
      await SecurityLog.create({
        email: normalizedEmail,
        action: "login_failed",
        resource: "Authentication",
        description: "Failed authentication attempt",
        severity: "high",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: "User not found",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account ${user.status}`,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Account Lock Check
    |--------------------------------------------------------------------------
    */

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({
        success: false,
        message:
          "Account temporarily locked due to multiple failed login attempts.",
      });
    }

    const passwordMatch = await user.matchPassword(password);

    if (!passwordMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
      }

      await user.save();

      await SecurityLog.create({
        user: user._id,
        email: user.email,
        action: "login_failed",
        resource: "Authentication",
        description: "Failed authentication attempt",
        severity: "high",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: "Invalid password",
      });

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Successful Login
    |--------------------------------------------------------------------------
    */

    
await createAuditLog({

user:user._id,

action:"login",

resource:"Authentication",

description:
"User successfully logged in",

severity:"medium",

ipAddress:req.ip,

userAgent:req.headers["user-agent"]

});


user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();

    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date(),
    });

    const permissions = buildPermissions(user);

const effectiveRole =
  user.roleId?.name ||
  user.role ||
  user.legacyRole ||
  "customer";

const token = generateToken({
  _id: user._id,
  role: effectiveRole,
  roleId: user.roleId,
  email: user.email,
  permissions,
});

    await SecurityLog.create({
      user: user._id,
      email: user.email,
      action: "login_success",
      resource: "Authentication",
      description: "User successfully logged in",
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: "Login successful",
    });

    return res.status(200).json({
      success: true,

      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: effectiveRole,
        permissions,
        status: user.status,
        isVerified: user.isVerified,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Required Fields
    |--------------------------------------------------------------------------
    */

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Phone Validation
    |--------------------------------------------------------------------------
    */

    const normalizedPhone = String(phone).trim();

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Password Validation
    |--------------------------------------------------------------------------
    */

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number.",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain an uppercase letter.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const customerRole = await Role.findOne({ name: "customer" });

    /*
    |--------------------------------------------------------------------------
    | Generate Referral Code
    |--------------------------------------------------------------------------
    */

    const referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | Create User
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      status: "active",
      isVerified: true,

      referralCode,

      profileImage: {
        url: "",
        publicId: "",
      },

      role: "customer",

      roleId: customerRole?._id || null,

      legacyRole: "customer",

      status: "active",
    });

    /*
    |--------------------------------------------------------------------------
    | Security Log
    |--------------------------------------------------------------------------
    */

    await SecurityLog.create({
      user: user._id,
      email: user.email,
      action: "register",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: "User registration",
    });

    const effectiveRole =
  user.roleId?.name ||
  user.role ||
  user.legacyRole ||
  "customer";

const token = generateToken({
  _id: user._id,
  role: effectiveRole,
  roleId: user.roleId,
  email: user.email,
  permissions: [],
});

    return res.status(201).json({
      success: true,

      token,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role:
          user.roleId?.name ||
          user.role ||
          user.legacyRole ||
          "customer",
        profileImage: user.profileImage,
        referralCode: user.referralCode,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
|
| GET /api/auth/me
|
|--------------------------------------------------------------------------
*/

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "roleId",
        populate: {
          path: "permissions",
        },
      })
      .populate("permissionsOverride");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const permissions = buildPermissions(user);

    return res.status(200).json({
      success: true,

      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role:
          user.roleId?.name ||
          user.role ||
          user.legacyRole ||
          "customer",
        profileImage: user.profileImage,
        permissions,
        status: user.status,
        isVerified: user.isVerified,
        loyaltyPoints: user.loyaltyPoints,
        referralCode: user.referralCode,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
|--------------------------------------------------------------------------
| REQUEST PASSWORD RESET CODE
|--------------------------------------------------------------------------
*/

export const requestPasswordReset = async (req, res, next) => {

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";
  try {
    const phone = String(req.body?.phone || "").trim();

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter the 10-digit phone number used on your account.",
      });
    }

    const user = await User.findOne({ phone }).select("+passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");

    // Always return the same response for unknown numbers.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists for that phone number, a reset code has been sent.",
      });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    user.passwordResetCodeHash = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetAttempts = 0;
    await user.save({ validateBeforeSave: false });

    const { sendSMS } = await import("../services/smsService.js");
    await sendSMS(
      phone,
      `${companyName} password reset code: ${code}. It expires in 10 minutes. If you did not request this, ignore this message.`
    );

    return res.status(200).json({
      success: true,
      message: "A password reset code has been sent to your phone.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RESET PASSWORD WITH CODE
|--------------------------------------------------------------------------
*/

export const resetPasswordWithCode = async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!/^\d{10}$/.test(phone) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Phone number and 6-digit reset code are required.",
      });
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include an uppercase letter and a number.",
      });
    }

    const user = await User.findOne({ phone }).select("+password +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");

    if (
      !user ||
      !user.passwordResetCodeHash ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "The reset code is invalid or expired.",
      });
    }

    if (Number(user.passwordResetAttempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new code.",
      });
    }

    const hash = crypto.createHash("sha256").update(code).digest("hex");
    if (hash !== user.passwordResetCodeHash) {
      user.passwordResetAttempts = Number(user.passwordResetAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({
        success: false,
        message: "The reset code is invalid or expired.",
      });
    }

    user.password = newPassword;
    user.passwordResetCodeHash = "";
    user.passwordResetExpiresAt = null;
    user.passwordResetAttempts = 0;
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    res.status(200).json({
      success: true,
      message: "Change password endpoint working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
