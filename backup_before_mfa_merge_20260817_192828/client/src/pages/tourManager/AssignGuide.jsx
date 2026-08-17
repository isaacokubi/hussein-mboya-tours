// client/src/pages/tourManager/AssignGuide.jsx


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

    getGuides,

    assignGuide,

    getTour

}
from "../../api/tourApi";









const AssignGuide =()=>{



    const {

        id

    } = useParams();




    const navigate = useNavigate();



    const queryClient = useQueryClient();







    const [

        guide,

        setGuide

    ] = useState("");









    const {

        data:guidesData

    } = useQuery({



        queryKey:[

            "guides"

        ],



        queryFn:getGuides



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









    const tour =

        tourData?.tour ||

        tourData?.data?.tour ||

        null;








    const guidesRaw =
    Array.isArray(guidesData?.data)
        ? guidesData.data
        : Array.isArray(guidesData)
        ? guidesData
        : [];

    const guides = guidesRaw.filter((item) => {
        const position = String(item?.position || item?.role || "").toLowerCase().replace(/[\s_-]/g, "");
        return position === "guide" || position === "tourguide";
    });









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



            toast.success(

                "Guide assigned successfully"

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