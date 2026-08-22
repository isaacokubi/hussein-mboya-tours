import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
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

export const applyCoupon = async (code, amount) => {
  requireTenantId();
  if (!code) {
    return {
      valid: false,
      discount: 0,
      finalAmount: amount,
      coupon: null,
      message: "Coupon code is required.",
    };
  }

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    active: true,
  });

  if (!coupon) {
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

  if (coupon.expiryDate && coupon.expiryDate < new Date()) {
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

  if (
    coupon.usageLimit &&
    coupon.usedCount >= coupon.usageLimit
  ) {
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

  if (
    coupon.minimumAmount &&
    amount < coupon.minimumAmount
  ) {
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

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (amount * coupon.amount) / 100;

    if (
      coupon.maximumDiscount &&
      discount > coupon.maximumDiscount
    ) {
      discount = coupon.maximumDiscount;
    }
  } else {
    discount = coupon.amount;
  }

  // Discount cannot exceed booking amount
  discount = Math.min(discount, amount);

  const finalAmount = Number(
    (amount - discount).toFixed(2)
  );

  return {
    valid: true,
    discount: Number(discount.toFixed(2)),
    finalAmount,
    coupon,
    message: "Coupon applied successfully.",
  };
};