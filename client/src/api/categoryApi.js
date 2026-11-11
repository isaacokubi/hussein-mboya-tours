/**
 * Purpose: category Api client application module. Main declarations: getCategories, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";



// Declare getCategories for use by the surrounding module or function.
export const getCategories = async()=>{


// Declare response for use by the surrounding module or function.
const response = await api.get(

"/categories"

);



// Return the categories value to the caller.
return response.data.categories;


};



/*
 Auto completed API helpers
*/

// Declare getAll for use by the surrounding module or function.
export const getAll = async()=>{
    // Declare {data} for use by the surrounding module or function.
    const {data}=await api.get("/categories");
    // Return the value of data to the caller.
    return data;
};
