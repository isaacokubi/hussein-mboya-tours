/**
 * Purpose: audit Api client application module. Main declarations: getAuditLogs.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Load ./axios so this module can use its exported dependencies.
import api from "./axios";


// Declare getAuditLogs for use by the surrounding module or function.
export const getAuditLogs = async(params={})=>{

// Declare response for use by the surrounding module or function.
const response = await api.get(
"/superadmin/audit",
{
params
}
);

// Return the data value to the caller.
return response.data;

};
