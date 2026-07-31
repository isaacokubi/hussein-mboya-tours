// client/src/pages/admin/finance/AdminFinance.jsx


import {
    useQuery
} from "@tanstack/react-query";


import {
    getFinanceDashboard
}
from "../../../api/financeApi";







export default function AdminFinance(){



    const {

        data,

        isLoading,

        isError


    } = useQuery({



        queryKey:[

            "financeDashboard"

        ],



        queryFn:getFinanceDashboard



    });







    const finance =

        data?.data ||

        data ||

        {};









    if(isLoading)

    return (

        <div className="p-6">

            Loading finance dashboard...

        </div>

    );








    if(isError)

    return (

        <div className="
            p-6
            text-red-600
        ">

            Failed to load finance data

        </div>

    );









    return (


        <div className="p-6">





            <h1 className="
                text-3xl
                font-bold
                mb-8
            ">


                Finance Dashboard


            </h1>









            <div className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
            ">




                <Card


                    title="Total Revenue"


                    value={

                        `KES ${

                            Number(

                                finance.revenue || 0

                            )

                            .toLocaleString()

                        }`

                    }


                />







                <Card


                    title="Paid Bookings"


                    value={

                        finance.paidBookings || 0

                    }


                />







                <Card


                    title="Commission"


                    value={

                        `KES ${

                            Number(

                                finance.commission || 0

                            )

                            .toLocaleString()

                        }`

                    }


                />





            </div>






        </div>


    );


}









function Card({

    title,

    value

}){


    return (



        <div className="
            bg-white
            shadow
            rounded-xl
            p-6
        ">



            <p className="
                text-gray-500
            ">

                {title}

            </p>





            <h2 className="
                text-3xl
                font-bold
                mt-2
            ">

                {value}

            </h2>





        </div>



    );


}