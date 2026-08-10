// client/src/hooks/useAgentCustomers.js

import {
  useQuery
} from "@tanstack/react-query";


import {
  getAgentCustomers
} from "../api/customerApi";



export default function useAgentCustomers(
  params = {}
) {


  return useQuery({

    queryKey: [
      "agent-customers",
      params
    ],



    queryFn: async()=>{


      const response =
        await getAgentCustomers(params);



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