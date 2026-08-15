/*
|--------------------------------------------------------------------------
| CALCULATE BOOKING AMOUNTS
|--------------------------------------------------------------------------
|
| depositType:
| - "fixed"       => depositRequired is a fixed amount
| - "percentage"  => depositRequired is a percentage
|--------------------------------------------------------------------------
*/

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const calculateBookingAmounts = (
  tour,
  travelerCount
) => {
  if (!tour) {
    throw new Error("Tour is required.");
  }

  if (
    !Number.isInteger(travelerCount) ||
    travelerCount <= 0
  ) {
    throw new Error("Invalid traveler count.");
  }

  const price = Number(tour.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Invalid tour price.");
  }

  const discountAmount = roundMoney(
    Math.min(Number(tour.discount) || 0, price * travelerCount)
  );

  const subtotal = roundMoney(
    price * travelerCount
  );

  const totalAmount = roundMoney(
    subtotal - discountAmount
  );

  let depositAmount = 0;

  if (tour.depositRequired) {
    if (tour.depositType === "percentage") {
      depositAmount = roundMoney(
        totalAmount *
          (Number(tour.depositRequired) / 100)
      );
    } else {
      depositAmount = roundMoney(
        Math.min(
          Number(tour.depositRequired),
          totalAmount
        )
      );
    }
  }

  const balanceAmount = roundMoney(
    Math.max(totalAmount - depositAmount, 0)
  );

  return {
    travelerCount,

    pricePerTraveler: price,

    subtotal,

    discountPercentage: 0,

    discountAmount,

    totalAmount,

    depositAmount,

    balanceAmount,
  };
};