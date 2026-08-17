

import api from "./axios";


export const getDailyReport =
async()=>{

const {data}=await api.get(
"/admin/reports/daily"
);

return data;

};



export const getMonthlyReport =
async(params)=>{

const {data}=await api.get(
"/admin/reports/monthly",
{
params
}
);

return data;

};



export const getTourReport =
async()=>{

const {data}=await api.get(
"/admin/reports/tours"
);

return data;

};



export const getAgentReport =
async()=>{

const {data}=await api.get(
"/admin/reports/agents"
);

return data;

};

