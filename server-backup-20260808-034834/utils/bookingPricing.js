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

  const discountPercentage = Math.min(
    Math.max(Number(tour.discount) || 0, 0),
    100
  );

  const subtotal = roundMoney(
    price * travelerCount
  );

  const discountAmount = roundMoney(
    subtotal * (discountPercentage / 100)
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

    discountPercentage,

    discountAmount,

    totalAmount,

    depositAmount,

    balanceAmount,
  };
};