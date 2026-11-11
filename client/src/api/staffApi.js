/**
 * Purpose: staff Api client application module. Main declarations: getStaff, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


// Declare getStaff for use by the surrounding module or function.
export const getStaff = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get("/staff");
  // Return the data value to the caller.
  return response.data;
};



/*
 Auto completed API helpers
*/

// Declare getAll for use by the surrounding module or function.
export const getAll = async()=>{
    // Declare {data} for use by the surrounding module or function.
    const {data}=await api.get("/staff");
    // Return the value of data to the caller.
    return data;
};
