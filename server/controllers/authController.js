import "../models/Role.js";
import "../models/Permission.js";

import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";

import generateToken from "../utils/generateToken.js";

/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

export const login = async (req, res, next) => {
  try {
    const {
      email,

      password,
    } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    })

      .populate({
        path: "roleId",

        populate: {
          path: "permissions",
        },
      })

      .populate({
        path: "permissionsOverride",
      });

    if (!user) {
      await SecurityLog.create({
        email,

        action: "login_failed",

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

    const passwordMatch = await user.matchPassword(password);

    if (!passwordMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await user.save();

      await SecurityLog.create({
        user: user._id,

        email: user.email,

        action: "login_failed",

        ipAddress: req.ip,

        userAgent: req.headers["user-agent"],

        details: "Invalid password",
      });

      return res.status(401).json({
        success: false,

        message: "Invalid email or password",
      });
    }

    user.loginAttempts = 0;

    user.lockUntil = null;

    user.lastLoginAt = new Date();

    await user.save();

    const rolePermissions = user.roleId?.permissions || [];

    const overridePermissions = user.permissionsOverride || [];

    const permissionMap = new Map();

    [...rolePermissions, ...overridePermissions].forEach((permission) => {
      permissionMap.set(
        permission.name,

        permission,
      );
    });

    const permissions = Array.from(permissionMap.values())

      .map((permission) => ({
        name: permission.name,

        label: permission.label,

        path: permission.path,

        icon: permission.icon,

        module: permission.module,
      }));

    const token = generateToken({
      id: user._id,

      role: user.role,

      permissions,
    });

    await SecurityLog.create({
      user: user._id,

      email: user.email,

      action: "login_success",

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

        role: user.role,

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
    console.error(
      "LOGIN ERROR:",

      error,
    );

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
    const {
      name,

      email,

      phone,

      password,
    } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "User already exists",
      });
    }

    const customerRole = await Role.findOne({
      name: "Customer",
    });

    /*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

    const user = await User.create({
      name,

      email: email.toLowerCase(),

      phone,

      password,

      /*
|--------------------------------------------------------------------------
| DEFAULT PROFILE IMAGE
|--------------------------------------------------------------------------
*/

      profileImage: {
        url: "",

        publicId: "",
      },

      role: "customer",

      roleId: customerRole?._id || null,

      legacyRole: "customer",

      status: "active",
    });

    const token = generateToken({
      id: user._id,

      role: user.role,

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

        role: user.role,

        profileImage: user.profileImage,

        status: user.status,
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",

      error,
    );

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

      .populate({
        path: "permissionsOverride",
      });

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found",
      });
    }

    const rolePermissions = user.roleId?.permissions || [];

    const overridePermissions = user.permissionsOverride || [];

    const permissionMap = new Map();

    [...rolePermissions, ...overridePermissions].forEach((permission) => {
      permissionMap.set(
        permission.name,

        permission,
      );
    });

    const permissions = Array.from(permissionMap.values())

      .map((permission) => ({
        name: permission.name,

        label: permission.label,

        path: permission.path,

        icon: permission.icon,

        module: permission.module,
      }));

    return res.status(200).json({
      success: true,

      user: {
        _id: user._id,

        name: user.name,

        email: user.email,

        phone: user.phone,

        role: user.role,

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
    console.error(
      "GET ME ERROR:",

      error,
    );

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
