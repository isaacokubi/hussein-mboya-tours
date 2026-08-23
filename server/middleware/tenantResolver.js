import Tenant from "../models/Tenant.js";

const normalizeHost = (host = "") => host.split(":")[0].trim().toLowerCase();

export const resolveTenant = async (req, res, next) => {
  try {
    const host = normalizeHost(req.headers.host);
    const platformHost = (process.env.PLATFORM_HOST || "globaltours.com").toLowerCase();
    const platformHosts = new Set([platformHost, `www.${platformHost}`, "localhost", "127.0.0.1"]);

    if (!host || platformHosts.has(host)) return next();

    const suffix = `.${platformHost}`;
    const slug = host.endsWith(suffix) ? host.slice(0, -suffix.length) : null;
    const customDomain = host.startsWith("www.") ? host.slice(4) : host;

    const query = slug
      ? { slug }
      : { $or: [{ customDomain }, { customDomain: host }] };

    const tenant = await Tenant.findOne({
      ...query,
      status: { $in: ["active", "trial"] },
    }).lean();

    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found for this hostname" });

    req.tenant = tenant;
    req.tenantId = tenant._id;
    next();
  } catch (error) {
    next(error);
  }
};

export default resolveTenant;
