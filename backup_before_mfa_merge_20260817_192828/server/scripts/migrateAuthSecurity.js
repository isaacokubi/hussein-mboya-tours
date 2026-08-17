import mongoose from "mongoose";
import User from "../models/User.js";

const PHONE = "0707476586";

const normalizeEmail = (email) => {
  if (!email) return email;

  return String(email)
    .trim()
    .toLowerCase();
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured in server/.env"
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected to MongoDB.");

  const users = await User.find({})
    .select("_id email phone role");

  console.log(`Users found: ${users.length}`);

  let phoneUpdated = 0;
  let emailNormalized = 0;

  const duplicateEmails = [];

  const seenEmails = new Map();

  for (const user of users) {
    const email = normalizeEmail(user.email);

    if (email) {
      const existing = seenEmails.get(email);

      if (existing) {
        duplicateEmails.push({
          email,
          firstUser: String(existing),
          duplicateUser: String(user._id),
        });
      } else {
        seenEmails.set(email, user._id);
      }
    }
  }

  if (duplicateEmails.length) {
    console.log("");
    console.log("WARNING: DUPLICATE EMAILS FOUND");
    console.log("--------------------------------");

    for (const duplicate of duplicateEmails) {
      console.log(
        `${duplicate.email} | ${duplicate.firstUser} | ${duplicate.duplicateUser}`
      );
    }

    console.log("");
    console.log(
      "Email uniqueness was NOT automatically forced because duplicate"
    );
    console.log(
      "accounts must be resolved before MongoDB can safely enforce a"
    );
    console.log(
      "unique email index."
    );
  }

  for (const user of users) {
    let changed = false;

    if (user.phone !== PHONE) {
      user.phone = PHONE;
      phoneUpdated++;
      changed = true;
    }

    const normalizedEmail = normalizeEmail(user.email);

    if (
      normalizedEmail &&
      normalizedEmail !== user.email
    ) {
      user.email = normalizedEmail;
      emailNormalized++;
      changed = true;
    }

    if (changed) {
      await user.save();
    }
  }

  console.log("");
  console.log("AUTH DATABASE MIGRATION COMPLETE");
  console.log("--------------------------------");
  console.log(`Users processed: ${users.length}`);
  console.log(`Phones changed: ${phoneUpdated}`);
  console.log(`Emails normalized: ${emailNormalized}`);
  console.log(`Duplicate emails: ${duplicateEmails.length}`);
  console.log(`Target phone: ${PHONE}`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("");
  console.error("AUTH MIGRATION FAILED");
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
