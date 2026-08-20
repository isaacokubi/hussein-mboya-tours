import {
  useQuery
} from "@tanstack/react-query";


import api from "../api/axios";


import DestinationCard from "../components/destinations/DestinationCard";



export default function Destinations(
){



  const {

    data = [],

    isLoading,

    error


  } = useQuery({



    queryKey:[

      "destinations"

    ],



    queryFn:async()=>{


      const response =

      await api.get(
        "/destinations"
      );




      const destinations =



      Array.isArray(response.data)

      ?

      response.data




      :

      Array.isArray(response.data.data)

      ?

      response.data.data




      :

      [];




      return destinations;


    },



    staleTime:

    1000 * 60 * 10


  });







  if(isLoading){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      ">

        Loading destinations...


      </div>

    );

  }








  if(error){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      text-red-600
      ">

        Failed to load destinations.


      </div>

    );


  }








  return (



    <div

    className="
    min-h-screen
    bg-gray-100
    p-6
    md:p-10
    "

    >



      <div

      className="
      max-w-7xl
      mx-auto
      "

      >



        <h1

        className="
        text-4xl
        font-bold
        mb-4
        text-gray-800
        "

        >

          Explore Destinations


        </h1>





        <p

        className="
        text-gray-600
        mb-10
        "

        >

          Discover amazing places and unforgettable experiences with Coherent Tours.


        </p>









        {

          data.length === 0 ?



          (

            <div

            className="
            bg-white
            rounded-xl
            shadow
            p-10
            text-center
            "

            >

              No destinations available.


            </div>


          )



          :



          (

            <div

            className="
            grid
            sm:grid-cols-2
            lg:grid-cols-3
            gap-8
            "

            >



              {

                (Array.isArray(data) ? data : []).map((destination)=>(


                  <DestinationCard


                    key={destination._id}


                    destination={destination}


                  />


                ))

              }



            </div>


          )

        }





      </div>



    </div>


  );


}