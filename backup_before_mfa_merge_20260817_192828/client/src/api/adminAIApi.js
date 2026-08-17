import api from "./axios";


export const getAIDashboard = async () => {
  const { data } = await api.get("/admin-ai/dashboard");
  return data;
};


export const getAIAnalytics = async () => {
  const { data } = await api.get("/admin-ai/analytics");
  return data;
};


export const getAIBriefing = async () => {
  const { data } = await api.get("/admin-ai/briefing");
  return data;
};


export const askAdminAI = async (message) => {
  const { data } = await api.post(
    "/admin-ai/query",
    {
      message,
    }
  );

  return data;
};


export const getAIIntelligence = async () => {
  const { data } = await api.get("/admin-ai/intelligence");
  return data;
};


export const getAIAlerts = async () => {

  const { data } =
    await api.get("/admin-ai/alerts");

  return data;

};


export const generateCustomerReply = async(payload)=>{

  const {data} =
    await api.post(
      "/admin-ai/customer-support",
      payload
    );

  return data;

};


export const getAIRevenueAdvice = async()=>{

  const {data} =
    await api.get(
      "/admin-ai/revenue-advice"
    );

  return data;

};


export const getBookingRiskAnalysis = async()=>{

  const {data} =
    await api.get(
      "/admin-ai/booking-risks"
    );

  return data;

};


export const getAITasks = async()=>{

const {data}=await api.get(
"/admin-ai/tasks"
);

return data;

};



export const updateAITask = async(
id,status
)=>{

const {data}=await api.patch(
`/admin-ai/tasks/${id}`,
{
status
}
);

return data;

};


export const getTourPricingAdvice = async()=>{

const {data}=await api.get(
"/admin-ai/pricing-advice"
);

return data;

};


export const getTourRecommendations = async(customerId)=>{

const {data}=await api.get(
`/admin-ai/recommendations/${customerId}`
);

return data;

};


export const getAIFraudMonitoring = async()=>{

const {data}=await api.get(
"/admin-ai/fraud-monitoring"
);

return data;

};


export const getAISentimentAnalysis = async()=>{

const {data}=await api.get(
"/admin-ai/sentiment"
);

return data;

};


export const getAIMarketingCampaigns = async()=>{

const {data}=await api.get(
"/admin-ai/marketing-campaigns"
);

return data;

};


export const getAIFinancialForecast = async()=>{

const {data}=await api.get(
"/admin-ai/financial-forecast"
);

return data;

};


export const getAIOperationsCenter = async()=>{

const {data}=await api.get(
"/admin-ai/operations-center"
);

return data;

};


export const getAISalesAssistant = async()=>{

const {data}=await api.get(
"/admin-ai/sales-assistant"
);

return data;

};
