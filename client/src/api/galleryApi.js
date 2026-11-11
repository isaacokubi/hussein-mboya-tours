/**
 * Purpose: gallery Api client application module. Main declarations: getFeaturedGallery, getAll.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


// Declare getFeaturedGallery for use by the surrounding module or function.
export const getFeaturedGallery = async()=>{


// Declare response for use by the surrounding module or function.
const response =
await api.get(
"/gallery/featured"
);



// Return the expression shown below to the caller.
return Array.isArray(response.data)
? response.data
: Array.isArray(response.data.images)
? response.data.images
: Array.isArray(response.data.data)
? response.data.data
: [];


};



/*
 Auto completed API helpers
*/

// Declare getAll for use by the surrounding module or function.
export const getAll = async()=>{
    // Declare {data} for use by the surrounding module or function.
    const {data}=await api.get("/gallery/featured");
    // Return the value of data to the caller.
    return data;
};
