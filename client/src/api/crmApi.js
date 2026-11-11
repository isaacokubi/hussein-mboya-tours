/**
 * Purpose: crm Api client application module. Main declarations: getCRMStats, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/crmService.js

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";

/*
|--------------------------------------------------------------------------
| CRM DASHBOARD STATISTICS
|--------------------------------------------------------------------------
*/

// Declare getCRMStats for use by the surrounding module or function.
export const getCRMStats = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(
    "/crm/stats"
  );

  // Return the value of data to the caller.
  return data;
};



/*
 Auto completed API helpers
*/

// Declare getAll for use by the surrounding module or function.
export const getAll = async()=>{
    // Declare {data} for use by the surrounding module or function.
    const {data}=await api.get("/crm/stats");
    // Return the value of data to the caller.
    return data;
};
