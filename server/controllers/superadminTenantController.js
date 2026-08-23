import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";

export const deleteTenant = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    const confirmation = String(req.body?.confirmation || "").trim();
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid tenant id" });
    if (confirmation !== "DELETE") return res.status(400).json({ success: false, message: 'Permanent tenant deletion requires confirmation="DELETE".' });

    const tenant = await Tenant.findById(id).lean();
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    if (tenant.isSystem || tenant.slug === "system" || tenant.slug === "platform") {
      return res.status(403).json({ success: false, message: "The platform/system tenant cannot be deleted" });
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    await session.withTransaction(async () => {
      for (const info of collections) {
        if (info.name === "tenants" || info.name.startsWith("system.")) continue;
        const collection = db.collection(info.name);
        if (await collection.findOne({ tenantId: tenant._id }, { session })) {
          await collection.deleteMany({ tenantId: tenant._id }, { session });
        }
      }
      await User.deleteMany({ tenant: tenant._id }, { session });
      await Tenant.deleteOne({ _id: tenant._id }, { session });
    });

    return res.json({ success: true, message: `Tenant "${tenant.name || tenant.slug || id}" deleted successfully`, tenantId: String(tenant._id) });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
