// client/src/pages/admin/finance/MpesaTransactions.jsx


import {
    useState
} from "react";


import {
    useQuery
} from "@tanstack/react-query";


import {
    getMpesaTransactions
}
from "../../../api/financeApi";








export default function MpesaTransactions(){



    const [

        search,

        setSearch

    ] = useState("");





    const [

        status,

        setStatus

    ] = useState("");









    const {

        data,

        isLoading,

        isError

    } = useQuery({



        queryKey:[

            "mpesaTransactions",

            search,

            status

        ],




        queryFn:()=>getMpesaTransactions({

            search,

            status

        })



    });









    const payments =

        data?.payments ||

        data?.data?.payments ||

        [];

    const transactions = payments;









    if(isLoading)

    return (

        <div className="p-6">

            Loading transactions...

        </div>

    );









    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load transactions

        </div>

    );









    return (



        <div className="p-6">






            <h1 className="
                text-3xl
                font-bold
                mb-8
            ">


                M-Pesa Transactions


            </h1>

<div className="
grid
grid-cols-1
md:grid-cols-4
gap-4
mb-8
">

<div className="border rounded p-4">
<h3 className="font-bold">
Completed Transactions
</h3>
<p>
{
transactions.filter(
t=>t.status==="completed"
).length
}
</p>
</div>


<div className="border rounded p-4">
<h3 className="font-bold">
M-Pesa Revenue
</h3>
<p>
KES {
transactions
.filter(t=>t.status==="completed")
.reduce(
(sum,t)=>sum+(t.amount||0),
0
)
.toLocaleString()
}
</p>
</div>


<div className="border rounded p-4">
<h3 className="font-bold">
Refunded
</h3>
<p>
{
transactions.filter(
t=>t.status==="refunded"
).length
}
</p>
</div>


<div className="border rounded p-4">
<h3 className="font-bold">
Failed
</h3>
<p>
{
transactions.filter(
t=>t.status==="failed"
).length
}
</p>
</div>

</div>











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


                    placeholder="
                        Search receipt or customer
                    "



                    value={search}



                    onChange={

                        e=>

                        setSearch(

                            e.target.value

                        )

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

                        e=>

                        setStatus(

                            e.target.value

                        )

                    }



                >



                    <option value="">

                        All Payments

                    </option>




                    <option value="completed">

                        Completed

                    </option>




                    <option value="pending">

                        Pending

                    </option>




                    <option value="failed">

                        Failed

                    </option>




                </select>







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

                                Receipt

                            </th>




                            <th className="p-4 text-left">

                                Customer

                            </th>




                            <th className="p-4 text-left">

                                Booking

                            </th>




                            <th className="p-4 text-left">

                                Amount

                            </th>




                            <th className="p-4 text-left">

                                Method

                            </th>




                            <th className="p-4 text-left">

                                Status

                            </th>




                            <th className="p-4 text-left">

                                Date

                            </th>




                        </tr>




                    </thead>









                    <tbody>






                    {

                        payments.length === 0 ? (


                            <tr>


                                <td

                                colSpan="7"

                                className="
                                    p-6
                                    text-center
                                    text-gray-500
                                "

                                >


                                    No transactions found


                                </td>



                            </tr>



                        ) : (



                            payments.map(payment=>(




                                <tr


                                key={payment._id}


                                className="
                                    border-b
                                "



                                >







                                    <td className="p-4">


                                        {

                                            payment.transactionId ||

                                            "N/A"

                                        }


                                    </td>









                                    <td className="p-4">



                                        <div>


                                            {

                                                payment.customer?.name ||

                                                "Unknown"

                                            }



                                        </div>




                                        <small>


                                            {

                                                payment.customer?.phone ||

                                                "-"

                                            }



                                        </small>



                                    </td>









                                    <td className="p-4">


                                        {

                                            payment.booking?.bookingNumber ||

                                            "N/A"

                                        }


                                    </td>









                                    <td className="p-4">


                                        KES{" "}

                                        {

                                            Number(

                                                payment.amount || 0

                                            )

                                            .toLocaleString()

                                        }



                                    </td>









                                    <td className="p-4">


                                        {

                                            payment.paymentMethod ||

                                            "M-Pesa"

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

                                                payment.status ||

                                                "Pending"

                                            }



                                        </span>




                                    </td>









                                    <td className="p-4">


                                        {

                                            payment.createdAt

                                            ?

                                            new Date(

                                                payment.createdAt

                                            )

                                            .toLocaleDateString()

                                            :

                                            "-"

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