/**
 * Purpose: customer Booking Reservation business-logic service. Main declarations: createCustomerBookingWithReservations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/**
 * Reserve tour capacity before touching corporate credit, then compensate both
 * writes if the corporate claim or booking insert fails.
 */
// Define createCustomerBookingWithReservations; its parameters and body implement this operation.
export async function createCustomerBookingWithReservations({
  tourId,
  guests,
  travelDate,
  corporateAccountId = null,
  totalAmount = 0,
  reserveSlots,
  releaseSlots,
  reserveCorporateCredit,
  releaseCorporateCredit,
  createBooking,
  onCompensationError = () => {},
}) {
  // Declare slotsReserved for use by the surrounding module or function.
  let slotsReserved = false;
  // Declare corporateReserved for use by the surrounding module or function.
  let corporateReserved = false;

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await reserveSlots(tourId, guests, travelDate);
    // Perform the side effect or state update expressed on the following line.
    slotsReserved = true;

    // Check the condition (corporateAccountId) and run the matching branch.
    if (corporateAccountId) {
      // Declare reserved for use by the surrounding module or function.
      const reserved = await reserveCorporateCredit(corporateAccountId, totalAmount);
      // Check the condition (!reserved) and run the matching branch.
      if (!reserved) {
        // Declare error for use by the surrounding module or function.
        const error = new Error("Corporate credit was no longer available. Please retry the booking.");
        // Perform the side effect or state update expressed on the following line.
        error.status = 409;
        // Stop the current operation by raising the value of error.
        throw error;
      }
      // Perform the side effect or state update expressed on the following line.
      corporateReserved = true;
    }

    // Return the completed the result of createBooking() operation to the caller.
    return await createBooking();
  } catch (error) {
    // Check the condition (slotsReserved) and run the matching branch.
    if (slotsReserved) {
      // Perform the side effect or state update expressed on the following line.
      await releaseSlots(tourId, guests, travelDate).catch((rollbackError) => onCompensationError("capacity", rollbackError));
    }
    // Check the condition (corporateReserved) and run the matching branch.
    if (corporateReserved) {
      // Perform the side effect or state update expressed on the following line.
      await releaseCorporateCredit(corporateAccountId, totalAmount).catch((rollbackError) => onCompensationError("corporate-credit", rollbackError));
    }
    // Stop the current operation by raising the value of error.
    throw error;
  }
}
