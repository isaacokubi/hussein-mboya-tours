export const unwrapData = (payload) => {
  let current = payload?.data ?? payload ?? {};
  if (
    current?.data &&
    typeof current.data === "object" &&
    !Array.isArray(current.data)
  ) {
    current = current.data;
  }
  return current ?? {};
};

export const asArray = (value) => (Array.isArray(value) ? value : []);

export const numeric = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const firstNumeric = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};

export const entityId = (value) =>
  value?._id || value?.id || value?.user?._id || value?.user?.id || value;

export const isDeleted = (value) => value?.isDeleted === true;

export const activeEntities = (items) => asArray(items).filter((item) => !isDeleted(item));

export const statusOf = (value, fallback = "pending") =>
  String(value?.status || value?.bookingStatus || fallback).trim().toLowerCase();

export const paymentStatusOf = (value, fallback = "pending") =>
  String(
    typeof value?.paymentStatus === "object"
      ? value.paymentStatus?.paymentStatus || value.paymentStatus?.status || fallback
      : value?.paymentStatus || fallback,
  )
    .trim()
    .toLowerCase();
