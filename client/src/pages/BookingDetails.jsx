import {
    useParams
} from "react-router-dom";


import {
    useQuery
} from "@tanstack/react-query";


import {
    getBooking
} from "../api/bookingApi";





export default function BookingDetails(){


    const {
        id
    } = useParams();





    const {
        data: booking,
        isLoading,
        isError
    } = useQuery({

        queryKey:[
            "booking",
            id
        ],


        queryFn:()=>getBooking(id),


    });







    if(isLoading){

        return (

            <div className="p-10">

                Loading booking details...

            </div>

        );

    }







    if(isError || !booking){

        return (

            <div className="
            p-10
            text-red-600
            ">

                Unable to load booking details.

            </div>

        );

    }







    return (

        <div
        className="
        min-h-screen
        bg-gray-100
        p-6
        md:p-10
        "
        >



            <h1
            className="
            text-4xl
            font-bold
            text-gray-800
            mb-8
            "
            >

                Booking Details

            </h1>






            <div
            className="
            bg-white
            shadow
            rounded-xl
            p-6
            space-y-4
            "
            >



                <h2
                className="
                text-2xl
                font-bold
                "
                >

                    {
                        booking.tour?.title ||
                        "Tour Information"
                    }

                </h2>







                <div
                className="
                grid
                md:grid-cols-2
                gap-4
                text-gray-700
                "
                >



                    <p>

                        Booking Number:

                        <strong className="ml-2">

                            {
                                booking.bookingNumber ||
                                "N/A"
                            }

                        </strong>

                    </p>





                    <p>

                        Travel Date:

                        <strong className="ml-2">

                            {
                                booking.travelDate
                                ?
                                new Date(
                                    booking.travelDate
                                )
                                .toLocaleDateString()
                                :
                                "N/A"
                            }

                        </strong>

                    </p>







                    <p>

                        Amount Paid:

                        <strong className="ml-2">

                            KES {
                                booking.totalAmount
                                ?.toLocaleString()
                                ||
                                0
                            }

                        </strong>

                    </p>







                    <p>

                        Status:

                        <span
                        className="
                        ml-2
                        px-3
                        py-1
                        rounded-full
                        bg-green-100
                        text-green-700
                        "
                        >

                            {
                                booking.bookingStatus ||
                                "Pending"
                            }

                        </span>

                    </p>





                </div>







                {
                    booking.customer &&

                    <div
                    className="
                    mt-6
                    border-t
                    pt-5
                    "
                    >

                        <h3
                        className="
                        font-bold
                        text-lg
                        mb-3
                        "
                        >

                            Customer Information

                        </h3>


                        <p>

                            Name:

                            {
                                booking.customer.name ||
                                "N/A"
                            }

                        </p>


                        <p>

                            Phone:

                            {
                                booking.customer.phone ||
                                "N/A"
                            }

                        </p>


                    </div>

                }







            </div>




        </div>

    );

}