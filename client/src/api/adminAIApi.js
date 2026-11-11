/**
 * Purpose: admin AIApi client application module. Main declarations: getAIDashboard, getAIAnalytics, getAIBriefing, askAdminAI, getAIIntelligence.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


// Declare getAIDashboard for use by the surrounding module or function.
export const getAIDashboard = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin-ai/dashboard");
  // Return the value of data to the caller.
  return data;
};


// Declare getAIAnalytics for use by the surrounding module or function.
export const getAIAnalytics = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin-ai/analytics");
  // Return the value of data to the caller.
  return data;
};


// Declare getAIBriefing for use by the surrounding module or function.
export const getAIBriefing = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin-ai/briefing");
  // Return the value of data to the caller.
  return data;
};


// Declare askAdminAI for use by the surrounding module or function.
export const askAdminAI = async (message) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.post(
    "/admin-ai/query",
    {
      message,
    }
  );

  // Return the value of data to the caller.
  return data;
};


// Declare getAIIntelligence for use by the surrounding module or function.
export const getAIIntelligence = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/admin-ai/intelligence");
  // Return the value of data to the caller.
  return data;
};


// Declare getAIAlerts for use by the surrounding module or function.
export const getAIAlerts = async () => {

  // Declare { data } for use by the surrounding module or function.
  const { data } =
    await api.get("/admin-ai/alerts");

  // Return the value of data to the caller.
  return data;

};


// Declare generateCustomerReply for use by the surrounding module or function.
export const generateCustomerReply = async(payload)=>{

  // Declare {data} for use by the surrounding module or function.
  const {data} =
    await api.post(
      "/admin-ai/customer-support",
      payload
    );

  // Return the value of data to the caller.
  return data;

};


// Declare getAIRevenueAdvice for use by the surrounding module or function.
export const getAIRevenueAdvice = async()=>{

  // Declare {data} for use by the surrounding module or function.
  const {data} =
    await api.get(
      "/admin-ai/revenue-advice"
    );

  // Return the value of data to the caller.
  return data;

};


// Declare getBookingRiskAnalysis for use by the surrounding module or function.
export const getBookingRiskAnalysis = async()=>{

  // Declare {data} for use by the surrounding module or function.
  const {data} =
    await api.get(
      "/admin-ai/booking-risks"
    );

  // Return the value of data to the caller.
  return data;

};


// Declare getAITasks for use by the surrounding module or function.
export const getAITasks = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/tasks"
);

// Return the value of data to the caller.
return data;

};



// Declare updateAITask for use by the surrounding module or function.
export const updateAITask = async(
id,status
)=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.patch(
`/admin-ai/tasks/${id}`,
{
status
}
);

// Return the value of data to the caller.
return data;

};


// Declare getTourPricingAdvice for use by the surrounding module or function.
export const getTourPricingAdvice = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/pricing-advice"
);

// Return the value of data to the caller.
return data;

};


// Declare getTourRecommendations for use by the surrounding module or function.
export const getTourRecommendations = async(customerId)=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
`/admin-ai/recommendations/${customerId}`
);

// Return the value of data to the caller.
return data;

};


// Declare getAIFraudMonitoring for use by the surrounding module or function.
export const getAIFraudMonitoring = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/fraud-monitoring"
);

// Return the value of data to the caller.
return data;

};


// Declare getAISentimentAnalysis for use by the surrounding module or function.
export const getAISentimentAnalysis = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/sentiment"
);

// Return the value of data to the caller.
return data;

};


// Declare getAIMarketingCampaigns for use by the surrounding module or function.
export const getAIMarketingCampaigns = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/marketing-campaigns"
);

// Return the value of data to the caller.
return data;

};


// Declare getAIFinancialForecast for use by the surrounding module or function.
export const getAIFinancialForecast = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/financial-forecast"
);

// Return the value of data to the caller.
return data;

};


// Declare getAIOperationsCenter for use by the surrounding module or function.
export const getAIOperationsCenter = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/operations-center"
);

// Return the value of data to the caller.
return data;

};


// Declare getAISalesAssistant for use by the surrounding module or function.
export const getAISalesAssistant = async()=>{

// Declare {data} for use by the surrounding module or function.
const {data}=await api.get(
"/admin-ai/sales-assistant"
);

// Return the value of data to the caller.
return data;

};
