/**
 * Purpose: duplicate Key Diagnostic business-logic service. Main declarations: getDuplicateKeyDetails.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function getDuplicateKeyDetails(error) {
  // Check the condition (!error || error.code !== 11000) and run the matching branch.
  if (!error || error.code !== 11000) return null;

  // Declare keyPattern for use by the surrounding module or function.
  const keyPattern = error.keyPattern || {};
  // Declare keyValue for use by the surrounding module or function.
  const keyValue = error.keyValue || {};
  // Declare fields for use by the surrounding module or function.
  const fields = Object.keys(keyPattern);

  // Declare field for use by the surrounding module or function.
  const field = fields.length === 1 ? fields[0] : fields.join(",");
  // Declare value for use by the surrounding module or function.
  const value = fields.length === 1
    ? keyValue[field]
    : fields.map((key) => `${key}=${keyValue[key]}`).join(", ");

  // Return the object assembled below to the caller.
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
