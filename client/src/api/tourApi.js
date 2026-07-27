import api from "./axios";





/*
|--------------------------------------------------------------------------
| PUBLIC TOUR APIs
|--------------------------------------------------------------------------
*/





// Get all tours

export const getTours = async(
    params = {}
)=>{


    const response = await api.get(

        "/tours",

        {
            params
        }

    );


    return response.data;


};









// Search tours

export const searchTours = async(
    params = {}
)=>{


    const response = await api.get(

        "/tours/search",

        {
            params
        }

    );


    return response.data;


};









// Get single tour by slug

export const getTourBySlug = async(
    slug
)=>{


    const response = await api.get(

        `/tours/${slug}`

    );


    return response.data;


};









/*
|--------------------------------------------------------------------------
| TOUR MANAGER TOUR MANAGEMENT
|--------------------------------------------------------------------------
*/







// Create tour

export const createTour = async(
    data
)=>{


    const response = await api.post(

        "/tours",

        data

    );


    return response.data;


};









// Get manager tours

export const getManagerTours = async()=>{


    const response = await api.get(

        "/tours/manager"

    );


    return response.data;


};









// Get single tour by ID

export const getTour = async(
    id
)=>{


    const response = await api.get(

        `/tours/${id}`

    );


    return response.data;


};









// Update tour

export const updateTour = async(
    id,
    data
)=>{


    const response = await api.put(

        `/tours/${id}`,

        data

    );


    return response.data;


};









// Delete tour

export const deleteTour = async(
    id
)=>{


    const response = await api.delete(

        `/tours/${id}`

    );


    return response.data;


};









/*
|--------------------------------------------------------------------------
| TOUR ASSIGNMENTS
|--------------------------------------------------------------------------
*/







// Assign guide

export const assignGuide = async(
    id,
    guideId
)=>{


    const response = await api.patch(

        `/tours/${id}/guide`,

        {
            guideId
        }

    );


    return response.data;


};









// Assign vehicle

export const assignVehicle = async(
    id,
    vehicleId
)=>{


    const response = await api.patch(

        `/tours/${id}/vehicle`,

        {
            vehicleId
        }

    );


    return response.data;


};









/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/







// Get tour availability

export const getTourAvailability = async(
    id
)=>{


    const response = await api.get(

        `/tours/${id}/availability`

    );


    return response.data;


};









// Update tour availability

export const updateTourAvailability = async(
    id,
    data
)=>{


    const response = await api.patch(

        `/tours/${id}/availability`,

        data

    );


    return response.data;


};









/*
|--------------------------------------------------------------------------
| TOUR REPORTS
|--------------------------------------------------------------------------
*/







// Get tour reports

export const getTourReports = async()=>{


    const response = await api.get(

        "/tour-reports"

    );


    return response.data;


};









/*
|--------------------------------------------------------------------------
| TOUR MANAGER SUPPORT DATA
|--------------------------------------------------------------------------
*/







// Get available guides

export const getGuides = async()=>{


    const response = await api.get(

        "/users/guides"

    );


    return response.data;


};









// Get available vehicles

export const getVehicles = async()=>{


    const response = await api.get(

        "/vehicles"

    );


    return response.data;


};









// Get destinations

export const getDestinations = async()=>{


    const response = await api.get(

        "/destinations"

    );


    return response.data;


};