/**
 * Purpose: dashboard Data client application module. Main declarations: unwrapData, asArray, numeric, firstNumeric, entityId.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const unwrapData = (payload) => {
  // Declare current for use by the surrounding module or function.
  let current = payload?.data ?? payload ?? {};
  // Check the condition (current?.data && typeof current.data === "object" && !Array.isArray(cu) and run the matching branch.
  if (
    current?.data &&
    typeof current.data === "object" &&
    !Array.isArray(current.data)
  ) {
    // Perform the side effect or state update expressed on the following line.
    current = current.data;
  }
  // Return the expression shown below to the caller.
  return current ?? {};
};

// Declare asArray for use by the surrounding module or function.
export const asArray = (value) => (Array.isArray(value) ? value : []);

// Declare numeric for use by the surrounding module or function.
export const numeric = (value, fallback = 0) => {
  // Declare number for use by the surrounding module or function.
  const number = Number(value);
  // Return the expression shown below to the caller.
  return Number.isFinite(number) ? number : fallback;
};

// Declare firstNumeric for use by the surrounding module or function.
export const firstNumeric = (...values) => {
  // Repeat the enclosed work for each required iteration.
  for (const value of values) {
    // Declare number for use by the surrounding module or function.
    const number = Number(value);
    // Check the condition (Number.isFinite(number)) and run the matching branch.
    if (Number.isFinite(number)) return number;
  }
  // Return a numeric value to the caller.
  return 0;
};

// Declare entityId for use by the surrounding module or function.
export const entityId = (value) =>
  value?._id || value?.id || value?.user?._id || value?.user?.id || value;

// Declare isDeleted for use by the surrounding module or function.
export const isDeleted = (value) => value?.isDeleted === true;

// Declare activeEntities for use by the surrounding module or function.
export const activeEntities = (items) => asArray(items).filter((item) => !isDeleted(item));

// Declare statusOf for use by the surrounding module or function.
export const statusOf = (value, fallback = "pending") =>
  String(value?.status || value?.bookingStatus || fallback).trim().toLowerCase();

// Declare paymentStatusOf for use by the surrounding module or function.
export const paymentStatusOf = (value, fallback = "pending") =>
  String(
    typeof value?.paymentStatus === "object"
      ? value.paymentStatus?.paymentStatus || value.paymentStatus?.status || fallback
      : value?.paymentStatus || fallback,
  )
    .trim()
    .toLowerCase();
