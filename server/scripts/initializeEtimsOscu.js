import "../config/firestore.js";
import { initializeOscu } from "../services/kraEtimsOscuService.js";

const tenantId = process.env.TENANT_ID;
const environment = process.env.ETIMS_ENVIRONMENT || "sandbox";
const pin = process.env.ETIMS_KRA_PIN;
const branchId = process.env.ETIMS_OSCU_BRANCH_ID || "00";
const deviceSerial = process.env.ETIMS_OSCU_DEVICE_SERIAL;

if (!tenantId || !pin || !deviceSerial) {
  throw new Error("TENANT_ID, ETIMS_KRA_PIN and ETIMS_OSCU_DEVICE_SERIAL are required.");
}

const result = await initializeOscu({ tenantId, environment, pin, branchId, deviceSerial });
console.log(JSON.stringify({
  ok: true,
  environment,
  tenantId,
  credentialRef: result.credentialRef,
  sdcId: result.sdcId,
  mrcNo: result.mrcNo,
  message: "OSCU initialized. The communication key was encrypted and stored server-side; it is not printed."
}, null, 2));
