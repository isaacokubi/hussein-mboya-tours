/**
 * Purpose: customer Segmentation Service business-logic service. Main declarations: updateCustomerSegment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/CustomerProfile.js so this module can use its exported dependencies.
import CustomerProfile from "../models/CustomerProfile.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER SEGMENT THRESHOLDS
|--------------------------------------------------------------------------
*/

// Declare CUSTOMER_SEGMENTS for use by the surrounding module or function.
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

// Declare updateCustomerSegment for use by the surrounding module or function.
export const updateCustomerSegment = async (userId) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (!userId) and run the matching branch.
  if (!userId) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("User ID is required.");
  }

  // Declare customer for use by the surrounding module or function.
  const customer = await CustomerProfile.findOne({
    user: userId,
  });

  // Check the condition (!customer) and run the matching branch.
  if (!customer) {
    // Return the expression shown below to the caller.
    return null;
  }

  // Declare totalSpent for use by the surrounding module or function.
  const totalSpent = customer.totalSpent || 0;
  // Declare totalBookings for use by the surrounding module or function.
  const totalBookings = customer.totalBookings || 0;

  // Declare customerType for use by the surrounding module or function.
  let customerType = "new";

  // Check the condition (totalSpent >= CUSTOMER_SEGMENTS.VIP_MIN_SPENT) and run the matching branch.
  if (totalSpent >= CUSTOMER_SEGMENTS.VIP_MIN_SPENT) {
    // Perform the side effect or state update expressed on the following line.
    customerType = "vip";
  } else if (
    totalBookings >= CUSTOMER_SEGMENTS.REGULAR_MIN_BOOKINGS
  ) {
    // Perform the side effect or state update expressed on the following line.
    customerType = "regular";
  }

  // Check the condition (customer.customerType !== customerType) and run the matching branch.
  if (customer.customerType !== customerType) {
    // Perform the side effect or state update expressed on the following line.
    customer.customerType = customerType;
    // Perform the side effect or state update expressed on the following line.
    await customer.save();
  }

  // Return the value of customer to the caller.
  return customer;
};
