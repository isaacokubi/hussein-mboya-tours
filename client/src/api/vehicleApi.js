import axios from "axios";



/*
|--------------------------------------------------------------------------
| AXIOS INSTANCE
|--------------------------------------------------------------------------
*/


const API = axios.create({

    baseURL:
    import.meta.env.VITE_API_URL + "/api",

});







/*
|--------------------------------------------------------------------------
| JWT TOKEN INTERCEPTOR
|--------------------------------------------------------------------------
*/


API.interceptors.request.use(

    (config)=>{


        const token =
        localStorage.getItem("token");



        if(token)

        {


            config.headers.Authorization =
            `Bearer ${token}`;


        }



        return config;


    },


    (error)=>{


        return Promise.reject(error);


    }

);









/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/







// ============================================================
// GET ALL VEHICLES
// ============================================================


export const getVehicles = ()=>{


    return API.get(

        "/vehicles"

    );


};









// ============================================================
// GET SINGLE VEHICLE
// ============================================================


export const getVehicleById = (id)=>{


    return API.get(

        `/vehicles/${id}`

    );


};









// ============================================================
// CREATE VEHICLE
// ============================================================
//
// Sends:
// - vehicle details
// - image file
//
// Backend:
// upload.single("image")
//
// ============================================================


export const createVehicle = (data)=>{


    return API.post(

        "/vehicles",

        data,

        {

            headers:{

                "Content-Type":

                "multipart/form-data"

            }

        }

    );


};









// ============================================================
// UPDATE VEHICLE
// ============================================================
//
// Supports replacing vehicle image
//
// ============================================================


export const updateVehicle = (

    id,

    data

)=>{


    return API.put(

        `/vehicles/${id}`,

        data,

        {

            headers:{

                "Content-Type":

                "multipart/form-data"

            }

        }

    );


};









// ============================================================
// DELETE VEHICLE
// ============================================================


export const deleteVehicle = (id)=>{


    return API.delete(

        `/vehicles/${id}`

    );


};









/*
|--------------------------------------------------------------------------
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
*/







// ============================================================
// GET ALL DRIVERS
// ============================================================
//
// Backend:
// GET /api/staff/drivers
//
// MongoDB:
// Staff collection
//
// ============================================================


export const getDrivers = ()=>{


    return API.get(

        "/staff/drivers"

    );


};









// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================


export const assignDriver = (

    vehicleId,

    driverId

)=>{


    return API.put(

        `/vehicles/${vehicleId}/assign-driver`,

        {

            driverId

        }

    );


};









// ============================================================
// REMOVE DRIVER FROM VEHICLE
// ============================================================


export const removeDriver = (

    vehicleId

)=>{


    return API.put(

        `/vehicles/${vehicleId}/remove-driver`

    );


};









/*
|--------------------------------------------------------------------------
| VEHICLE STATUS
|--------------------------------------------------------------------------
*/







// ============================================================
// UPDATE VEHICLE STATUS
// ============================================================


export const updateVehicleStatus = (

    id,

    status

)=>{


    return API.put(

        `/vehicles/${id}/status`,

        {

            status

        }

    );


};









/*
|--------------------------------------------------------------------------
| EXPORT AXIOS INSTANCE
|--------------------------------------------------------------------------
*/


export default API;