import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";
import { createAuditLog } from "../services/auditService.js";

const ALLOWED_ROLES = {
  admin: {
    name: "admin",
    displayName: "Admin",
  },
  manager: {
    name: "manager",
    displayName: "Tour Manager",
  },
  tour_guide: {
    name: "tour_guide",
    displayName: "Tour Guide",
  },
  driver: {
    name: "driver",
    displayName: "Driver",
  },
  agent: {
    name: "agent",
    displayName: "Travel Agent",
  },
  customer: {
    name: "customer",
    displayName: "Customer",
  },
};

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  const aliases = {
    administrator: "admin",
    admin: "admin",

    "tour manager": "manager",
    manager: "manager",

    "tour guide": "tour_guide",
    guide: "tour_guide",
    tour_guide: "tour_guide",

    driver: "driver",

    "travel agent": "agent",
    agent: "agent",

    customer: "customer",
  };

  return aliases[value] || value;
};

const normalizePhone = (phone) =>
  String(phone || "").replace(/\D/g, "").trim();

const validatePassword = (password) => {
  const value = String(password || "");

  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/\d/.test(value)) {
    return "Password must contain at least one number.";
  }

  return null;
};

export const createCompanyAccount = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /*
     * authMiddleware/roleUtils normalizes Super Admin to "superadmin".
     * Accept the canonical authenticated role instead of relying on the
     * legacy database spelling "super_admin".
     */
    const authenticatedRole = String(
      req.userRole || req.user.role || ""
    ).trim().toLowerCase();

    if (
      authenticatedRole !== "superadmin" &&
      authenticatedRole !== "super_admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can create company accounts.",
      });
    }

    const tenantId = req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: "Super Admin is not associated with a tenant.",
      });
    }

    const {
      name,
      email,
      phone,
      password,
      role,
    } = req.body || {};

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    const canonicalRole = normalizeRole(role);

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits.",
      });
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError,
      });
    }

    /*
     * Never allow creation of another Super Admin from this screen.
     */
    if (
      canonicalRole === "super_admin" ||
      String(role || "").toLowerCase().includes("super")
    ) {
      return res.status(403).json({
        success: false,
        message: "Super Admin accounts cannot be created from this screen.",
      });
    }

    const roleDefinition = ALLOWED_ROLES[canonicalRole];

    if (!roleDefinition) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid account type. Allowed types are Admin, Tour Manager, Tour Guide, Driver, Travel Agent and Customer.",
      });
    }

    /*
     * Role must belong to the approved system-role set.
     * This prevents arbitrary role injection.
     */
    const roleDocument = await Role.findOne({
      name: roleDefinition.name,
      status: "active",
    });

    if (!roleDocument) {
      return res.status(500).json({
        success: false,
        message: `Required system role '${roleDefinition.name}' was not found.`,
      });
    }

    /*
     * Never trust tenantId supplied by the frontend.
     *
     * The tenant ALWAYS comes from the authenticated Super Admin.
     */
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    })
      .select("_id email")
      .lean();

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "A user with this email address already exists.",
      });
    }

    const existingPhone = await User.findOne({
      phone: normalizedPhone,
    })
      .select("_id phone")
      .lean();

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "A user with this phone number already exists.",
      });
    }

    const createdUser = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: roleDefinition.name,
      roleId: roleDocument._id,
      legacyRole: roleDefinition.name,
      tenantId,
      status: "active",
      isVerified: true,
    });

    /*
     * SECURITY LOG
     */
    await SecurityLog.create({
      user: req.user._id,
      email: req.user.email,
      action: "account_created",
      resource: "User",
      description: `Super Admin created ${roleDefinition.displayName} account ${normalizedEmail}.`,
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      details: `Created user ${createdUser._id} for tenant ${tenantId}.`,
    });

    /*
     * AUDIT LOG
     */
    await createAuditLog({
      user: req.user._id,
      action: "create",
      resource: "User",
      resourceId: createdUser._id.toString(),
      description: `Super Admin created ${roleDefinition.displayName} account.`,
      severity: "medium",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      method: req.method,
      endpoint: req.originalUrl,
      metadata: {
        event: "company_account_created",
        tenantId: tenantId.toString(),
        createdUserId: createdUser._id.toString(),
        createdUserEmail: createdUser.email,
        createdRole: roleDefinition.name,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${roleDefinition.displayName} account created successfully.`,
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        role: createdUser.role,
        roleId: createdUser.roleId,
        tenantId: createdUser.tenantId,
        status: createdUser.status,
        isVerified: createdUser.isVerified,
      },
    });
  } catch (error) {
    console.error("SUPER ADMIN CREATE COMPANY ACCOUNT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with one of these unique details already exists.",
      });
    }

    next(error);
  }
};
