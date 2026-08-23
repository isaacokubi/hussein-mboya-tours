import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| ADD LOYALTY POINTS
|--------------------------------------------------------------------------
|
| Atomically adds loyalty points to a user.
|
*/

export const addPoints = async (userId, points) => {
  requireTenantId();
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!Number.isFinite(points) || points <= 0) {
    throw new Error("Points must be greater than zero.");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        loyaltyPoints: points,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("loyaltyPoints");

  if (!user) {
    throw new Error("User not found.");
  }

  return user.loyaltyPoints;
};

/*
|--------------------------------------------------------------------------
| DEDUCT LOYALTY POINTS
|--------------------------------------------------------------------------
*/

export const deductPoints = async (userId, points) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!Number.isFinite(points) || points <= 0) {
    throw new Error("Points must be greater than zero.");
  }

  const user = await User.findById(userId).select(
    "loyaltyPoints"
  );

  if (!user) {
    throw new Error("User not found.");
  }

  if ((user.loyaltyPoints || 0) < points) {
    throw new Error("Insufficient loyalty points.");
  }

  user.loyaltyPoints -= points;

  await user.save();

  return user.loyaltyPoints;
};

/*
|--------------------------------------------------------------------------
| GET USER POINTS
|--------------------------------------------------------------------------
*/

export const getPoints = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const user = await User.findById(userId).select(
    "loyaltyPoints"
  );

  if (!user) {
    throw new Error("User not found.");
  }

  return user.loyaltyPoints || 0;
};
