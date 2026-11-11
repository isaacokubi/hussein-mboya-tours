/**
 * Purpose: use Agent Customers reusable React hook. Main declarations: useAgentCustomers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/hooks/useAgentCustomers.js

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery
} from "@tanstack/react-query";


// Load ../api/customerApi so this module can use its exported dependencies.
import {
  getAgentCustomers
} from "../api/customerApi";



// Define useAgentCustomers; its parameters and body implement this operation.
export default function useAgentCustomers(
  params = {}
) {


  // Return the result of useQuery() to the caller.
  return useQuery({

    queryKey: [
      "agent-customers",
      params
    ],



    queryFn: async()=>{


      // Declare response for use by the surrounding module or function.
      const response =
        await getAgentCustomers(params);



      // Return the expression shown below to the caller.
      return (

        response?.data?.customers

        ||

        response?.customers

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
