/**
 * Purpose: Bookings page-level UI component. Main declarations: Bookings.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
    useQuery
}
from "@tanstack/react-query";


// Load ../../api/adminApi so this module can use its exported dependencies.
import {
    getAdminBookings
}
from "../../api/adminApi";


// Load ../../components/admin/DataTable so this module can use its exported dependencies.
import DataTable from "../../components/admin/DataTable";




// Define Bookings; its parameters and body implement this operation.
export default function Bookings(){


    // Declare { data, isLoading } for use by the surrounding module or function.
    const {
        data,
        isLoading

    } = useQuery({

        queryKey:[
            "adminBookings"
        ],

        queryFn:getAdminBookings

    });




    // Check the condition (isLoading) and run the matching branch.
    if(isLoading)

        // Return the expression shown below to the caller.
        return (

            <p className="p-6">

                Loading bookings...

            </p>

        );




    // Declare bookings for use by the surrounding module or function.
    const bookings =

        data?.data ||

        data ||

        [];




    // Return the expression shown below to the caller.
    return (

        <div className="p-6">


            <h1
                className="
                    text-3xl
                    font-bold
                    mb-6
                "
            >

                Booking Management

            </h1>




            <DataTable


                data={bookings}


                columns={[


                {

                    label:"Customer",

                    key:"customer",

                    render:(b)=>

                        b.customer?.name ||

                        b.customerSnapshot?.name ||

                        "-"

                },



                {

                    label:"Tour",

                    key:"tour",

                    render:(b)=>

                        b.tour?.title ||

                        "-"

                },



                {

                    label:"Amount",

                    key:"totalAmount",

                    render:(b)=>

                        `Ksh ${
                            Number(
                                b.totalAmount ||
                                b.amount ||
                                0
                            ).toLocaleString()
                        }`

                },



                {

                    label:"Payment",

                    key:"paymentStatus",

                    render:(b)=>{


                        if(
                            typeof b.paymentStatus==="object"
                        ){

                            return (

                                b.paymentStatus?.paymentStatus ||

                                b.paymentStatus?.status ||

                                "Pending"

                            );

                        }


                        return (

                            b.paymentStatus ||

                            "Pending"

                        );

                    }

                },



                {

                    label:"Status",

                    key:"status",

                    render:(b)=>

                        b.status ||

                        b.status ||

                        "Pending"

                }


                ]}


            />


        </div>

    );

}
