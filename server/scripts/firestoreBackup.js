import fs from "fs";
import path from "path";
import crypto from "crypto";
import { initializeApp, applicationDefault, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId) throw new Error("FIREBASE_PROJECT_ID is required.");

const privateKey = process.env.FIREBASE_PRIVATE_KEY ? String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n") : "";
const credential = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  : process.env.FIREBASE_CLIENT_EMAIL && privateKey
    ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey })
    : applicationDefault();

if (!getApps().length) initializeApp({ credential, projectId });
const db = getFirestore();

const encode = (value) => {
  if (value instanceof Timestamp) return { __type: "timestamp", value: value.toDate().toISOString() };
  if (value instanceof GeoPoint) return { __type: "geopoint", latitude: value.latitude, longitude: value.longitude };
  if (value instanceof Date) return { __type: "date", value: value.toISOString() };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)]));
  return value;
};

const exportCollection = async (collectionRef, documents) => {
  const snapshot = await collectionRef.get();
  for (const doc of snapshot.docs) {
    documents.push({ path: doc.ref.path, data: encode(doc.data()) });
    const subcollections = await doc.ref.listCollections();
    for (const subcollection of subcollections) await exportCollection(subcollection, documents);
  }
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = process.argv[2] || path.join(process.cwd(), "backup", `firestore-${stamp}.json`);
fs.mkdirSync(path.dirname(output), { recursive: true });

const collections = await db.listCollections();
const documents = [];
for (const collection of collections) await exportCollection(collection, documents);

const payload = {
  format: "global-tours-firestore-backup-v1",
  projectId,
  createdAt: new Date().toISOString(),
  documentCount: documents.length,
  checksum: crypto.createHash("sha256").update(JSON.stringify(documents)).digest("hex"),
  documents,
};

fs.writeFileSync(output, JSON.stringify(payload));
console.log(JSON.stringify({ output, projectId, documentCount: documents.length, checksum: payload.checksum }));
await db.terminate();
