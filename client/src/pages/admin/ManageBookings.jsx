import {
    useState
} from "react";


import {
    useQuery,
    useMutation,
    useQueryClient
} from "@tanstack/react-query";


import {
    toast
} from "react-toastify";


import {
    getAdminBookings,
    updateBookingStatus
}
from "../../api/bookingApi";



export default function ManageBookings(){


    const queryClient = useQueryClient();


    const [search,setSearch] = useState("");

    const [status,setStatus] = useState("");



    const {
        data,
        isLoading,
        isError

    } = useQuery({

        queryKey:[
            "admin-bookings",
            search,
            status
        ],

        queryFn:()=>getAdminBookings({
            search,
            status
        })

    });



    const bookings =
        data?.bookings ||
        data?.data?.bookings ||
        [];



    const {
        mutate:updateStatus,
        isPending

    } = useMutation({


        mutationFn:({
            id,
            status
        })=>

            updateBookingStatus(
                id,
                status
            ),


        onSuccess:()=>{

            queryClient.invalidateQueries({

                queryKey:[
                    "admin-bookings"
                ]

            });


            toast.success(
                "Booking status updated"
            );

        },


        onError:()=>{

            toast.error(
                "Failed to update booking"
            );

        }

    });




    const changeStatus=(id,newStatus)=>{

        updateStatus({

            id,

            status:newStatus

        });

    };




    const getPaymentStatus=(paymentStatus)=>{


        if(!paymentStatus){

            return "Pending";

        }



        if(typeof paymentStatus==="string"){

            return paymentStatus;

        }



        if(typeof paymentStatus==="object"){

            return (

                paymentStatus.paymentStatus ||

                paymentStatus.status ||

                "Pending"

            );

        }



        return "Pending";

    };





    return (

        <div className="p-6">


            <h1
                className="
                    text-3xl
                    font-bold
                    mb-8
                "
            >

                Booking Management

            </h1>




            <div
                className="
                    flex
                    gap-4
                    mb-6
                "
            >


                <input

                    className="
                        border
                        p-3
                        rounded
                        w-80
                    "

                    placeholder="
                        Search customer or booking number
                    "

                    value={search}

                    onChange={
                        e=>setSearch(e.target.value)
                    }

                />



                <select

                    className="
                        border
                        p-3
                        rounded
                    "

                    value={status}

                    onChange={
                        e=>setStatus(e.target.value)
                    }

                >

                    <option value="">
                        All Status
                    </option>


                    <option value="pending">
                        Pending
                    </option>


                    <option value="confirmed">
                        Confirmed
                    </option>


                    <option value="completed">
                        Completed
                    </option>


                    <option value="cancelled">
                        Cancelled
                    </option>


                </select>


            </div>





            <div
                className="
                    bg-white
                    shadow
                    rounded-xl
                    overflow-hidden
                "
            >


            {
                isLoading ?

                (

                    <div className="p-6">

                        Loading bookings...

                    </div>

                )

                :

                isError ?

                (

                    <div className="
                        p-6
                        text-red-600
                    ">

                        Failed to load bookings

                    </div>

                )

                :

                (

                <table className="w-full">


                <thead className="bg-gray-100">

                <tr>

                    <th className="p-4 text-left">
                        Booking
                    </th>

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
                        Payment
                    </th>

                    <th className="p-4 text-left">
                        Status
                    </th>

                    <th className="p-4 text-left">
                        Actions
                    </th>


                </tr>


                </thead>





                <tbody>


                {
                    bookings.length===0

                    ?

                    (

                    <tr>

                        <td
                            colSpan="7"
                            className="
                                p-6
                                text-center
                                text-gray-500
                            "
                        >

                            No bookings found

                        </td>

                    </tr>

                    )

                    :

                    bookings.map(
                        booking=>(


                    <tr

                        key={booking._id}

                        className="border-b"

                    >


                        <td className="p-4">

                            {
                                booking.bookingNumber ||
                                booking._id
                            }

                        </td>




                        <td className="p-4">


                            <div className="font-medium">

                            {
                                booking.customer?.name ||

                                booking.customerSnapshot?.name ||

                                "Unknown"
                            }

                            </div>


                            <small>

                            {
                                booking.customer?.phone ||

                                booking.customerSnapshot?.phone ||

                                "-"
                            }

                            </small>


                        </td>




                        <td className="p-4">

                        {
                            booking.tour?.title ||

                            "Tour unavailable"
                        }

                        </td>




                        <td className="p-4">

                            KES{" "}

                            {
                                Number(
                                    booking.amount ||
                                    booking.totalAmount ||
                                    0
                                ).toLocaleString()
                            }

                        </td>




                        <td className="p-4">

                            <span
                                className="
                                    bg-green-100
                                    px-3
                                    py-1
                                    rounded
                                    capitalize
                                "
                            >

                            {
                                getPaymentStatus(
                                    booking.paymentStatus
                                )
                            }

                            </span>


                        </td>




                        <td className="p-4 capitalize">


                        {
                            booking.status ||

                            booking.status ||

                            "Pending"
                        }


                        </td>




                        <td className="p-4 space-x-2">


                            <button

                                disabled={isPending}

                                onClick={()=>changeStatus(
                                    booking._id,
                                    "confirmed"
                                )}

                                className="
                                    bg-green-700
                                    text-white
                                    px-3
                                    py-1
                                    rounded
                                "

                            >

                                Confirm

                            </button>




                            <button

                                disabled={isPending}

                                onClick={()=>changeStatus(
                                    booking._id,
                                    "cancelled"
                                )}

                                className="
                                    bg-red-600
                                    text-white
                                    px-3
                                    py-1
                                    rounded
                                "

                            >

                                Cancel

                            </button>


                        </td>



                    </tr>


                    ))
                }


                </tbody>


                </table>

                )

            }


            </div>


        </div>

    );


}