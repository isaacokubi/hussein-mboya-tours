import { useQuery } from "@tanstack/react-query";

import {
  getAdminPayments,
  getPaymentStats,
} from "../../../api/admin/adminPaymentApi";


export default function AdminPayments(){

  const {
    data: payments,
    isLoading,
    error
  } = useQuery({

    queryKey:["adminPayments"],

    queryFn:getAdminPayments

  });


  const {
    data: stats
  } = useQuery({

    queryKey:["paymentStats"],

    queryFn:getPaymentStats

  });


  console.log("PAYMENTS RESPONSE:", payments);
  console.log("STATS RESPONSE:", stats);
  console.log("PAYMENTS ERROR:", error);



  if(isLoading){

    return (
      <div className="p-6">
        Loading payments...
      </div>
    );

  }



  if(error){

    return (
      <div className="p-6 text-red-600">
        Failed to load payments.
      </div>
    );

  }



  return (

    <div className="p-6 space-y-6">


      <h1 className="text-3xl font-bold">
        Payment Management
      </h1>



      <div className="grid md:grid-cols-3 gap-5">


        {["completed","pending","failed"].map(status=>(

          <div
            key={status}
            className="bg-white shadow rounded-xl p-5"
          >

            <h3 className="capitalize">
              {status}
            </h3>


            <p className="text-3xl font-bold">

              {
                stats?.stats?.find(
                  s=>s._id===status
                )?.count || 0
              }

            </p>


          </div>

        ))}


      </div>



      <div className="bg-white shadow rounded-xl p-5 overflow-x-auto">


        <table className="w-full">


          <thead>

            <tr className="border-b">

              <th className="p-3 text-left">
                Customer
              </th>

              <th className="p-3 text-left">
                Method
              </th>

              <th className="p-3 text-left">
                Amount
              </th>

              <th className="p-3 text-left">
                Phone
              </th>

              <th className="p-3 text-left">
                Status
              </th>

            </tr>

          </thead>



          <tbody>


          {
            payments?.payments?.length ?

            payments.payments.map(payment=>(

              <tr
                key={payment._id}
                className="border-b"
              >

                <td className="p-3">
                  {payment.customer?.name || "Guest"}
                </td>


                <td className="p-3">
                  {
                    payment.paymentMethod ||
                    payment.method ||
                    "-"
                  }
                </td>


                <td className="p-3 font-bold">
                  KES {payment.amount}
                </td>


                <td className="p-3">
                  {payment.phoneNumber || "-"}
                </td>


                <td className="p-3">
                  {payment.status}
                </td>


              </tr>

            ))

            :

            <tr>

              <td
                colSpan="5"
                className="p-6 text-center"
              >

                No payments found

              </td>

            </tr>

          }


          </tbody>


        </table>


      </div>


    </div>

  );


}
