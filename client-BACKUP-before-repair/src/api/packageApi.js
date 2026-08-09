// client/src/services/packageService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| GET AGENT PACKAGES
|--------------------------------------------------------------------------
*/

export const getPackages = async (params = {}) => {
  const { data } = await api.get(
    "/agent/packages",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET PACKAGE DETAILS
|--------------------------------------------------------------------------
*/

export const getPackageDetails = async (packageId) => {
  const { data } = await api.get(
    `/agent/packages/${packageId}`
  );

  return data;
};