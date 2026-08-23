// scripts/fixPaymentIndexes.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed

    const collection = mongoose.connection.collection("payments");

    const indexes = await collection.indexes();

    const hasIndex = indexes.some(
      (index) => index.name === "mpesaReceiptNumber_1"
    );

    if (hasIndex) {
      await collection.dropIndex("mpesaReceiptNumber_1");
      // debug removed
    } else {
      // debug removed
    }

    await mongoose.connection.close();

    // debug removed
  } catch (error) {
    console.error("❌ Error:", error.message);

    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

fixIndex();
