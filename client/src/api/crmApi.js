// client/src/services/crmService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| CRM DASHBOARD STATISTICS
|--------------------------------------------------------------------------
*/

export const getCRMStats = async () => {
  const { data } = await api.get(
    "/crm/stats"
  );

  return data;
};