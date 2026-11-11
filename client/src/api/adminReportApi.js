/**
 * Purpose: admin Report Api client application module. Main declarations: getDailyReport, getMonthlyReport, getTourReport, getAgentReport.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */


// Load ./axios so this module can use its exported dependencies.
import api from "./axios";


// Declare getDailyReport for use by the surrounding module or function.
export const getDailyReport =
async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin/reports/daily"
);

// Return the value of data to the caller.
return data;

};



// Declare getMonthlyReport for use by the surrounding module or function.
export const getMonthlyReport =
async(params)=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin/reports/monthly",
{
params
}
);

// Return the value of data to the caller.
return data;

};



// Declare getTourReport for use by the surrounding module or function.
export const getTourReport =
async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin/reports/tours"
);

// Return the value of data to the caller.
return data;

};



// Declare getAgentReport for use by the surrounding module or function.
export const getAgentReport =
async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin/reports/agents"
);

// Return the value of data to the caller.
return data;

};
