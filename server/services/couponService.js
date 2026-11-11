/**
 * Purpose: coupon Service business-logic service. Main declarations: applyCoupon.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Coupon.js so this module can use its exported dependencies.
import Coupon from "../models/Coupon.js";

/*
|--------------------------------------------------------------------------
| APPLY COUPON
|--------------------------------------------------------------------------
|
| Returns:
| {
|   valid: Boolean,
|   discount: Number,
|   finalAmount: Number,
|   coupon: Object|null,
|   message: String
| }
|
*/

// Declare applyCoupon for use by the surrounding module or function.
export const applyCoupon = async (code, amount) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!code) and run the matching branch.
  if (!code) {
    // Return the object assembled below to the caller.
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon: null,
      message: "Coupon code is required.",
    };
  }

  // Declare coupon for use by the surrounding module or function.
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    active: true,
  });

  // Check the condition (!coupon) and run the matching branch.
  if (!coupon) {
    // Return the object assembled below to the caller.
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon: null,
      message: "Invalid coupon code.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK EXPIRY
  |--------------------------------------------------------------------------
  */

  // Check the condition (coupon.expiryDate && coupon.expiryDate < new Date()) and run the matching branch.
  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
    // Return the object assembled below to the caller.
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon,
      message: "Coupon has expired.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK USAGE LIMIT
  |--------------------------------------------------------------------------
  */

  // Check the condition (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) and run the matching branch.
  if (
    coupon.usageLimit &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    // Return the object assembled below to the caller.
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon,
      message: "Coupon usage limit reached.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CHECK MINIMUM PURCHASE
  |--------------------------------------------------------------------------
  */

  // Check the condition (coupon.minimumAmount && amount < coupon.minimumAmount) and run the matching branch.
  if (
    coupon.minimumAmount &&
    amount < coupon.minimumAmount
  ) {
    // Return the object assembled below to the caller.
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon,
      message: `Minimum booking amount is ${coupon.minimumAmount}.`,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | CALCULATE DISCOUNT
  |--------------------------------------------------------------------------
  */

  // Declare discount for use by the surrounding module or function.
  let discount = 0;

  // Check the condition (coupon.discountType === "percentage") and run the matching branch.
  if (coupon.discountType === "percentage") {
    // Perform the side effect or state update expressed on the following line.
    discount = (amount * coupon.amount) / 100;

    // Check the condition (coupon.maximumDiscount && discount > coupon.maximumDiscount) and run the matching branch.
    if (
      coupon.maximumDiscount &&
      discount > coupon.maximumDiscount
    ) {
      // Perform the side effect or state update expressed on the following line.
      discount = coupon.maximumDiscount;
    }
  } else {
    // Perform the side effect or state update expressed on the following line.
    discount = coupon.amount;
  }

  // Discount cannot exceed booking amount
  // Perform the side effect or state update expressed on the following line.
  discount = Math.min(discount, amount);

  // Declare finalAmount for use by the surrounding module or function.
  const finalAmount = Number(
    (amount - discount).toFixed(2)
  );

  // Return the object assembled below to the caller.
  return {
    valid: true,
    discount: Number(discount.toFixed(2)),
    finalAmount,
    coupon,
    message: "Coupon applied successfully.",
  };
};
