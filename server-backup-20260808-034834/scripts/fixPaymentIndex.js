// scripts/fixPaymentIndexes.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");

    const collection = mongoose.connection.collection("payments");

    const indexes = await collection.indexes();

    const hasIndex = indexes.some(
      (index) => index.name === "mpesaReceiptNumber_1"
    );

    if (hasIndex) {
      await collection.dropIndex("mpesaReceiptNumber_1");
      console.log("✅ Removed old mpesaReceiptNumber index");
    } else {
      console.log("ℹ️ Index mpesaReceiptNumber_1 does not exist");
    }

    await mongoose.connection.close();

    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error:", error.message);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

fixIndex();