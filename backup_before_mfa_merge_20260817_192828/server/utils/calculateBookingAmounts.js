/*
|--------------------------------------------------------------------------
| CALCULATE BOOKING AMOUNTS
|--------------------------------------------------------------------------
|
| depositRequired:
| - If depositType === "percentage", depositRequired is treated as %
| - Otherwise, it is treated as a fixed amount in KES
|
*/

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export default function calculateBookingAmounts(
  tour,
  travelerCount
) {
  if (!tour) {
    throw new Error("Tour is required.");
  }

  if (!Number.isInteger(travelerCount) || travelerCount <= 0) {
    throw new Error("Invalid traveler count.");
  }

  const price = Number(tour.price) || 0;

  const discount = Math.min(
    Math.max(Number(tour.discount) || 0, 0),
    100
  );

  const subtotal = roundCurrency(price * travelerCount);

  const discountAmount = roundCurrency(
    subtotal * (discount / 100)
  );

  const totalAmount = roundCurrency(
    Math.max(subtotal - discountAmount, 0)
  );

  let depositAmount = 0;

  if (tour.depositRequired) {
    if (tour.depositType === "percentage") {
      depositAmount = roundCurrency(
        totalAmount * (tour.depositRequired / 100)
      );
    } else {
      depositAmount = roundCurrency(
        Math.min(
          Number(tour.depositRequired),
          totalAmount
        )
      );
    }
  }

  const balanceAmount = roundCurrency(
    totalAmount - depositAmount
  );

  return {
    subtotal,
    discountPercentage: discount,
    discountAmount,
    totalAmount,
    depositAmount,
    balanceAmount,
  };
}