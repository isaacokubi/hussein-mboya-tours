// client/src/pages/tourManager/AssignVehicle.jsx


import {
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

    getVehicles,

    assignVehicle,

    getTour

}
from "../../api/tourApi";









const AssignVehicle =()=>{



    const {

        id

    } = useParams();




    const navigate = useNavigate();



    const queryClient = useQueryClient();








    const [

        vehicle,

        setVehicle

    ] = useState("");









    const {

        data:vehicleData

    } = useQuery({



        queryKey:[

            "vehicles"

        ],



        queryFn:getVehicles



    });









    const {

        data:tourData,

        isLoading

    } = useQuery({



        queryKey:[

            "tour",

            id

        ],



        queryFn:()=>getTour(id)



    });









    const vehicles =
        Array.isArray(vehicleData?.data)
            ? vehicleData.data
            : Array.isArray(vehicleData?.vehicles)
                ? vehicleData.vehicles
                : Array.isArray(vehicleData?.data?.vehicles)
                    ? vehicleData.data.vehicles
                    : [];









    const tour =

        tourData?.tour ||

        tourData?.data?.tour ||

        null;









    const {

        mutate:saveVehicle,

        isPending

    } = useMutation({



        mutationFn:()=>


            assignVehicle(

                id,

                vehicle

            ),





        onSuccess:()=>{


            toast.success(

                "Vehicle assigned successfully"

            );



            queryClient.invalidateQueries({

                queryKey:[

                    "tour",

                    id

                ]

            });



            navigate(

                "/tour-manager/tours"

            );



        },



        onError:()=>{


            toast.error(

                "Assignment failed"

            );


        }



    });









    if(isLoading)

    return (

        <div className="p-6">

            Loading tour...

        </div>

    );









    return (



        <div className="
            min-h-screen
            bg-gray-100
            p-6
        ">







            <div className="
                max-w-xl
                mx-auto
                bg-white
                shadow
                rounded-xl
                p-8
            ">





                <h1 className="
                    text-2xl
                    font-bold
                    mb-5
                ">


                    Assign Vehicle


                </h1>









                {

                    tour &&


                    <p className="
                        mb-5
                        text-gray-600
                    ">


                        Tour:


                        <strong className="ml-2">


                            {tour?.title}


                        </strong>



                    </p>


                }









                <select


                    value={vehicle}



                    onChange={

                        e=>

                        setVehicle(

                            e.target.value

                        )

                    }



                    className="
                        border
                        rounded-lg
                        p-3
                        w-full
                    "



                >





                    <option value="">


                        Select Vehicle


                    </option>









                    {

                        vehicles.map(item=>(




                            <option


                            key={item._id}


                            value={item._id}


                            >



                                {

                                    item.name

                                }


                                {" - "}



                                {

                                    item.registration ||

                                    item.registrationNumber

                                }



                                {" ("}



                                {

                                    item.type

                                }



                                {")"}



                            </option>





                        ))



                    }







                </select>









                <button



                    onClick={saveVehicle}



                    disabled={

                        !vehicle ||

                        isPending

                    }



                    className="
                        mt-6
                        w-full
                        bg-purple-600
                        hover:bg-purple-700
                        disabled:opacity-50
                        text-white
                        py-3
                        rounded-lg
                    "



                >



                    {

                        isPending

                        ?

                        "Assigning..."

                        :

                        "Assign Vehicle"

                    }



                </button>







            </div>







        </div>


    );


};







export default AssignVehicle;