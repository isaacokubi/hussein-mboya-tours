/**
 * Purpose: use Featured Tours reusable React hook. Main declarations: useFeaturedTours.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/hooks/useFeaturedTours.js

// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery
} from "@tanstack/react-query";


// Load ../api/tourApi so this module can use its exported dependencies.
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


// Define useFeaturedTours; its parameters and body implement this operation.
export default function useFeaturedTours() {


  // Declare query for use by the surrounding module or function.
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


        // Declare response for use by the surrounding module or function.
        const response =
          await getFeaturedTours();



        // Return the expression shown below to the caller.
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






  // Return the object assembled below to the caller.
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
