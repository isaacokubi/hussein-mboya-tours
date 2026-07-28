import api from "./axios";



// ============================================================
// GUIDE DASHBOARD
// ============================================================

export const getGuideDashboard = async()=>{

const response = await api.get(
"/guide/dashboard"
);


return response.data;

};





// ============================================================
// GET ASSIGNED TOURS
// ============================================================

export const getAssignedTours = async()=>{


const response =
await api.get(
"/guide/assigned-tours"
);


return response.data;


};







// ============================================================
// GET TOUR GUESTS
// ============================================================

export const getTourGuests = async(id)=>{


const response =
await api.get(

`/guide/tours/${id}/guests`

);


return response.data;


};







// ============================================================
// UPDATE TOUR STATUS
// ============================================================

export const updateTourStatus = async(

id,

status

)=>{


const response =
await api.put(

`/guide/tours/${id}/status`,

{

status

}

);


return response.data;


};







// ============================================================
// SUBMIT TOUR REPORT
// ============================================================

export const submitTourReport = async(

id,

data

)=>{


const response =
await api.post(

`/guide/tours/${id}/report`,

data

);


return response.data;


};