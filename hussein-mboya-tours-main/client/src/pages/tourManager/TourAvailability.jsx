// client/src/pages/tour-manager/TourAvailability.jsx

import {
  useEffect,
  useState
} from "react";


import {
  useParams,
  useNavigate
} from "react-router-dom";


import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import {
  toast
} from "react-toastify";


import {
  getTourAvailability,
  updateTourAvailability
} from "../../api/tourApi";





export default function TourAvailability(){


  const {
    id
  } = useParams();



  const navigate = useNavigate();


  const queryClient = useQueryClient();





  const [capacity,setCapacity] = useState("");





  const {
    data: availability = {},
    isLoading
  } = useQuery({

    queryKey:[
      "tour-availability",
      id
    ],


    queryFn: async()=>{


      const response =
        await getTourAvailability(id);



      const data =
        response.data?.data ||
        response.data?.availability ||
        response.data ||
        {};



      return data;


    },


    enabled:!!id


  });








  const mutation = useMutation({


    mutationFn:(payload)=>

      updateTourAvailability(
        id,
        payload
      ),



    onSuccess:()=>{


      toast.success(
        "Availability updated"
      );



      queryClient.invalidateQueries({

        queryKey:[
          "tour-availability",
          id
        ]

      });



      navigate(
        "/tour-manager/tours"
      );


    },


    onError:()=>{


      toast.error(
        "Update failed"
      );


    }


  });










  const save = ()=>{


    mutation.mutate({

      totalSlots:Number(capacity)

    });


  };








  if(isLoading){


    return (

      <div className="p-6">

        Loading availability...

      </div>

    );

  }







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
          max-w-xl
          mx-auto
          bg-white
          rounded-xl
          shadow
          p-8
        "
      >



        <h1
          className="
            text-2xl
            font-bold
            mb-6
          "
        >

          Tour Availability

        </h1>







        <div
          className="
            space-y-4
          "
        >





          <AvailabilityCard

            title="Total Slots"

            value={
              availability.totalSlots || 0
            }

            style="
              bg-blue-50
            "

          />






          <AvailabilityCard

            title="Booked Slots"

            value={
              availability.bookedSlots || 0
            }

            style="
              bg-red-50
            "

          />








          <AvailabilityCard
            title="Occupancy"
            value={`${availability.occupancyRate || 0}%`}
            style="bg-amber-50"
          />

          <AvailabilityCard

            title="Available Slots"

            value={
              availability.availableSlots || 0
            }

            style="
              bg-green-50
            "

          />








          <input


            type="number"


            value={capacity}


            onChange={(e)=>
              setCapacity(
                e.target.value
              )
            }


            className="
              border
              rounded-lg
              p-3
              w-full
            "


            min="0"


          />









          <button


            onClick={save}


            disabled={
              mutation.isPending
            }


            className="
              w-full
              bg-orange-600
              hover:bg-orange-700
              text-white
              py-3
              rounded-lg
              disabled:opacity-50
            "


          >

            {
              mutation.isPending
              ?
              "Updating..."
              :
              "Update Capacity"
            }


          </button>






        </div>





      </div>





    </div>

  );


}








function AvailabilityCard({

  title,

  value,

  style

}){


  return (

    <div
      className={`
        ${style}
        p-4
        rounded-lg
      `}
    >


      <p>
        {title}
      </p>


      <h2
        className="
          text-3xl
          font-bold
        "
      >

        {value}

      </h2>


    </div>

  );


}