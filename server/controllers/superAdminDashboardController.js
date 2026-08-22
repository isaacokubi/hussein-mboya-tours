import { runWithTenant } from "../tenancy/context.js";
import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Role from "../models/Role.js";

export const getSuperAdminDashboard = async (req, res) => {
  try {
    const data = await runWithTenant(
      {
        tenantId: null,
        tenant: null,
        bypass: true,
        role: "super_admin",
      },
      async () => {
        const adminRoleIds = await Role.find({
          name: { $in: ["admin", "administrator", "superadmin", "super_admin"] },
        }).distinct("_id");

        const [users, staff, agents, vehicles, bookings, admins] = await Promise.all([
          User.countDocuments(),
          Staff.countDocuments(),
          Agent.countDocuments(),
          Vehicle.countDocuments(),
          Booking.countDocuments(),
          User.countDocuments({
            $or: [
              { role: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
              { legacyRole: { $in: ["admin", "administrator", "superadmin", "super_admin"] } },
              ...(adminRoleIds.length ? [{ roleId: { $in: adminRoleIds } }] : []),
            ],
          }),
        ]);

        return {
          users,
          staff,
          agents,
          vehicles,
          bookings,
          admins,
        };
      }
    );

    return res.status(200).json({
      success: true,
      stats: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, Number(value) || 0])
      ),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SuperAdmin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load SuperAdmin dashboard.",
    });
  }
};
