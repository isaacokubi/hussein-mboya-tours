/**
 * Purpose: Tour Availability page-level UI component. Main declarations: TourAvailability, save, AvailabilityCard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/pages/tour-manager/TourAvailability.jsx

// Load react so this module can use its exported dependencies.
import {
  useState
} from "react";


// Load react-router-dom so this module can use its exported dependencies.
import {
  useParams,
  useNavigate
} from "react-router-dom";


// Load @tanstack/react-query so this module can use its exported dependencies.
import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


// Load react-toastify so this module can use its exported dependencies.
import {
  toast
} from "react-toastify";


// Load ../../api/tourApi so this module can use its exported dependencies.
import {
  getTourAvailability,
  updateTourAvailability
} from "../../api/tourApi";





// Define TourAvailability; its parameters and body implement this operation.
export default function TourAvailability(){


  // Declare { id } for use by the surrounding module or function.
  const {
    id
  } = useParams();



  // Declare navigate for use by the surrounding module or function.
  const navigate = useNavigate();


  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();





  // Declare [capacity,setCapacity] for use by the surrounding module or function.
  const [capacity,setCapacity] = useState("");





  // Declare { data: availability = {}, isLoading } for use by the surrounding module or function.
  const {
    data: availability = {},
    isLoading
  } = useQuery({

    queryKey:[
      "tour-availability",
      id
    ],


    queryFn: async()=>{


      // Declare response for use by the surrounding module or function.
      const response =
        await getTourAvailability(id);



      // Declare data for use by the surrounding module or function.
      const data =
        response.data?.data ||
        response.data?.availability ||
        response.data ||
        {};



      // Return the value of data to the caller.
      return data;


    },


    enabled:!!id


  });








  // Declare mutation for use by the surrounding module or function.
  const mutation = useMutation({


    mutationFn:(payload)=>

      updateTourAvailability(
        id,
        payload
      ),



    onSuccess:()=>{


      // Perform the side effect or state update expressed on the following line.
      toast.success(
        "Availability updated"
      );



      // Perform the side effect or state update expressed on the following line.
      queryClient.invalidateQueries({

        queryKey:[
          "tour-availability",
          id
        ]

      });



      // Perform the side effect or state update expressed on the following line.
      navigate(
        "/tour-manager/tours"
      );


    },


    onError:()=>{


      // Perform the side effect or state update expressed on the following line.
      toast.error(
        "Update failed"
      );


    }


  });










  // Declare save for use by the surrounding module or function.
  const save = ()=>{


    // Perform the side effect or state update expressed on the following line.
    mutation.mutate({

      totalSlots:Number(capacity)

    });


  };








  // Check the condition (isLoading) and run the matching branch.
  if(isLoading){


    // Return the expression shown below to the caller.
    return (

      <div className="p-6">

        Loading availability...

      </div>

    );

  }







  // Return the expression shown below to the caller.
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








// Define AvailabilityCard; its parameters and body implement this operation.
function AvailabilityCard({

  title,

  value,

  style

}){


  // Return the expression shown below to the caller.
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
