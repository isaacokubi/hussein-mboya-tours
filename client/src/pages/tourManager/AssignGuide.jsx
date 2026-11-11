/**
 * Purpose: Assign Guide page-level UI component. Main declarations: AssignGuide.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/pages/tourManager/AssignGuide.jsx


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

    getGuides,

    assignGuide,

    getTour

}
from "../../api/tourApi";









// Declare AssignGuide for use by the surrounding module or function.
const AssignGuide =()=>{



    // Declare { id } for use by the surrounding module or function.
    const {

        id

    } = useParams();




    // Declare navigate for use by the surrounding module or function.
    const navigate = useNavigate();



    // Declare queryClient for use by the surrounding module or function.
    const queryClient = useQueryClient();







    // Declare [ guide, setGuide ] for use by the surrounding module or function.
    const [

        guide,

        setGuide

    ] = useState("");









    // Declare { data:guidesData } for use by the surrounding module or function.
    const {

        data:guidesData

    } = useQuery({



        queryKey:[

            "guides"

        ],



        queryFn:getGuides



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









    // Declare tour for use by the surrounding module or function.
    const tour =

        tourData?.tour ||

        tourData?.data?.tour ||

        null;








    // Declare guidesRaw for use by the surrounding module or function.
    const guidesRaw =
    Array.isArray(guidesData?.data)
        ? guidesData.data
        : Array.isArray(guidesData)
        ? guidesData
        : [];

    // Declare guides for use by the surrounding module or function.
    const guides = guidesRaw.filter((item) => {
        // Declare position for use by the surrounding module or function.
        const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");
        // Return the expression shown below to the caller.
        return position === "guide" || position === "tourguide";
    });









    // Declare { mutate:saveGuide, isPending } for use by the surrounding module or function.
    const {

        mutate:saveGuide,

        isPending

    } = useMutation({



        mutationFn:()=>


            assignGuide(

                id,

                guide

            ),





        onSuccess:()=>{



            // Perform the side effect or state update expressed on the following line.
            toast.success(

                "Guide assigned successfully"

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
                rounded-xl
                shadow
                p-8
            ">





                <h1 className="
                    text-2xl
                    font-bold
                    mb-5
                ">


                    Assign Guide


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


                    value={guide}



                    onChange={

                        e=>

                        setGuide(

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


                        Select Guide


                    </option>






                    {

                        guides.map(item=>(




                            <option


                            key={item._id}


                            value={item._id}


                            >


                                {

                                    item.name ||

                                    item.firstName

                                }



                            </option>





                        ))



                    }







                </select>









                <button



                    onClick={saveGuide}



                    disabled={

                        !guide ||

                        isPending

                    }



                    className="
                        mt-6
                        w-full
                        bg-green-600
                        hover:bg-green-700
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

                        "Assign Guide"

                    }



                </button>







            </div>







        </div>


    );


};







export default AssignGuide;
