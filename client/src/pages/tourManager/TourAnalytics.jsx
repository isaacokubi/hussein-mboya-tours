// client/src/pages/tourManager/TourAnalytics.jsx


import {
    useQuery
} from "@tanstack/react-query";


import {
    getAnalytics
} from "../../api/tourManagerApi";







export default function TourAnalytics(){





    const {

        data,

        isLoading,

        error

    } = useQuery({



        queryKey:[

            "tourAnalytics"

        ],



        queryFn:getAnalytics



    });









    if(isLoading)

    return (

        <div className="p-6">

            Loading analytics...

        </div>

    );









    if(error)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed loading analytics.

        </div>

    );









    const analytics =

        data?.data ||

        data ||

        {};









    const kpis = [


        {

            title:"Total Bookings",

            value:

                analytics.totalBookings || 0


        },



        {

            title:"Revenue",

            value:

                `KES ${Number(

                    analytics.revenue || 0

                ).toLocaleString()}`


        },



        {

            title:"Returning Customers",

            value:

                `${analytics.returningCustomers || 0}%`


        },



        {

            title:"Average Rating",

            value:

                `${analytics.averageRating || 0} ⭐`


        }



    ];









    const bookingGrowth =

        analytics.bookingGrowth || [];








    const destinations =

        analytics.popularDestinations || [];









    return (



        <div className="
            p-6
            space-y-8
            bg-gray-50
            min-h-screen
        ">









            {/* HEADER */}



            <div>


                <h1 className="
                    text-3xl
                    font-bold
                    text-gray-800
                ">


                    Tour Analytics Dashboard


                </h1>





                <p className="
                    text-gray-500
                ">


                    Business intelligence overview for Hussein Mboya Tours


                </p>


            </div>









            {/* KPI CARDS */}



            <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-4
                gap-6
            ">





                {

                    kpis.map((item,index)=>(



                        <div


                        key={index}


                        className="
                            bg-white
                            rounded-xl
                            shadow
                            p-6
                        "



                        >




                            <h3 className="
                                text-gray-500
                                text-sm
                            ">


                                {item.title}


                            </h3>





                            <p className="
                                text-3xl
                                font-bold
                                mt-3
                                text-blue-600
                            ">


                                {item.value}


                            </p>





                        </div>



                    ))

                }





            </div>









            {/* BOOKING GROWTH */}



            <div className="
                bg-white
                rounded-xl
                shadow
                p-6
            ">



                <h2 className="
                    text-xl
                    font-semibold
                    mb-6
                ">


                    Booking Growth


                </h2>






                <div className="space-y-5">





                {


                    bookingGrowth.map((item,index)=>(



                        <div


                        key={index}


                        className="
                            flex
                            items-center
                            gap-4
                        "



                        >





                            <div className="
                                w-12
                                font-medium
                            ">


                                {

                                    item.month ||

                                    item._id?.month

                                }


                            </div>








                            <div className="
                                flex-1
                                bg-gray-200
                                rounded-full
                                h-6
                            ">



                                <div


                                className="
                                    bg-blue-600
                                    h-6
                                    rounded-full
                                "



                                style={{

                                    width:

                                    `${

                                    Math.min(

                                    (

                                    item.value ||

                                    item.count ||

                                    0

                                    ) * 8,

                                    100

                                    )

                                    }%`

                                }}



                                />



                            </div>








                            <div className="
                                font-semibold
                            ">


                                {

                                    item.value ||

                                    item.count ||

                                    0

                                }



                            </div>







                        </div>



                    ))


                }





                </div>





            </div>









            {/* DESTINATIONS */}



            <div className="
                bg-white
                rounded-xl
                shadow
                p-6
            ">




                <h2 className="
                    text-xl
                    font-semibold
                    mb-6
                ">



                    Popular Destinations



                </h2>







                <div className="space-y-6">





                {


                    destinations.map((item,index)=>(



                        <div key={index}>





                            <div className="
                                flex
                                justify-between
                                mb-2
                            ">



                                <span className="
                                    font-medium
                                ">


                                    {index + 1}.


                                    {" "}


                                    {

                                    item.name ||

                                    item._id

                                    }


                                </span>






                                <span className="
                                    font-bold
                                ">


                                    {

                                    item.percentage ||

                                    item.value ||

                                    0

                                    }%



                                </span>





                            </div>









                            <div className="
                                w-full
                                bg-gray-200
                                rounded-full
                                h-4
                            ">




                                <div


                                className="
                                    bg-green-600
                                    h-4
                                    rounded-full
                                "


                                style={{

                                    width:

                                    `${

                                    item.percentage ||

                                    item.value ||

                                    0

                                    }%`

                                }}



                                />



                            </div>







                        </div>



                    ))



                }





                </div>





            </div>








        </div>


    );


}