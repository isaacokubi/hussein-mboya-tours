// client/src/hooks/useAgentPackages.js

import {
  useQuery
} from "@tanstack/react-query";


import {
  getPackages
} from "../api/packageApi";



export default function useAgentPackages(
  params = {}
) {


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


      const response =
        await getPackages(params);



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
