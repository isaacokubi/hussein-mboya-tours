// client/src/hooks/useAgentDashboard.js

import {
  useQuery
} from "@tanstack/react-query";


import {
  fetchAgentDashboard
} from "../api/agentApi";





/*
|--------------------------------------------------------------------------
| AGENT DASHBOARD HOOK
|--------------------------------------------------------------------------
|
| Fetches dashboard statistics for logged-in agents.
|
| Flow:
|
| Component
|     |
|     ↓
| useAgentDashboard()
|     |
|     ↓
| fetchAgentDashboard()
|     |
|     ↓
| GET /api/agent/dashboard
|
|--------------------------------------------------------------------------
*/


export const useAgentDashboard = (
  params = {}
) => {



  const query = useQuery({



    /*
    |--------------------------------------------------------------------------
    | CACHE KEY
    |--------------------------------------------------------------------------
    */

    queryKey:[

      "agent-dashboard",

      params

    ],





    /*
    |--------------------------------------------------------------------------
    | API FUNCTION
    |--------------------------------------------------------------------------
    */

    queryFn:

    async()=>{


      const response =
        await fetchAgentDashboard(params);



      return (

        response?.data

        ||

        response

        ||

        {}

      );


    },







    /*
    |--------------------------------------------------------------------------
    | PRODUCTION SETTINGS
    |--------------------------------------------------------------------------
    */


    staleTime:

      1000 * 60 * 5,



    retry:

      2



  });









  return {


    ...query,





    /*
    |--------------------------------------------------------------------------
    | SAFE DATA DEFAULTS
    |--------------------------------------------------------------------------
    */


    dashboard:

      query.data || {},





    stats:

      query.data?.stats || {},





    bookings:

      query.data?.bookings || [],





    customers:

      query.data?.customers || [],





    revenue:

      query.data?.revenue || 0



  };


};