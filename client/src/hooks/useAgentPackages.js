/**
 * Purpose: use Agent Packages reusable React hook. Main declarations: useAgentPackages.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/hooks/useAgentPackages.js

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery
} from "@tanstack/react-query";


// Load ../api/packageApi so this module can use its exported dependencies.
import {
  getPackages
} from "../api/packageApi";



// Define useAgentPackages; its parameters and body implement this operation.
export default function useAgentPackages(
  params = {}
) {


  // Return the result of useQuery() to the caller.
  return useQuery({

    /*
    |--------------------------------------------------------------------------
    | CACHE KEY
    |--------------------------------------------------------------------------
    */

    queryKey: [

      "agent-packages",

      params

    ],





    /*
    |--------------------------------------------------------------------------
    | FETCH PACKAGES
    |--------------------------------------------------------------------------
    */

    queryFn: async()=>{


      // Declare response for use by the surrounding module or function.
      const response =
        await getPackages(params);



      // Return the expression shown below to the caller.
      return (

        response?.data?.packages

        ||

        response?.packages

        ||

        response?.data

        ||

        []

      );


    },





    /*
    |--------------------------------------------------------------------------
    | PERFORMANCE SETTINGS
    |--------------------------------------------------------------------------
    */

    staleTime:

      1000 * 60 * 5,



    retry:

      2



  });


}
