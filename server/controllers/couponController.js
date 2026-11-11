/**
 * Purpose: coupon Controller HTTP controller. Main declarations: validateCoupon.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// server/controllers/couponController.js

// Load ../services/couponService.js so this module can use its exported dependencies.
import { applyCoupon } from "../services/couponService.js";

/*
|--------------------------------------------------------------------------
| VALIDATE COUPON
|--------------------------------------------------------------------------
|
| POST /api/coupons/validate
|
| Body:
| {
|   code: "SUMMER2026",
|   amount: 50000
| }
|--------------------------------------------------------------------------
*/

// Declare validateCoupon for use by the surrounding module or function.
export const validateCoupon = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare { code, amount } for use by the surrounding module or function.
    const { code, amount } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    // Check the condition (!code || typeof code !== "string") and run the matching branch.
    if (!code || typeof code !== "string") {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    // Check the condition (amount === undefined || amount === null || isNaN(amount) || Number(amo) and run the matching branch.
    if (
      amount === undefined ||
      amount === null ||
      isNaN(amount) ||
      Number(amount) <= 0
    ) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "A valid booking amount is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Coupon
    |--------------------------------------------------------------------------
    */

    // Declare discount for use by the surrounding module or function.
    const discount = await applyCoupon(
      code.trim().toUpperCase(),
      Number(amount)
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Coupon validated successfully.",
      data: {
        code: code.trim().toUpperCase(),
        originalAmount: Number(amount),
        discount,
      },
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
