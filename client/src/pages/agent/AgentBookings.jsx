import { useSettings } from "../../context/SettingsContext";
// client/src/pages/agent/AgentBookings.jsx


import useAgentBookings
from "../../hooks/useAgentBookings";






export default function AgentBookings(
){



    const {

        data = [],

        isLoading,

        isError


    } = useAgentBookings();









    if(isLoading)

    return (

        <div className="p-6">

            Loading bookings...

        </div>

    );









    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load bookings

        </div>

    );









    return (


        <div className="p-6">





            <h1 className="
                text-2xl
                font-bold
                mb-6
            ">


                My Bookings


            </h1>









            <div className="
                bg-white
                rounded-xl
                shadow
                overflow-hidden
            ">








                <table className="
                    w-full
                ">



                    <thead className="
                        bg-gray-100
                    ">



                        <tr className="
                            border-b
                        ">



                            <th className="p-4 text-left">

                                Customer

                            </th>




                            <th className="p-4 text-left">

                                Tour

                            </th>




                            <th className="p-4 text-left">

                                Amount

                            </th>




                            <th className="p-4 text-left">

                                Status

                            </th>




                        </tr>



                    </thead>









                    <tbody>




                    {

                        data.length === 0 ? (



                            <tr>


                                <td

                                colSpan="4"

                                className="
                                    p-6
                                    text-center
                                    text-gray-500
                                "

                                >


                                    No bookings found


                                </td>



                            </tr>



                        ) : (



                            (Array.isArray(data) ? data : []).map((booking)=>(



                                <tr


                                key={booking._id}


                                className="
                                    border-b
                                "



                                >







                                    <td className="p-4">



                                        {

                                            booking.customer?.name ||

                                            booking.customerSnapshot?.name ||

                                            "Unknown"

                                        }



                                    </td>









                                    <td className="p-4">



                                        {

                                            booking.tourPackage?.title ||

                                            booking.tour?.title ||

                                            "Tour unavailable"

                                        }



                                    </td>









                                    <td className="p-4">



                                        settings.currency || "KES"{" "}

                                        {

                                            Number(

                                                booking.totalAmount ||

                                                booking.amount ||

                                                0

                                            )

                                            .toLocaleString()

                                        }



                                    </td>









                                    <td className="p-4">



                                        <span className="
                                            px-3
                                            py-1
                                            rounded-full
                                            bg-green-100
                                        ">



                                            {

                                                booking.bookingStatus ||

                                                booking.status ||

                                                "Pending"

                                            }



                                        </span>




                                    </td>







                                </tr>






                            ))



                        )

                    }





                    </tbody>






                </table>







            </div>







        </div>


    );


}