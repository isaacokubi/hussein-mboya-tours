// client/src/pages/agent/AgentCustomers.jsx


import useAgentCustomers
from "../../hooks/useAgentCustomers";







export default function AgentCustomers(){



    const {

        data = [],

        isLoading,

        isError


    } = useAgentCustomers();









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
                text-2xl
                font-bold
                mb-6
            ">


                My Customers


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

                                Name

                            </th>





                            <th className="p-4 text-left">

                                Phone

                            </th>





                            <th className="p-4 text-left">

                                Nationality

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


                                    No customers found


                                </td>



                            </tr>



                        ) : (



                            data.map(customer=>(




                                <tr


                                key={customer._id}


                                className="
                                    border-b
                                "



                                >







                                    <td className="p-4">



                                        {

                                            customer.firstName ||

                                            customer.name ||

                                            ""

                                        }


                                        {" "}


                                        {

                                            customer.lastName ||

                                            ""

                                        }



                                    </td>









                                    <td className="p-4">


                                        {

                                            customer.phone ||

                                            "-"

                                        }



                                    </td>









                                    <td className="p-4">


                                        {

                                            customer.nationality ||

                                            "-"

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

                                                customer.status ||

                                                "Active"

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