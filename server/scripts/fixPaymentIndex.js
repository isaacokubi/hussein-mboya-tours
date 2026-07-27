import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const collection = mongoose.connection.collection("payments");

    await collection.dropIndex("mpesaReceiptNumber_1");

    console.log("Old mpesaReceiptNumber index removed");

    process.exit(0);
  } catch (error) {
    console.log(error.message);

    process.exit(1);
  }
};

fixIndex();
