import express from "express";
import TaxProfile from "../models/TaxProfile.js";
import ComplianceRecord from "../models/ComplianceRecord.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/permissionMiddleware.js";
import { requireTenantId } from "../tenancy/context.js";

const router = express.Router();
router.use(protect);
router.use(authorize("finance.view"));

router.get("/", async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const [tax, records] = await Promise.all([
      TaxProfile.findOne({ tenantId }).lean(),
      ComplianceRecord.find({ tenantId }).lean(),
    ]);
    const byType = new Map(records.map((item) => [item.type, item]));
    const approved = (type) => byType.get(type)?.status === "approved";
    const configured = Boolean(tax?.kraPin);
    const etimsReady = Boolean(tax?.etimsEnabled && configured && tax?.etimsSolution && tax?.etimsDeviceId);
    const checks = [
      { key: "kra", label: "KRA PIN configured", ready: configured },
      { key: "etims", label: "eTIMS production configuration", ready: etimsReady },
      { key: "tra", label: "TRA licence record approved", ready: approved("TRA_LICENSE") },
      { key: "privacy", label: "Privacy policy approved", ready: approved("PRIVACY_POLICY") },
      { key: "retention", label: "Data retention approved", ready: approved("DATA_RETENTION") },
      { key: "odpc", label: "ODPC registration record reviewed", ready: ["approved", "submitted"].includes(byType.get("ODPC_REGISTRATION")?.status) },
    ];
    const readyCount = checks.filter((item) => item.ready).length;
    res.json({ success: true, data: { country: "KE", readyCount, totalChecks: checks.length, productionReady: readyCount === checks.length, checks } });
  } catch (error) {
    next(error);
  }
});

export default router;
