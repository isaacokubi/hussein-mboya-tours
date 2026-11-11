/**
 * Purpose: search Api client application module. Main declarations: searchTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/searchService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| SEARCH TOURS
|--------------------------------------------------------------------------
*/

// Declare searchTours for use by the surrounding module or function.
export const searchTours = async (filters = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/tours/search",
    {
      params: filters,
    }
  );

  // Return the value of data to the caller.
  return data;
};
