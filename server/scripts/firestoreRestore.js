import fs from "fs";
import crypto from "crypto";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";

const input = process.argv[2];
if (!input) throw new Error("Usage: node scripts/firestoreRestore.js <backup.json>");
if (process.env.RESTORE_TARGET_ISOLATED !== "true") throw new Error("RESTORE_TARGET_ISOLATED must be exactly true.");
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const productionProjectId = process.env.PRODUCTION_FIREBASE_PROJECT_ID;
if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required.");
if (!productionProjectId) throw new Error("PRODUCTION_FIREBASE_PROJECT_ID is required.");
if (projectId === productionProjectId) throw new Error("Restore target must not equal the production Firebase project.");

const privateKey = process.env.FIREBASE_PRIVATE_KEY ? String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n") : "";
const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : process.env.FIREBASE_CLIENT_EMAIL && privateKey
    ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey })
    : applicationDefault();

if (!getApps().length) initializeApp({ credential, projectId });
const db = getFirestore();
const payload = JSON.parse(fs.readFileSync(input, "utf8"));

if (payload.format !== "global-tours-firestore-backup-v1") throw new Error("Unsupported backup format.");
const expectedChecksum = crypto.createHash("sha256").update(JSON.stringify(payload.documents || [])).digest("hex");
if (expectedChecksum !== payload.checksum) throw new Error("Backup checksum verification failed.");

const decode = (value) => {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") {
    if (value.__type === "timestamp") return Timestamp.fromDate(new Date(value.value));
    if (value.__type === "geopoint") return new GeoPoint(Number(value.latitude), Number(value.longitude));
    if (value.__type === "date") return new Date(value.value);
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decode(v)]));
  }
  return value;
};

const documents = payload.documents || [];
for (let i = 0; i < documents.length; i += 400) {
  const batch = db.batch();
  for (const item of documents.slice(i, i + 400)) {
    if (!item?.path || item.path.split("/").length % 2 !== 0) throw new Error(`Invalid document path: ${item?.path}`);
    batch.set(db.doc(item.path), decode(item.data), { merge: false });
  }
  await batch.commit();
}

const collectionNames = new Set(documents.map((item) => item.path.split("/")[0]));
const counts = {};
for (const collectionName of collectionNames) counts[collectionName] = (await db.collection(collectionName).get()).size;

const organizationIds = new Set((await db.collection("organization").get()).docs.map((doc) => doc.id));
let tenantScopedDocuments = 0;
let invalidTenantReferences = 0;
for (const item of documents) {
  const tenantId = item?.data?.tenantId;
  if (tenantId == null || tenantId === "") continue;
  tenantScopedDocuments += 1;
  if (!organizationIds.has(String(tenantId))) invalidTenantReferences += 1;
}
if (invalidTenantReferences > 0) throw new Error(`Restore tenant-isolation validation failed: ${invalidTenantReferences} documents reference missing organizations.`);

console.log(JSON.stringify({
  restoredProjectId: projectId,
  sourceProjectId: payload.projectId,
  documentCount: documents.length,
  topLevelCollections: Object.keys(counts).length,
  collectionCounts: counts,
  tenantIsolation: { tenantScopedDocuments, invalidTenantReferences, validated: true },
  checksum: payload.checksum,
}));

await db.terminate();
