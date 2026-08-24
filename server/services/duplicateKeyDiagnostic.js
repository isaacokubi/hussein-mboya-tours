export function getDuplicateKeyDetails(error) {
  if (!error || error.code !== 11000) return null;

  const keyPattern = error.keyPattern || {};
  const keyValue = error.keyValue || {};
  const fields = Object.keys(keyPattern);

  const field = fields.length === 1 ? fields[0] : fields.join(",");
  const value = fields.length === 1
    ? keyValue[field]
    : fields.map((key) => `${key}=${keyValue[key]}`).join(", ");

  return {
    code: "DUPLICATE_KEY",
    field,
    value,
    keyPattern,
    keyValue,
    indexName: error.index,
    message:
      fields.length === 1
        ? `${field} '${value}' already exists`
        : `Unique value already exists for ${value}`,
  };
}
