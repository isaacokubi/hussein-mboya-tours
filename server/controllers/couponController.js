import { mergeTenantFilter } from "../tenancy/context.js";
// server/controllers/couponController.js

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

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      isNaN(amount) ||
      Number(amount) <= 0
    ) {
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

    const discount = await applyCoupon(
      code.trim().toUpperCase(),
      Number(amount)
    );

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

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
    next(error);
  }
};