export function isDuplicateKeyError(error) {
  return error?.code === 11000 || error?.code === "ALREADY_EXISTS" || error?.status === 409;
}
