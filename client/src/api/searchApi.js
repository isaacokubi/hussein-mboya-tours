// client/src/services/searchService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| SEARCH TOURS
|--------------------------------------------------------------------------
*/

export const searchTours = async (filters = {}) => {
  const { data } = await api.get(
    "/tours/search",
    {
      params: filters,
    }
  );

  return data;
};