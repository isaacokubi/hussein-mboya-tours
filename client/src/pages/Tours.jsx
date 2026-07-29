import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTours } from "../../api/tourApi";


export default function Tours() {


  const [search, setSearch] = useState("");



  const {
    data,
    isLoading,
    error
  } = useQuery({

    queryKey: ["tour-manager-tours"],

    queryFn: getTours,

  });





  const tours = data?.tours || [];





  const filteredTours = tours.filter((tour) => {


    const destinationName =

      typeof tour.destination === "object"

        ? tour.destination?.name

        : tour.destination;



    return (

      tour.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

      ||

      destinationName
        ?.toLowerCase()
        .includes(search.toLowerCase())

    );


  });





  if (isLoading) {


    return (

      <div className="flex items-center justify-center min-h-[400px]">

        <div
          className="
          w-10
          h-10
          border-4
          border-yellow-500
          border-t-transparent
          rounded-full
          animate-spin
          "
        />

      </div>

    );


  }





  if (error) {


    return (

      <div
        className="
        p-6
        bg-red-50
        border
        border-red-200
        rounded-xl
        text-red-600
        "
      >

        Failed to load tours.

      </div>

    );


  }





  return (

    <div className="space-y-6">



      {/* HEADER */}

      <div
        className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        "
      >

        <h1 className="text-3xl font-bold">

          Tours Management

        </h1>



        <input

          type="text"

          placeholder="Search tours..."

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          className="
          w-full
          md:w-80
          px-4
          py-2
          border
          rounded-lg
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-500
          "

        />


      </div>





      {/* TOURS */}

      {
        filteredTours.length === 0 ? (


          <div
            className="
            bg-white
            rounded-xl
            shadow
            p-10
            text-center
            "
          >

            <h2 className="text-xl font-semibold text-gray-700">

              No tours found

            </h2>


            <p className="text-gray-500 mt-2">

              Try changing your search criteria.

            </p>


          </div>


        ) : (


          <div
            className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
            "
          >


            {
              filteredTours.map((tour)=>(


                <div

                  key={tour._id}

                  className="
                  bg-white
                  rounded-xl
                  shadow
                  overflow-hidden
                  hover:shadow-lg
                  transition
                  "

                >





                  {/* IMAGE */}

                  <img

                    src={

                      typeof tour.images?.[0] === "object"

                        ? tour.images?.[0]?.url

                        : tour.images?.[0]

                        ||

                        tour.image

                        ||

                        "https://via.placeholder.com/600x400"

                    }


                    alt={
                      tour.title || "Tour"
                    }


                    className="
                    w-full
                    h-52
                    object-cover
                    "

                  />







                  <div className="p-5">





                    <h3 className="text-xl font-bold mb-2">

                      {tour.title || "Untitled Tour"}

                    </h3>







                    <p
                      className="
                      text-gray-600
                      text-sm
                      mb-3
                      "
                    >

                      📍 {


                        typeof tour.destination === "object"

                        ? tour.destination?.name

                        : tour.destination || "Unknown destination"


                      }


                    </p>







                    <p
                      className="
                      text-gray-600
                      text-sm
                      line-clamp-3
                      mb-4
                      "
                    >

                      {tour.description || "No description available."}

                    </p>







                    <div
                      className="
                      flex
                      items-center
                      justify-between
                      "
                    >



                      <span
                        className="
                        text-yellow-600
                        font-bold
                        text-lg
                        "
                      >

                        $
                        {
                          tour.price
                          ? tour.price.toLocaleString()
                          : 0
                        }

                      </span>







                      <span

                        className={`

                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium


                        ${
                          tour.status === "active"

                          ?

                          "bg-green-100 text-green-700"

                          :

                          "bg-gray-100 text-gray-700"

                        }


                        `}

                      >

                        {tour.status || "Draft"}

                      </span>



                    </div>







                    <div className="mt-4 flex gap-2">



                      <button

                        className="
                        flex-1
                        bg-yellow-500
                        hover:bg-yellow-600
                        text-white
                        py-2
                        rounded-lg
                        "

                      >

                        Edit

                      </button>





                      <button

                        className="
                        flex-1
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        py-2
                        rounded-lg
                        "

                      >

                        Delete

                      </button>



                    </div>





                  </div>



                </div>


              ))
            }



          </div>


        )

      }



    </div>

  );

}