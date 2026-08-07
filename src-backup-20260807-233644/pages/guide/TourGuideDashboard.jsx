// client/src/pages/guide/TourGuideDashboard.jsx


import {
    useMutation,
    useQuery,
    useQueryClient
} from "@tanstack/react-query";


import {
    toast
} from "react-toastify";


import {

    getGuideDashboard,

    updateTourStatus

}
from "../../api/guideApi";








export default function TourGuideDashboard(){



    const queryClient = useQueryClient();








    const {

        data,

        isLoading,

        isError

    } = useQuery({



        queryKey:[

            "guideDashboard"

        ],



        queryFn:getGuideDashboard



    });









    const {

        mutate:startTour

    } = useMutation({



        mutationFn:(id)=>

            updateTourStatus(

                id,

                "ongoing"

            ),





        onSuccess:()=>{


            queryClient.invalidateQueries({

                queryKey:[

                    "guideDashboard"

                ]

            });



            toast.success(

                "Tour started successfully"

            );


        },



        onError:()=>{


            toast.error(

                "Failed to update tour status"

            );


        }



    });









    const tours =

        data?.tours ||

        data?.data?.tours ||

        [];









    if(isLoading)

    return (

        <div className="p-6">

            Loading guide dashboard...

        </div>

    );









    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load guide dashboard

        </div>

    );









    return (



        <div className="p-6">





            <h1 className="
                text-3xl
                font-bold
                mb-8
            ">


                Guide Dashboard


            </h1>









            <div className="
                space-y-5
            ">





            {

                tours.length === 0 ? (



                    <div className="
                        bg-white
                        shadow
                        rounded-xl
                        p-6
                        text-gray-500
                    ">


                        No assigned tours available.


                    </div>




                ) : (



                    tours.map(tour=>(




                        <div


                        key={tour._id}


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


                                {tour.title}



                            </h2>









                            <p className="mt-2">


                                Status:

                                <span className="
                                    ml-2
                                    font-semibold
                                ">


                                    {

                                        tour.tourStatus ||

                                        "Pending"

                                    }



                                </span>



                            </p>









                            <p className="mt-2">


                                Vehicle:


                                <span className="font-semibold ml-2">


                                    {

                                        tour.assignedVehicle?.name ||

                                        "Not assigned"

                                    }


                                </span>



                            </p>









                            <p className="mt-2">


                                Driver:


                                <span className="font-semibold ml-2">


                                    {

                                        tour.assignedDriver?.name ||

                                        "Not assigned"

                                    }


                                </span>



                            </p>









                            <button


                                onClick={()=>startTour(tour._id)}



                                disabled={

                                    tour.tourStatus==="ongoing"

                                }



                                className="
                                    bg-green-700
                                    text-white
                                    px-4
                                    py-2
                                    rounded
                                    mt-4
                                    disabled:opacity-50
                                "



                            >


                                {

                                    tour.tourStatus==="ongoing"

                                    ?

                                    "Tour Started"

                                    :

                                    "Start Tour"

                                }



                            </button>







                        </div>






                    ))



                )

            }





            </div>







        </div>


    );


}