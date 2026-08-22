import { mergeTenantFilter } from "../tenancy/context.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import buildPermissions from "../utils/buildPermissions.js";
<<<<<<< HEAD
import { normalizeRole } from "../utils/roleUtils.js";

=======
import { sendSMS } from "../services/smsService.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const normalizeRole = (value) => String(value?.name || value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

const effectiveRoleForUser = (user) => {
  const durable = normalizeRole(user?.role);
  if (durable) return durable;
  const legacy = normalizeRole(user?.legacyRole);
  if (legacy) return legacy;
  return normalizeRole(user?.roleId) || "customer";
};

const publicUser = (user, permissions = []) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: effectiveRoleForUser(user),
  tenantId: user.tenantId || null,
  permissions,
  profileImage: user.profileImage,
  status: user.status,
  isVerified: user.isVerified,
  loyaltyPoints: user.loyaltyPoints,
  referralCode: user.referralCode,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});
>>>>>>> feat/first-admin-superadmin-onboarding

export const login = async (req, res) => {
  try {
<<<<<<< HEAD

    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();

    console.log("LOGIN DEBUG TENANT:", {
      tenantId: req.tenantId,
      tenant: req.tenant?.slug,
      email
    });

    const password = String(req.body?.password || "");

    const tenantId =
      req.tenantId ||
      req.headers["x-tenant-id"] ||
      null;

    const userQuery = {
      email
    };

    if (tenantId) {
      userQuery.tenantId = tenantId;
    }
=======
    const normalizedEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!normalizedEmail || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
>>>>>>> feat/first-admin-superadmin-onboarding

    console.log("LOGIN QUERY:", userQuery);

    const user = await User.findOne(userQuery)
      .select("+password")
      .populate({
        path: "roleId",
        populate: {
          path: "permissions"
        }
      })
      .populate("permissionsOverride");

<<<<<<< HEAD

    if (!user || !(await user.matchPassword(password))) {

      return res.status(401).json({
        success:false,
        message:"Invalid email or password"
      });
=======
    if (!user) {
      await SecurityLog.create({ email: normalizedEmail, action: "login_failed", resource: "Authentication", description: "Failed authentication attempt", severity: "high", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User not found" });
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    if (user.status !== "active") return res.status(403).json({ success: false, message: `Account ${user.status}.` });
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(423).json({ success: false, message: "Account temporarily locked due to multiple failed login attempts." });
>>>>>>> feat/first-admin-superadmin-onboarding

    }

<<<<<<< HEAD

    const role = normalizeRole(
      user.roleId?.name ||
      user.role ||
      user.legacyRole
    );


    const permissions = buildPermissions(user);


    const token = generateToken({

      _id: user._id,

      roleId: user.roleId?._id || user.roleId,

      role,

      email: user.email,
      tenantId: user.tenantId || null,

      permissions

    });



    return res.json({

      success:true,

      token,

      user:{

        _id:user._id,

        name:user.name,

        email:user.email,

        phone:user.phone,

        role,

        tenantId:user.tenantId || null,

        permissions,

        status:user.status

      }

    });


  } catch(error){

    console.error("LOGIN ERROR:",error);

    return res.status(500).json({
      success:false,
      message:"Login failed"
    });

=======
    const effectiveRole = effectiveRoleForUser(user);
    const permissions = buildPermissions({ ...user.toObject(), role: effectiveRole, roleId: user.roleId, permissionsOverride: user.permissionsOverride });
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken({ _id: user._id, role: effectiveRole, roleId: user.roleId, email: user.email, permissions, tenantId: user.tenantId || null });
    await createAuditLog({ user: user._id, action: "login", resource: "Authentication", description: "User successfully logged in", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"] });
    await SecurityLog.create({ user: user._id, email: user.email, action: "login_success", resource: "Authentication", description: "User successfully logged in", severity: "medium", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "Login successful" });
    return res.status(200).json({ success: true, token, user: publicUser(user, permissions) });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    next(error);
>>>>>>> feat/first-admin-superadmin-onboarding
  }

};

<<<<<<< HEAD


export const customerLogin = login;
export default login;


export const register = async (req,res,next)=>{
  try{
    const {name,email,phone,password}=req.body||{};

    if(!name||!email||!phone||!password){
      return res.status(400).json({
        success:false,
        message:"All fields are required."
      });
    }

    const exists = await User.findOne({
      $or:[
        {email:String(email).toLowerCase()},
        {phone}
      ]
    });

    if(exists){
      return res.status(400).json({
        success:false,
        message:"User already exists."
      });
    }

    const user = await User.create({
      name,
      email:String(email).toLowerCase(),
      phone,
      password,
      role:"customer",
      legacyRole:"customer",
      tenantId:req.tenantId || null,
      status:"active"
    });


    const token = generateToken({
      _id:user._id,
      role:"customer",
      email:user.email,
      tenantId:user.tenantId || null,
      permissions:[]
    });


    return res.status(201).json({
      success:true,
      token,
      user
    });


  }catch(error){
=======
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = String(phone || "").trim();
    if (!name || !normalizedEmail || !normalizedPhone || !password) return res.status(400).json({ success: false, message: "All fields are required." });
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    if (!/^\d{10}$/.test(normalizedPhone)) return res.status(400).json({ success: false, message: "Phone number must contain exactly 10 digits." });
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) return res.status(400).json({ success: false, message: "Password must be at least 8 characters and include an uppercase letter and a number." });
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
    if (existingUser) return res.status(400).json({ success: false, message: existingUser.email === normalizedEmail ? "Email is already registered." : "Phone number is already registered." });
    const customerRole = await Role.findOne({ name: "customer" });
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, phone: normalizedPhone, password, status: "active", isVerified: true, role: "customer", roleId: customerRole?._id || null, legacyRole: "customer" });
    await SecurityLog.create({ user: user._id, email: user.email, action: "register", resource: "Authentication", description: "User registration", ipAddress: req.ip, userAgent: req.headers["user-agent"], details: "User registration" });
    const token = generateToken({ _id: user._id, role: "customer", roleId: user.roleId, email: user.email, permissions: [], tenantId: user.tenantId || null });
    return res.status(201).json({ success: true, token, user: publicUser(user, []) });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
>>>>>>> feat/first-admin-superadmin-onboarding
    next(error);
  }
};



export const getMe = async(req,res)=>{
  const user = await User.findById(req.user._id)
    .populate("roleId")
    .populate("tenantId");

  if(!user){
    return res.status(404).json({
      success:false,
      message:"User not found"
    });
  }

  res.json({
    success:true,
    user:{
      ...user.toObject(),
      tenantId:user.tenantId?._id || null,
      tenantSlug:user.tenantId?.slug || null
    }
  });
};



export const changePassword = async(req,res,next)=>{
try{

const user=await User.findById(req.user._id)
.select("+password");

if(!user)
return res.status(404).json({
 success:false,
 message:"User not found"
});


const ok=await user.matchPassword(
 req.body.currentPassword
);

if(!ok)
return res.status(401).json({
 success:false,
 message:"Current password incorrect"
});


user.password=req.body.newPassword;

await user.save();


res.json({
 success:true,
 message:"Password changed successfully"
});


}catch(e){
next(e);
}

};



export const requestPasswordReset = async(req,res)=>{
res.json({
success:true,
message:"Reset code request accepted"
});
};



export const resetPasswordWithCode = async(req,res)=>{
res.json({
success:true,
message:"Password reset accepted"
});
};

