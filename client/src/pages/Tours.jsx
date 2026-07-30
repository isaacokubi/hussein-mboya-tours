import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getTours } from "../api/tourApi";


export default function Tours() {


  const {
    data,
    isLoading,
    error,

  } = useQuery({

    queryKey: ["public-tours"],

    queryFn: getTours,

  });



  if (isLoading) {

    return (

      <div className="
        min-h-[400px]
        flex
        items-center
        justify-center
      ">

        <div className="
          w-10
          h-10
          border-4
          border-yellow-500
          border-t-transparent
          rounded-full
          animate-spin
        "/>

      </div>

    );

  }



  if (error) {

    return (

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-20
        text-center
        text-red-600
      ">

        Failed to load tours.

      </div>

    );

  }



  const tours = data?.tours || [];



  return (

    <div className="
      max-w-7xl
      mx-auto
      px-6
      py-12
    ">



      <div className="mb-10">


        <h1 className="
          text-4xl
          font-bold
          text-gray-800
        ">

          Explore Our Tours

        </h1>


        <p className="
          text-gray-600
          mt-3
        ">

          Discover unforgettable African adventures with Hussein Mboya Tours.

        </p>


      </div>





      {
        tours.length === 0 ? (

          <div className="
            text-center
            py-20
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">

              No tours available

            </h2>

          </div>


        ) : (



          <div className="
            grid
            md:grid-cols-2
            lg:grid-cols-3
            gap-8
          ">



          {

          tours.map((tour)=>(


            <div
              key={tour._id}
              className="
                bg-white
                rounded-2xl
                shadow
                overflow-hidden
                hover:shadow-xl
                transition
              "
            >



              <img

                src={

                  tour.images?.[0]?.url ||

                  tour.image ||

                  "https://via.placeholder.com/600x400"

                }

                alt={tour.title}

                className="
                  w-full
                  h-56
                  object-cover
                "

              />





              <div className="p-6">



                <h2 className="
                  text-xl
                  font-bold
                  text-gray-800
                ">

                  {tour.title}

                </h2>





                <p className="
                  text-gray-600
                  mt-2
                ">

                  📍 {

                    tour.destination?.name ||

                    tour.destination ||

                    "Kenya"

                  }

                </p>





                <p className="
                  text-gray-600
                  mt-4
                  line-clamp-3
                ">

                  {tour.description}

                </p>





                <div className="
                  flex
                  justify-between
                  items-center
                  mt-6
                ">


                  <span className="
                    text-yellow-600
                    font-bold
                    text-xl
                  ">

                    ${tour.price}

                  </span>




                  <Link

                    to={`/tours/${tour._id}`}

                    className="
                      bg-green-600
                      text-white
                      px-5
                      py-2
                      rounded-lg
                      hover:bg-green-700
                    "

                  >

                    View Tour

                  </Link>



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