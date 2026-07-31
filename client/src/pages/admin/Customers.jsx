import {
    useState
} from "react";


import {
    useQuery
} from "@tanstack/react-query";


import {
    getCustomers
}
from "../../api/customerApi";




export default function Customers(){



    const [search,setSearch] = useState("");






    const {
        data,
        isLoading,
        isError

    } = useQuery({


        queryKey:[
            "customers",
            search
        ],


        queryFn:()=>getCustomers({

            search

        }),


    });







    const customers =

        data?.data?.customers ||

        data?.customers ||

        [];









    if(isLoading)

    return (

        <div className="p-6">

            Loading customers...

        </div>

    );







    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load customers

        </div>

    );







    return (


        <div className="p-6">





            <h1 className="
                text-3xl
                font-bold
                mb-8
            ">

                Customer Management

            </h1>









            <div className="
                flex
                gap-4
                mb-6
            ">



                <input

                    className="
                        border
                        p-3
                        rounded
                        w-80
                    "

                    placeholder="Search customers"

                    value={search}

                    onChange={
                        e=>setSearch(
                            e.target.value
                        )
                    }

                />





            </div>









            <div className="
                bg-white
                shadow
                rounded-xl
                overflow-hidden
            ">



                <table className="
                    w-full
                ">



                    <thead className="
                        bg-gray-100
                    ">


                        <tr>


                            <th className="p-4 text-left">

                                Customer

                            </th>



                            <th className="p-4 text-left">

                                Phone

                            </th>



                            <th className="p-4 text-left">

                                Type

                            </th>



                            <th className="p-4 text-left">

                                Bookings

                            </th>



                            <th className="p-4 text-left">

                                Spent

                            </th>



                        </tr>



                    </thead>








                    <tbody>



                    {
                        customers.length === 0 ? (


                            <tr>

                                <td

                                colSpan="5"

                                className="
                                    p-6
                                    text-center
                                    text-gray-500
                                "

                                >

                                    No customers found

                                </td>


                            </tr>



                        ) : (


                            customers.map(customer=>(


                                <tr

                                key={customer._id}

                                className="
                                    border-b
                                "

                                >




                                    <td className="p-4">


                                        <div className="
                                            font-medium
                                        ">

                                            {customer.name}

                                        </div>



                                        <small className="
                                            text-gray-500
                                        ">

                                            {customer.email}

                                        </small>



                                    </td>







                                    <td className="p-4">

                                        {
                                            customer.phone || "-"
                                        }

                                    </td>







                                    <td className="p-4">


                                        <span className="
                                            bg-blue-100
                                            px-3
                                            py-1
                                            rounded
                                            text-sm
                                        ">


                                            {
                                                customer.customerType ||
                                                "Regular"
                                            }


                                        </span>



                                    </td>







                                    <td className="p-4">


                                        {
                                            customer.totalBookings || 0
                                        }


                                    </td>







                                    <td className="p-4">


                                        KES{" "}

                                        {
                                            Number(
                                                customer.totalSpent || 0
                                            )
                                            .toLocaleString()
                                        }


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