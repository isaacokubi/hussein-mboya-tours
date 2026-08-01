import {
  useQuery
} from "@tanstack/react-query";

import api from "../api/axios";

import DestinationCard from "../components/destinations/DestinationCard";


export default function Destinations() {


  const {
    data = [],
    isLoading,
    error

  } = useQuery({

    queryKey: [
      "destinations"
    ],


    queryFn: async () => {


      const response = await api.get(
        "/destinations"
      );


      console.log(
        "DESTINATIONS PAGE RESPONSE:",
        response.data
      );



      const destinations =


        Array.isArray(response.data)

        ? response.data



        : Array.isArray(response.data.destinations)

        ? response.data.destinations



        : Array.isArray(response.data.data)

        ? response.data.data



        : Array.isArray(response.data.data?.destinations)

        ? response.data.data.destinations



        : [];



      console.log(
        "DESTINATIONS PAGE ARRAY:",
        destinations
      );



      return destinations;


    },


    staleTime:
      1000 * 60 * 10,


  });






  if (isLoading) {


    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <p
          className="
            text-xl
            font-semibold
          "
        >

          Loading destinations...

        </p>


      </div>

    );

  }






  if (error) {


    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          text-red-600
          font-semibold
        "
      >

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



        <div
          className="
            mb-10
          "
        >


          <h1
            className="
              text-4xl
              md:text-5xl
              font-bold
              text-gray-800
            "
          >

            Explore Destinations

          </h1>



          <p
            className="
              text-gray-500
              mt-3
            "
          >

            Discover amazing places and unforgettable experiences with Hussein Mboya Tours.

          </p>


        </div>






        {
          data.length === 0 ? (

            <div
              className="
                bg-white
                rounded-xl
                shadow
                p-10
                text-center
                text-gray-500
              "
            >

              No destinations available.

            </div>


          ) : (



            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                gap-8
              "
            >



              {
                data.map((destination) => (


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