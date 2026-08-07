// client/src/api/admin/systemHealthApi.js

import api from "../axios";



/*
|--------------------------------------------------------------------------
| SYSTEM HEALTH
|--------------------------------------------------------------------------
*/


export const getSystemHealth = async () => {

  const { data } = await api.get(
    "/admin/system-health"
  );

  return data;

};
