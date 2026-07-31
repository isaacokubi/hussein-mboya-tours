// client/src/services/destinationService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC DESTINATIONS
|--------------------------------------------------------------------------
*/

export const getDestinations = async (params = {}) => {
  const { data } = await api.get(
    "/destinations",
    {
      params,
    }
  );

  return data;
};

export const getDestination = async (id) => {
  const { data } = await api.get(
    `/destinations/${id}`
  );

  return data;
};

export const getDestinationBySlug = async (slug) => {
  const { data } = await api.get(
    `/destinations/slug/${slug}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ADMIN DESTINATIONS
|--------------------------------------------------------------------------
*/

export const createDestination = async (destination) => {
  const { data } = await api.post(
    "/admin/destinations",
    destination
  );

  return data;
};

export const updateDestination = async (
  id,
  destination
) => {
  const { data } = await api.put(
    `/admin/destinations/${id}`,
    destination
  );

  return data;
};

export const deleteDestination = async (id) => {
  const { data } = await api.delete(
    `/admin/destinations/${id}`
  );

  return data;
};