import mongoose from "mongoose";
import User from "../models/User.js";
import Organization from "../models/Organization.js";

const EMAILS = [
  "admin1@globaltours.test",
  "admin2@globaltours.test",
];

const PASSWORDS = [
  "GlobalTours_Admin_2026!A7",
  "GlobalTours_Admin_2026!B9",
];

await mongoose.connect(process.env.MONGODB_URI);

const org = await Organization.findOne({
  _id: new mongoose.Types.ObjectId("6a87fe1bc3f48c3dcddf4a23"),
});

if (!org) throw new Error("Global Tours organization not found.");

for (let i = 0; i < EMAILS.length; i += 1) {
  const existing = await User.findOne({ email: EMAILS[i] }).setOptions({ skipTenantIsolation: true });
  if (existing) throw new Error(`User already exists: ${EMAILS[i]}`);

  await User.create({
    name: `Global Tours Admin ${i + 1}`,
    email: EMAILS[i],
    phone: i === 0 ? "0712345678" : "0723456789",
    password: PASSWORDS[i],
    role: "admin",
    legacyRole: "admin",
    tenantId: org._id,
    status: "active",
    isVerified: true,
    loginAttempts: 0,
    lockUntil: null,
  });
}

const verify = await User.find({ email: { $in: EMAILS } }).setOptions({ skipTenantIsolation: true });
for (let i = 0; i < EMAILS.length; i += 1) {
  const user = verify.find((item) => item.email === EMAILS[i]);
  if (!user || String(user.tenantId) !== String(org._id)) throw new Error(`Tenant verification failed for ${EMAILS[i]}`);
  if (!(await user.matchPassword(PASSWORDS[i]))) throw new Error(`Password verification failed for ${EMAILS[i]}`);
}

console.log("Created and verified:");
console.log(`${EMAILS[0]} / ${PASSWORDS[0]}`);
console.log(`${EMAILS[1]} / ${PASSWORDS[1]}`);
await mongoose.disconnect();
