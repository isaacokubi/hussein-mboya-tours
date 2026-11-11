/**
 * Purpose: notification Api client application module. Main declarations: getNotifications, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Declare getNotifications for use by the surrounding module or function.
export const getNotifications = async (params = {}) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get("/notifications", {
    params,
  });

  // Return the data value to the caller.
  return response.data;
};



/*
 Auto completed API helpers
*/

// Declare getAll for use by the surrounding module or function.
export const getAll = async()=>{
    // Declare {data} for use by the surrounding module or function.
    const {data}=await api.get("/notifications");
    // Return the value of data to the caller.
    return data;
};
