// client/src/hooks/useFeaturedTours.js

import {
  useQuery
} from "@tanstack/react-query";


import {
  getFeaturedTours
} from "../api/tourApi";





/*
|--------------------------------------------------------------------------
| FEATURED TOURS HOOK
|--------------------------------------------------------------------------
|
| Fetches featured tours for:
|
| - Home page
| - Featured tours section
| - Tour recommendations
|
| Flow:
|
| Component
|      |
|      ↓
| useFeaturedTours()
|      |
|      ↓
| getFeaturedTours()
|      |
|      ↓
| GET /api/tours/featured
|
|--------------------------------------------------------------------------
*/


export default function useFeaturedTours() {


  const query = useQuery({



    /*
    |--------------------------------------------------------------------------
    | CACHE KEY
    |--------------------------------------------------------------------------
    */

    queryKey: [

      "featured-tours"

    ],






    /*
    |--------------------------------------------------------------------------
    | API FUNCTION
    |--------------------------------------------------------------------------
    */

    queryFn:

      async()=>{


        const response =
          await getFeaturedTours();



        return (

          response?.tours

          ||

          response?.data

          ||

          response

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






  return {


    ...query,



    /*
    |--------------------------------------------------------------------------
    | SAFE DEFAULT
    |--------------------------------------------------------------------------
    */

    tours:

      query.data || []



  };


}
