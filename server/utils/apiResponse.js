/*
|--------------------------------------------------------------------------
| API RESPONSE HELPERS
|--------------------------------------------------------------------------
*/

// Build the standard successful API response and send it through Express.
export const successResponse = (
  res, // Express response object used to set status and send JSON.
  status = 200, // HTTP status code to return when the operation succeeds.
  message = "Success", // Human-readable success message for the client.
  data = null, // Optional result payload, such as a record or list.
  meta = null // Optional pagination or other response metadata.
) => {
  // Start with the fields shared by all successful responses.
  const response = {
    success: true, // Tell clients the request completed successfully.
    message, // Include the supplied success message.
  };

  // Include data only when the caller supplied a non-null payload.
  if (data !== null) {
    // Attach the result under the consistent data property.
    response.data = data;
  }

  // Include metadata only when it was provided.
  if (meta) {
    // Attach pagination or other supporting details to the response.
    response.meta = meta;
  }

  // Set the HTTP status and serialize the response as JSON.
  return res.status(status).json(response);
};

// Build a standard error response and send it through Express.
export const errorResponse = (
  res, // Express response object used to send the error.
  status = 500, // Default to server-error status when the caller supplies none.
  message = "Something went wrong", // Safe human-readable explanation for the client.
  errors = null // Optional field-level or structured error details.
) => {
  // Start with the fields shared by all error responses.
  const response = {
    success: false, // Tell clients the request did not succeed.
    message, // Include the supplied safe error message.
  };

  // Attach structured error details when they exist.
  if (errors) {
    // Keep validation or diagnostic details under a predictable property.
    response.errors = errors;
  }

  // Set the HTTP status and serialize the error as JSON.
  return res.status(status).json(response);
};
