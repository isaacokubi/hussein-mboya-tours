import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const asObjectId = (id) => new mongoose.Types.ObjectId(id);

const getTenantCounts = async (tenantId) => {
  const db = mongoose.connection.db;
  const collections = ["users", "tours", "tourpackages", "bookings", "payments", "customers", "agents", "staffs", "vehicles", "destinations"];
  const counts = {};
  await Promise.all(collections.map(async (name) => {
    try {
      counts[name] = await db.collection(name).countDocuments({ tenantId: asObjectId(tenantId) });
    } catch {
      counts[name] = 0;
    }
  }));
  return counts;
};

export const listTenants = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const search = String(req.query.search || "").trim();
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { legalName: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { supportEmail: { $regex: search, $options: "i" } },
    ];

    const [organizations, total] = await Promise.all([
      Organization.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Organization.countDocuments(filter),
    ]);

    const tenants = await Promise.all(organizations.map(async (organization) => {
      const counts = await getTenantCounts(organization._id);
      const owner = await User.findOne({ tenantId: organization._id, role: { $in: ["admin", "administrator"] } })
        .select("name email phone status")
        .sort({ createdAt: 1 })
        .lean();
      return { ...organization, owner: owner || null, counts };
    }));

    return res.json({ success: true, tenants, data: tenants, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch (error) { next(error); }
};

export const getTenant = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    const tenant = await Organization.findById(req.params.id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    const owner = await User.findOne({ tenantId: tenant._id, role: { $in: ["admin", "administrator"] } }).select("name email phone status").sort({ createdAt: 1 }).lean();
    return res.json({ success: true, tenant: { ...tenant, owner, counts: await getTenantCounts(tenant._id) } });
  } catch (error) { next(error); }
};

export const updateTenantStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    if (!["active", "suspended", "trial", "cancelled"].includes(status)) return res.status(400).json({ success: false, message: "Invalid company status" });
    const tenant = await Organization.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true, runValidators: true }).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    return res.json({ success: true, tenant, message: `Company status changed to ${status}` });
  } catch (error) { next(error); }
};

export const deleteTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant ID" });
    if (String(req.body?.confirmation || "").trim() !== "DELETE") return res.status(400).json({ success: false, message: "Type DELETE to permanently remove this company." });

    const tenant = await Organization.findById(id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Company not found" });
    if (!tenant.tenantId && tenant.slug === "platform") return res.status(403).json({ success: false, message: "The platform organization cannot be deleted." });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    await session.withTransaction(async () => {
      for (const { name } of collections) {
        if (name.startsWith("system.") || name === "organizations") continue;
        await db.collection(name).deleteMany({ tenantId: asObjectId(id) }, { session });
      }
      await Organization.deleteOne({ _id: id }, { session });
    });

    return res.json({ success: true, deleted: true, tenantId: id, message: `Company "${tenant.name}" deleted successfully.` });
  } catch (error) { next(error); } finally { await session.endSession(); }
};
