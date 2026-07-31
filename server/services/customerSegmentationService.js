import CustomerProfile from "../models/CustomerProfile.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER SEGMENT THRESHOLDS
|--------------------------------------------------------------------------
*/

const CUSTOMER_SEGMENTS = {
  VIP_MIN_SPENT: 500000,
  REGULAR_MIN_BOOKINGS: 5,
};

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER SEGMENT
|--------------------------------------------------------------------------
|
| Updates customerType based on spending and bookings.
|
| Types:
| - vip
| - regular
| - new
|
*/

export const updateCustomerSegment = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const customer = await CustomerProfile.findOne({
    user: userId,
  });

  if (!customer) {
    return null;
  }

  const totalSpent = customer.totalSpent || 0;
  const totalBookings = customer.totalBookings || 0;

  let customerType = "new";

  if (totalSpent >= CUSTOMER_SEGMENTS.VIP_MIN_SPENT) {
    customerType = "vip";
  } else if (
    totalBookings >= CUSTOMER_SEGMENTS.REGULAR_MIN_BOOKINGS
  ) {
    customerType = "regular";
  }

  if (customer.customerType !== customerType) {
    customer.customerType = customerType;
    await customer.save();
  }

  return customer;
};