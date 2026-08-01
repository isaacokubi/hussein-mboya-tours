import {
  useQuery
} from "@tanstack/react-query";


import {
  useParams,
  useNavigate
} from "react-router-dom";


import {
  getTourById
} from "../api/tourApi";





export default function TourDetails(){



  const {
    id
  } = useParams();



  const navigate = useNavigate();





  const {

    data,

    isLoading,

    error


  } = useQuery({


    queryKey:[

      "tour",

      id

    ],



    queryFn:()=>getTourById(id),



    enabled:Boolean(id)


  });






  /*
  |--------------------------------------------------------------------------
  | FIX RESPONSE STRUCTURE
  |--------------------------------------------------------------------------
  */


  const tour =

    data?.data || data;








  if(isLoading){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      ">

        Loading tour details...


      </div>

    );


  }







  if(error || !tour){


    return (

      <div className="
      min-h-screen
      flex
      items-center
      justify-center
      text-red-600
      ">

        Tour not found.


      </div>

    );


  }









  const image =


    tour.images?.[0]?.url ||

    tour.images?.[0] ||

    tour.image ||

    "/images/tour-placeholder.jpg";







  const handleBooking = ()=>{


    navigate(

      `/checkout/${tour._id}`

    );


  };









  return (


    <div

    className="
    min-h-screen
    bg-gray-100
    p-6
    "

    >



      <div

      className="
      max-w-7xl
      mx-auto
      bg-white
      rounded-3xl
      shadow-xl
      p-8
      grid
      md:grid-cols-2
      gap-10
      "

      >




        {/* IMAGE */}


        <div>


          <img

          src={image}

          alt={tour.title}

          className="
          w-full
          h-[500px]
          object-cover
          rounded-2xl
          "

          />


        </div>








        {/* DETAILS */}


        <div>



          <h1

          className="
          text-5xl
          font-bold
          text-green-900
          "

          >

            {tour.title}


          </h1>






          <p

          className="
          mt-5
          text-gray-600
          leading-relaxed
          "

          >

            {tour.description}


          </p>







          <div

          className="
          mt-6
          text-4xl
          font-bold
          text-green-700
          "

          >

            KES {Number(
              tour.price || 0
            ).toLocaleString()}


          </div>







          <div

          className="
          mt-8
          space-y-4
          text-lg
          "

          >



            <p>

            📍

            <strong>
            Destination:
            </strong>

            {" "}

            {

              tour.destination?.name ||

              tour.destination ||

              "N/A"

            }

            </p>






            <p>

            ⏳

            <strong>
            Duration:
            </strong>

            {" "}

            {

              tour.duration ||

              tour.durationDays ||

              "N/A"

            }

            </p>







            <p>

            🏕️

            <strong>
            Category:
            </strong>

            {" "}

            {

              tour.category ||

              "N/A"

            }

            </p>







            <p>

            👥

            <strong>
            Capacity:
            </strong>

            {" "}

            {

              tour.capacity ||

              tour.maxGuests ||

              "N/A"

            }

            </p>







            <p>

            🎟️

            <strong>
            Available Slots:
            </strong>

            {" "}

            {

              tour.availableSlots ??

              tour.capacity ??

              tour.maxGuests ??

              "N/A"

            }

            </p>




          </div>








          <button


          onClick={handleBooking}


          className="
          mt-10
          bg-green-700
          hover:bg-green-800
          text-white
          px-10
          py-4
          rounded-full
          font-bold
          text-lg
          "

          >

            Book This Adventure


          </button>





        </div>





      </div>



    </div>


  );


}