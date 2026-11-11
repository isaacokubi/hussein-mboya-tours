/**
 * Purpose: use Agent Bookings reusable React hook. Main declarations: useAgentBookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/hooks/useAgentBookings.js

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery
} from "@tanstack/react-query";


// Load ../api/agentBookingApi so this module can use its exported dependencies.
import {
  getAgentBookings
} from "../api/agentBookingApi";



// Define useAgentBookings; its parameters and body implement this operation.
export default function useAgentBookings(
  params = {}
) {


  // Return the result of useQuery() to the caller.
  return useQuery({

    queryKey: [
      "agent-bookings",
      params
    ],



    queryFn: async()=>{


      // Declare response for use by the surrounding module or function.
      const response =
        await getAgentBookings(params);



      // Return the expression shown below to the caller.
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
