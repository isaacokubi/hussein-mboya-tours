// utils/withTransaction.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| EXECUTE MONGODB TRANSACTION
|--------------------------------------------------------------------------
*/

const TRANSACTION_OPTIONS = {
  readPreference: "primary",

  readConcern: {
    level: "local",
  },

  writeConcern: {
    w: "majority",
  },
};

const withTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await callback(session);
    }, TRANSACTION_OPTIONS);

    return result;
  } finally {
    await session.endSession();
  }
};

export default withTransaction;