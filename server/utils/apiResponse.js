/**
 * Purpose: api Response server application module. Main declarations: successResponse, errorResponse.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/*
|--------------------------------------------------------------------------
| API RESPONSE HELPERS
|--------------------------------------------------------------------------
*/

// Declare successResponse for use by the surrounding module or function.
export const successResponse = (
  res,
  status = 200,
  message = "Success",
  data = null,
  meta = null
) => {
  // Declare response for use by the surrounding module or function.
  const response = {
    success: true,
    message,
  };

  // Check the condition (data !== null) and run the matching branch.
  if (data !== null) {
    // Perform the side effect or state update expressed on the following line.
    response.data = data;
  }

  // Check the condition (meta) and run the matching branch.
  if (meta) {
    // Perform the side effect or state update expressed on the following line.
    response.meta = meta;
  }

  // Return the result of res.status(status).json() to the caller.
  return res.status(status).json(response);
};

// Declare errorResponse for use by the surrounding module or function.
export const errorResponse = (
  res,
  status = 500,
  message = "Something went wrong",
  errors = null
) => {
  // Declare response for use by the surrounding module or function.
  const response = {
    success: false,
    message,
  };

  // Check the condition (errors) and run the matching branch.
  if (errors) {
    // Perform the side effect or state update expressed on the following line.
    response.errors = errors;
  }

  // Return the result of res.status(status).json() to the caller.
  return res.status(status).json(response);
};
