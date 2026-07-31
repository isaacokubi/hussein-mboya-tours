import {
    useQuery
} from "@tanstack/react-query";


import {

    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie

} from "recharts";


import {
    getAnalytics
}
from "../../api/analyticsApi";





export default function AdminAnalytics(){



    const {
        data,
        isLoading,
        isError

    } = useQuery({

        queryKey:[
            "analytics"
        ],

        queryFn:getAnalytics

    });






    const analytics =
        data?.analytics || data || {};







    if(isLoading)

    return (

        <div className="p-10">

            Loading analytics...

        </div>

    );







    if(isError)

    return (

        <div className="p-10 text-red-600">

            Failed to load analytics

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

                Business Analytics

            </h1>







            <div

            className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-4
                gap-5
                mb-10
            "

            >



                <Card

                    title="Revenue"

                    value={`KES ${analytics.revenue || 0}`}

                />



                <Card

                    title="Customers"

                    value={analytics.customers || 0}

                />



                <Card

                    title="Bookings"

                    value={analytics.bookings || 0}

                />



                <Card

                    title="Vehicles"

                    value={
                        analytics.vehicleStats?.reduce(
                            (total,item)=>
                            total + item.count,
                            0
                        ) || 0
                    }

                />




            </div>









            <h2

            className="
                text-xl
                font-bold
                mb-5
            "

            >

                Monthly Revenue

            </h2>






            <div

            className="
                bg-white
                p-5
                rounded-xl
                shadow
            "

            >



                <ResponsiveContainer

                width="100%"

                height={300}

                >


                    <BarChart

                    data={
                        analytics.monthlyRevenue || []
                    }

                    >


                        <XAxis

                        dataKey="_id.month"

                        />


                        <YAxis/>


                        <Tooltip/>


                        <Bar

                        dataKey="revenue"

                        />



                    </BarChart>



                </ResponsiveContainer>



            </div>









            <h2

            className="
                text-xl
                font-bold
                mt-10
                mb-5
            "

            >

                Booking Status

            </h2>







            <div

            className="
                bg-white
                p-5
                rounded-xl
                shadow
            "

            >



                <ResponsiveContainer

                width="100%"

                height={300}

                >


                    <PieChart>


                        <Pie

                        data={
                            analytics.bookingStatus || []
                        }

                        dataKey="count"

                        nameKey="_id"

                        />



                    </PieChart>



                </ResponsiveContainer>



            </div>





        </div>


    );


}









function Card({

    title,

    value

}){


    return (


        <div

        className="
            bg-white
            shadow
            rounded-xl
            p-5
        "

        >



            <p

            className="
                text-gray-500
            "

            >

                {title}

            </p>





            <h2

            className="
                text-3xl
                font-bold
            "

            >

                {value}

            </h2>





        </div>


    );


}