/**
 * Purpose: loyalty Service business-logic service. Main declarations: addPoints, deductPoints, getPoints.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| ADD LOYALTY POINTS
|--------------------------------------------------------------------------
|
| Atomically adds loyalty points to a user.
|
*/

// Declare addPoints for use by the surrounding module or function.
export const addPoints = async (userId, points) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!userId) and run the matching branch.
  if (!userId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User ID is required.");
  }

  // Check the condition (!Number.isFinite(points) || points <= 0) and run the matching branch.
  if (!Number.isFinite(points) || points <= 0) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Points must be greater than zero.");
  }

  // Declare user for use by the surrounding module or function.
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

  // Check the condition (!user) and run the matching branch.
  if (!user) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User not found.");
  }

  // Return the loyalty Points value to the caller.
  return user.loyaltyPoints;
};

/*
|--------------------------------------------------------------------------
| DEDUCT LOYALTY POINTS
|--------------------------------------------------------------------------
*/

// Declare deductPoints for use by the surrounding module or function.
export const deductPoints = async (userId, points) => {
  // Check the condition (!userId) and run the matching branch.
  if (!userId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User ID is required.");
  }

  // Check the condition (!Number.isFinite(points) || points <= 0) and run the matching branch.
  if (!Number.isFinite(points) || points <= 0) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Points must be greater than zero.");
  }

  // Declare user for use by the surrounding module or function.
  const user = await User.findById(userId).select(
    "loyaltyPoints"
  );

  // Check the condition (!user) and run the matching branch.
  if (!user) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User not found.");
  }

  // Check the condition ((user.loyaltyPoints || 0) < points) and run the matching branch.
  if ((user.loyaltyPoints || 0) < points) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Insufficient loyalty points.");
  }

  // Perform the side effect or state update expressed on the following line.
  user.loyaltyPoints -= points;

  // Perform the side effect or state update expressed on the following line.
  await user.save();

  // Return the loyalty Points value to the caller.
  return user.loyaltyPoints;
};

/*
|--------------------------------------------------------------------------
| GET USER POINTS
|--------------------------------------------------------------------------
*/

// Declare getPoints for use by the surrounding module or function.
export const getPoints = async (userId) => {
  // Check the condition (!userId) and run the matching branch.
  if (!userId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User ID is required.");
  }

  // Declare user for use by the surrounding module or function.
  const user = await User.findById(userId).select(
    "loyaltyPoints"
  );

  // Check the condition (!user) and run the matching branch.
  if (!user) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User not found.");
  }

  // Return the expression shown below to the caller.
  return user.loyaltyPoints || 0;
};
