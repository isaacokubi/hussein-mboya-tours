/**
 * Purpose: Assign Vehicle page-level UI component. Main declarations: AssignVehicle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/pages/tourManager/AssignVehicle.jsx


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

    getVehicles,

    assignVehicle,

    getTour

}
from "../../api/tourApi";









// Declare AssignVehicle for use by the surrounding module or function.
const AssignVehicle =()=>{



    // Declare { id } for use by the surrounding module or function.
    const {

        id

    } = useParams();




    // Declare navigate for use by the surrounding module or function.
    const navigate = useNavigate();



    // Declare queryClient for use by the surrounding module or function.
    const queryClient = useQueryClient();








    // Declare [ vehicle, setVehicle ] for use by the surrounding module or function.
    const [

        vehicle,

        setVehicle

    ] = useState("");









    // Declare { data:vehicleData } for use by the surrounding module or function.
    const {

        data:vehicleData

    } = useQuery({



        queryKey:[

            "vehicles"

        ],



        queryFn:getVehicles



    });









    // Declare { data:tourData, isLoading } for use by the surrounding module or function.
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









    // Declare vehicles for use by the surrounding module or function.
    const vehicles =
        Array.isArray(vehicleData?.data)
            ? vehicleData.data
            : Array.isArray(vehicleData?.vehicles)
                ? vehicleData.vehicles
                : Array.isArray(vehicleData?.data?.vehicles)
                    ? vehicleData.data.vehicles
                    : [];









    // Declare tour for use by the surrounding module or function.
    const tour =

        tourData?.tour ||

        tourData?.data?.tour ||

        null;









    // Declare { mutate:saveVehicle, isPending } for use by the surrounding module or function.
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


            // Perform the side effect or state update expressed on the following line.
            toast.success(

                "Vehicle assigned successfully"

            );



            // Perform the side effect or state update expressed on the following line.
            queryClient.invalidateQueries({

                queryKey:[

                    "tour",

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

                "Assignment failed"

            );


        }



    });









    // Check the condition (isLoading) and run the matching branch.
    if(isLoading)

    // Return the expression shown below to the caller.
    return (

        <div className="p-6">

            Loading tour...

        </div>

    );









    // Return the expression shown below to the caller.
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
