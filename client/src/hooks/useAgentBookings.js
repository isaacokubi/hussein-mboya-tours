// client/src/hooks/useAgentBookings.js

import {
  useQuery
} from "@tanstack/react-query";


import {
  getAgentBookings
} from "../api/agentBookingApi";



export default function useAgentBookings(
  params = {}
) {


  return useQuery({

    queryKey: [
      "agent-bookings",
      params
    ],



    queryFn: async()=>{


      const response =
        await getAgentBookings(params);



      return (

        response?.data?.bookings

        ||

        response?.bookings

        ||

        response?.data

        ||

        []

      );


    },



    staleTime:
      1000 * 60 * 5,


  });


}
