// client/src/pages/tourManager/AssignGuides.jsx


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
    assignGuide
}
from "../../api/tourManagerApi";









const AssignGuides =()=>{



    const queryClient = useQueryClient();








    const {

        data,

        isLoading

    } = useQuery({



        queryKey:[

            "availableGuides"

        ],



        queryFn:getGuides



    });









    const guides =

        data?.guides ||

        data?.data ||

        data ||

        [];









    const {

        mutate:assign,

        isPending

    } = useMutation({



        mutationFn:(guideId)=>

            assignGuide(

                guideId

            ),





        onSuccess:()=>{



            toast.success(

                "Guide assigned successfully"

            );



            queryClient.invalidateQueries({

                queryKey:[

                    "availableGuides"

                ]

            });


        },



        onError:()=>{


            toast.error(

                "Failed to assign guide"

            );


        }



    });









    if(isLoading)

    return (

        <div className="p-6">

            Loading guides...

        </div>

    );









    return (



        <div className="p-6">






            <h1 className="
                text-3xl
                font-bold
            ">


                Available Guides


            </h1>









            <div className="
                grid
                md:grid-cols-3
                gap-5
                mt-6
            ">







            {

                guides.length === 0 ? (


                    <div className="
                        bg-white
                        rounded-xl
                        shadow
                        p-5
                    ">


                        No guides available


                    </div>



                ) : (



                    guides.map(guide=>(





                        <div


                        className="
                            bg-white
                            shadow
                            rounded-xl
                            p-5
                        "



                        key={guide._id}



                        >







                            <h2 className="
                                font-bold
                                text-xl
                            ">


                                {

                                    guide.name ||

                                    `${guide.firstName || ""} ${guide.lastName || ""}`

                                }



                            </h2>









                            <p className="
                                mt-2
                                text-gray-600
                            ">


                                Experience:

                                {" "}

                                {

                                    guide.experience || 0

                                }

                                {" "}years



                            </p>









                            <button



                                onClick={()=>assign(guide._id)}



                                disabled={isPending}



                                className="
                                    bg-green-700
                                    hover:bg-green-800
                                    disabled:opacity-50
                                    text-white
                                    p-2
                                    rounded
                                    mt-3
                                    w-full
                                "



                            >


                                {

                                    isPending

                                    ?

                                    "Assigning..."

                                    :

                                    "Assign Tour"

                                }



                            </button>







                        </div>







                    ))

                )

            }





            </div>







        </div>



    );


};







export default AssignGuides;