// client/src/pages/tour-manager/TourAssignments.jsx

import {
  useState
} from "react";


import {
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";


import {
  getTours,
  getGuides,
  getDrivers,
  getVehicles,
  assignTour
} from "../../api/tourAssignmentApi";




export default function TourAssignments(){


  const queryClient = useQueryClient();



  const [assignments,setAssignments] = useState({});




  const {
    data: tours = [],
    isLoading: toursLoading
  } = useQuery({

    queryKey:[
      "assignment-tours"
    ],

    queryFn: async()=>{

      const res = await getTours();

      return res.data.tours || res.data || [];

    }

  });





  const {
    data: guides = []
  } = useQuery({

    queryKey:[
      "assignment-guides"
    ],

    queryFn: async()=>{

      const res = await getGuides();

      return res.data.users || res.data.staff || [];

    }

  });





  const {
    data: drivers = []
  } = useQuery({

    queryKey:[
      "assignment-drivers"
    ],

    queryFn: async()=>{

      const res = await getDrivers();

      return res.data.users || res.data.staff || [];

    }

  });





  const {
    data: vehicles = []
  } = useQuery({

    queryKey:[
      "assignment-vehicles"
    ],

    queryFn: async()=>{

      const res = await getVehicles();

      return res.data.vehicles || [];

    }

  });








  const mutation = useMutation({

    mutationFn:({
      tourId,
      payload
    })=>

      assignTour(
        tourId,
        payload
      ),



    onSuccess:()=>{

      alert(
        "Tour assigned successfully"
      );


      queryClient.invalidateQueries({

        queryKey:[
          "assignment-tours"
        ]

      });


    }



  });








  const handleChange=(tourId,field,value)=>{


    setAssignments(prev=>({


      ...prev,


      [tourId]:{


        ...prev[tourId],


        [field]:value


      }


    }));


  };








  const handleAssign=(tourId)=>{


    const selected =
      assignments[tourId] || {};



    mutation.mutate({

      tourId,


      payload:{


        guideId:selected.guideId,


        driverId:selected.driverId,


        vehicleId:selected.vehicleId


      }


    });


  };









  if(toursLoading){


    return (

      <div className="p-6">

        Loading assignments...

      </div>

    );

  }







  return (

    <div className="p-6">



      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">

        Tour Assignment Management

      </h1>





      <div className="space-y-6">


        {
          tours.map((tour)=>(


            <div

              key={tour?._id}

              className="
                bg-white
                shadow
                rounded-xl
                p-6
              "

            >



              <h2 className="
                text-xl
                font-bold
              ">

                {tour?.title}

              </h2>




              <p className="mt-2">

                Status:

                <span className="
                  ml-2
                  font-semibold
                ">

                  {
                    tour.assignmentStatus ||
                    tour?.status ||
                    "pending"
                  }

                </span>

              </p>







              <div className="
                grid
                md:grid-cols-3
                gap-4
                mt-5
              ">




                <select

                  value={
                    assignments[tour?._id]?.guideId || ""
                  }

                  onChange={(e)=>
                    handleChange(
                      tour?._id,
                      "guideId",
                      e.target.value
                    )
                  }

                  className="
                    border
                    p-3
                    rounded
                  "

                >

                  <option value="">
                    Select Guide
                  </option>


                  {
                    guides.map(guide=>(

                      <option

                        key={guide._id}

                        value={guide._id}

                      >

                        {guide.name}

                      </option>

                    ))
                  }


                </select>









                <select

                  value={
                    assignments[tour?._id]?.driverId || ""
                  }

                  onChange={(e)=>
                    handleChange(
                      tour?._id,
                      "driverId",
                      e.target.value
                    )
                  }

                  className="
                    border
                    p-3
                    rounded
                  "

                >

                  <option value="">
                    Select Driver
                  </option>


                  {
                    drivers.map(driver=>(

                      <option

                        key={driver._id}

                        value={driver._id}

                      >

                        {driver.name}

                      </option>

                    ))
                  }


                </select>









                <select

                  value={
                    assignments[tour?._id]?.vehicleId || ""
                  }

                  onChange={(e)=>
                    handleChange(
                      tour?._id,
                      "vehicleId",
                      e.target.value
                    )
                  }

                  className="
                    border
                    p-3
                    rounded
                  "

                >

                  <option value="">
                    Select Vehicle
                  </option>


                  {
                    vehicles.map(vehicle=>(

                      <option

                        key={vehicle._id}

                        value={vehicle._id}

                      >

                        {vehicle.name}
                        {" - "}
                        {
                          vehicle.registrationNumber ||
                          vehicle.registration
                        }

                      </option>

                    ))
                  }


                </select>





              </div>







              <button


                onClick={()=>
                  handleAssign(
                    tour?._id
                  )
                }


                disabled={
                  mutation.isPending
                }


                className="
                  mt-5
                  bg-green-700
                  hover:bg-green-800
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  disabled:opacity-50
                "

              >

                {
                  mutation.isPending
                  ?
                  "Assigning..."
                  :
                  "Assign Resources"
                }


              </button>





            </div>


          ))

        }



      </div>



    </div>

  );


}