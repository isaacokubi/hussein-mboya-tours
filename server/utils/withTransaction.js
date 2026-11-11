/**
 * Purpose: with Transaction server application module. Main declarations: withTransaction.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// utils/withTransaction.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| EXECUTE MONGODB TRANSACTION
|--------------------------------------------------------------------------
*/

// Declare TRANSACTION_OPTIONS for use by the surrounding module or function.
const TRANSACTION_OPTIONS = {
  readPreference: "primary",

  readConcern: {
    level: "local",
  },

  writeConcern: {
    w: "majority",
  },
};

// Declare withTransaction for use by the surrounding module or function.
const withTransaction = async (callback) => {
  // Declare session for use by the surrounding module or function.
  const session = await mongoose.startSession();

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare result for use by the surrounding module or function.
    let result;

    // Perform the side effect or state update expressed on the following line.
    await session.withTransaction(async () => {
      // Perform the side effect or state update expressed on the following line.
      result = await callback(session);
    }, TRANSACTION_OPTIONS);

    // Return the value of result to the caller.
    return result;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    await session.endSession();
  }
};

export default withTransaction;
