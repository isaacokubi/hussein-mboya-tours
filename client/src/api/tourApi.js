// client/src/api/tourApi.js

import api from "./axios";



/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/


export const getTours = async (params = {}) => {

    const { data } = await api.get(
        "/tours",
        {
            params
        }
    );


    return data;

};





export const getFeaturedTours = async () => {

    const { data } = await api.get(
        "/tours/featured"
    );


    return data;

};







/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/


export const getTourById = async (id) => {


    const { data } = await api.get(
        `/tours/${id}`
    );


    /*
    API returns:

    {
      success:true,
      data:{
        title,
        price
      }
    }

    Return only the tour object
    */


    return data.data || data;


};






export const getTour = async (id) => {


    const { data } = await api.get(
        `/tours/${id}`
    );


    return data.data || data;


};









/*
|--------------------------------------------------------------------------
| TOUR MANAGER
|--------------------------------------------------------------------------
*/


export const getManagerTours = async (params = {}) => {


    const { data } = await api.get(
        "/tour-manager/tours",
        {
            params
        }
    );


    return data;

};









/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/


export const createTour = async (payload) => {


    const { data } = await api.post(
        "/tour-manager/tours",
        payload
    );


    return data;

};









/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/


export const updateTour = async (
    id,
    payload
) => {


    const { data } = await api.put(
        `/tour-manager/tours/${id}`,
        payload
    );


    return data;

};









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/


export const deleteTour = async (id) => {


    const { data } = await api.delete(
        `/tour-manager/tours/${id}`
    );


    return data;

};









/*
|--------------------------------------------------------------------------
| GUIDES
|--------------------------------------------------------------------------
*/


export const getGuides = async () => {


    const { data } = await api.get(
        "/tour-manager/guides"
    );


    return data;

};







export const assignGuide = async (
    tourId,
    guideId
) => {


    const { data } = await api.patch(

        `/admin/tours/${tourId}/guide`,

        {
            guideId
        }

    );


    return data;

};









/*
|--------------------------------------------------------------------------
| VEHICLES
|--------------------------------------------------------------------------
*/


export const getVehicles = async () => {


    const { data } = await api.get(
        "/tour-manager/vehicles"
    );


    return data;

};







export const assignVehicle = async (
    tourId,
    vehicleId
) => {


    const { data } = await api.patch(

        `/admin/tours/${tourId}/vehicle`,

        {
            vehicleId
        }

    );


    return data;

};









/*
|--------------------------------------------------------------------------
| DESTINATIONS
|--------------------------------------------------------------------------
*/


export const getDestinations = async () => {


    const { data } = await api.get(
        "/destinations"
    );


    return data;

};









/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/


export const getTourAvailability = async (id) => {


    const { data } = await api.get(

        `/tour-manager/tours/${id}/availability`

    );


    return data;

};








export const updateTourAvailability = async (
    id,
    payload
) => {


    const { data } = await api.put(

        `/tour-manager/tours/${id}/availability`,

        payload

    );


    return data;

};









/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/


export const getTourReports = async (params = {}) => {


    const { data } = await api.get(

        "/tour-manager/reports",

        {
            params
        }

    );


    return data;

};