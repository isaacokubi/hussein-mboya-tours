/**
 * Reserve tour capacity before touching corporate credit, then compensate both
 * writes if the corporate claim or booking insert fails.
 */
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
  let slotsReserved = false;
  let corporateReserved = false;

  try {
    await reserveSlots(tourId, guests, travelDate);
    slotsReserved = true;

    if (corporateAccountId) {
      const reserved = await reserveCorporateCredit(corporateAccountId, totalAmount);
      if (!reserved) {
        const error = new Error("Corporate credit was no longer available. Please retry the booking.");
        error.status = 409;
        throw error;
      }
      corporateReserved = true;
    }

    return await createBooking();
  } catch (error) {
    if (slotsReserved) {
      await releaseSlots(tourId, guests, travelDate).catch((rollbackError) => onCompensationError("capacity", rollbackError));
    }
    if (corporateReserved) {
      await releaseCorporateCredit(corporateAccountId, totalAmount).catch((rollbackError) => onCompensationError("corporate-credit", rollbackError));
    }
    throw error;
  }
}
