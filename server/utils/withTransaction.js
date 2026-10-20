// Shared helper for running MongoDB operations inside a transaction.
import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| EXECUTE MONGODB TRANSACTION
|--------------------------------------------------------------------------
*/

// Define the consistency and acknowledgement settings used by each transaction.
const TRANSACTION_OPTIONS = {
  // Read from the primary replica-set member for transaction consistency.
  readPreference: "primary",

  // Use locally committed data as the transaction's read concern.
  readConcern: {
    level: "local", // Request the local consistency level supported by the driver.
  },

  // Require acknowledgement from a majority of replica-set members.
  writeConcern: {
    w: "majority", // Increase durability of acknowledged transaction writes.
  },
};

// Execute the caller's asynchronous callback inside a managed session/transaction.
const withTransaction = async (callback) => {
  // Open a Mongoose session that can be attached to database operations.
  const session = await mongoose.startSession();

  try {
    // Store the callback result so it can be returned after commit.
    let result;

    // Let the MongoDB driver manage the transaction lifecycle and retry behavior.
    await session.withTransaction(async () => {
      // Pass the active session to the callback so its writes join this transaction.
      result = await callback(session);
    }, TRANSACTION_OPTIONS); // Apply the shared transaction options.

    // Return the result after the transaction has completed successfully.
    return result;
  } finally {
    // Always release the session whether the callback commits or throws.
    await session.endSession();
  }
};

// Export the transaction helper for reuse by service modules.
export default withTransaction;
