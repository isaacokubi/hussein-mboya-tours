/**
 * Purpose: package Api client application module. Main declarations: getPackages, getPackageDetails.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/packageService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET AGENT PACKAGES
|--------------------------------------------------------------------------
*/

// Declare getPackages for use by the surrounding module or function.
export const getPackages = async (params = {}) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/agent/packages",
    {
      params,
    }
  );

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| GET PACKAGE DETAILS
|--------------------------------------------------------------------------
*/

// Declare getPackageDetails for use by the surrounding module or function.
export const getPackageDetails = async (packageId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    `/agent/packages/${packageId}`
  );

  // Return the value of data to the caller.
  return data;
};
