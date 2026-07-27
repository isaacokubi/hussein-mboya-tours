import {
useQuery
}
from "@tanstack/react-query";


import {
getAgentBookings
}
from "../api/agentBookingApi";



export default function useAgentBookings(){


return useQuery({

queryKey:[
"agent-bookings"
],


queryFn:

async()=>{

const res =
await getAgentBookings();


return res.data.bookings;


}

});


}