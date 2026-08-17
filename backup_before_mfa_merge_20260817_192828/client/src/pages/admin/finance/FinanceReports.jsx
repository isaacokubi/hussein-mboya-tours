import { useSettings } from "../../../context/SettingsContext";
// client/src/pages/admin/finance/FinanceReports.jsx


import {
    useQuery
} from "@tanstack/react-query";


import {
    getReports
}
from "../../../api/financeApi";







export default function FinanceReports(
){



    const {

        data,

        isLoading,

        isError


    } = useQuery({



        queryKey:[

            "financeReports"

        ],



        queryFn:getReports



    });








    const reports =

        data?.monthlyRevenue ||

        data?.data?.monthlyRevenue ||

        [];









    if(isLoading)

    return (

        <div className="p-6">

            Loading reports...

        </div>

    );









    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load financial reports

        </div>

    );









    return (



        <div className="p-6">





            <h1

            className="
                text-3xl
                font-bold
                mb-8
            "

            >

                Financial Reports

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



                        <tr>



                            <th className="p-4 text-left">

                                Month

                            </th>





                            <th className="p-4 text-left">

                                Revenue

                            </th>





                        </tr>



                    </thead>









                    <tbody>





                    {

                        reports.length === 0 ? (


                            <tr>


                                <td

                                colSpan="2"

                                className="
                                    p-6
                                    text-center
                                    text-gray-500
                                "

                                >

                                    No financial reports available

                                </td>


                            </tr>



                        ) : (



                            reports.map((report,index)=>(



                                <tr

                                key={index}

                                className="
                                    border-b
                                "

                                >






                                    <td className="p-4">


                                        {

                                            report?._id?.month ||

                                            "-"

                                        }


                                        /

                                        {

                                            report?._id?.year ||

                                            "-"

                                        }



                                    </td>








                                    <td className="p-4 font-medium">


                                        KES{" "}

                                        {

                                            Number(

                                                report.revenue || 0

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