import { useState } from "react";

import {
  useQuery
} from "@tanstack/react-query";


import {
  getAdminTours,
  deleteTour
} from "../../api/adminTourApi";



export default function ManageTours() {


  const [search, setSearch] = useState("");



  const {

    data: tours = [],

    isLoading,

    error,

    refetch

  } = useQuery({

    queryKey: ["adminTours"],

    queryFn: getAdminTours

  });





  const remove = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tour?"
    );


    if (!confirmDelete) return;


    await deleteTour(id);


    refetch();

  };





  const filteredTours = tours.filter((tour) => {


    const destination =

      typeof tour.destination === "object"

        ? tour.destination?.name

        : tour.destination;



    return (

      tour.title
        ?.toLowerCase()
        .includes(search.toLowerCase())


      ||


      destination
        ?.toLowerCase()
        .includes(search.toLowerCase())


    );


  });





  if (isLoading) {


    return (

      <div className="
        flex
        justify-center
        py-20
        text-lg
      ">

        Loading tours...

      </div>

    );

  }





  if (error) {


    return (

      <div className="
        p-6
        text-red-600
      ">

        Failed loading tours.

      </div>

    );

  }





  return (

    <div className="
      space-y-8
    ">



      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
      ">



        <h1 className="
          text-3xl
          font-bold
        ">

          Tours Management

        </h1>




        <div className="
          flex
          gap-4
        ">


          <input

            type="text"

            placeholder="Search tours..."

            value={search}

            onChange={(e)=>setSearch(e.target.value)}

            className="
              border
              rounded-lg
              px-4
              py-2
              w-64
            "

          />



          <a

            href="/admin/tours/add"

            className="
              bg-green-600
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-green-700
            "

          >

            Add Tour

          </a>



        </div>



      </div>







      {
        filteredTours.length === 0 ? (


          <div className="
            bg-white
            rounded-xl
            shadow
            p-10
            text-center
          ">


            <h2 className="
              text-xl
              font-semibold
            ">

              No tours found

            </h2>


          </div>


        ) : (



          <div className="
            grid
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          ">




            {
              filteredTours.map((tour)=>(



                <div

                  key={tour._id}

                  className="
                    bg-white
                    rounded-xl
                    shadow
                    overflow-hidden
                  "

                >




                  <img


                    src={

                      tour.image ||

                      (

                        typeof tour.images?.[0] === "object"

                          ? tour.images?.[0]?.url

                          : tour.images?.[0]

                      )

                      ||

                      "/images/tour-placeholder.jpg"

                    }


                    alt={tour.title || "Tour"}


                    className="
                      w-full
                      h-48
                      object-cover
                    "

                  />






                  <div className="p-5">



                    <h2 className="
                      text-xl
                      font-bold
                    ">

                      {tour.title}

                    </h2>




                    <p className="
                      text-gray-600
                      mt-2
                    ">

                      📍 {

                        typeof tour.destination === "object"

                          ? tour.destination?.name

                          : tour.destination

                      }

                    </p>






                    <p className="
                      text-yellow-600
                      font-bold
                      mt-3
                    ">

                      ${tour.price?.toLocaleString("en-US") || 0}

                    </p>






                    <span className="
                      inline-block
                      mt-2
                      text-sm
                      px-3
                      py-1
                      rounded-full
                      bg-green-100
                      text-green-700
                    ">

                      {tour.status || "active"}

                    </span>






                    <div className="
                      flex
                      gap-3
                      mt-5
                    ">



                      <button

                        className="
                          flex-1
                          bg-blue-600
                          text-white
                          px-4
                          py-2
                          rounded
                        "

                      >

                        Edit

                      </button>






                      <button


                        onClick={() => remove(tour._id)}


                        className="
                          flex-1
                          bg-red-600
                          text-white
                          px-4
                          py-2
                          rounded
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