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






    const payload = data?.data || data || {};

    const revenue = payload.revenue || {
        totalRevenue: 0,
        totalPayments: 0,
    };

    const bookingsSeries = Array.isArray(payload.bookings)
        ? payload.bookings
        : [];

    const bookingStatus = Array.isArray(payload.bookingStatus)
        ? payload.bookingStatus
        : [];

    const monthlyRevenue = Array.isArray(payload.monthlyRevenue)
        ? payload.monthlyRevenue
        : [];

    const vehicleStats = Array.isArray(payload.vehicleStats)
        ? payload.vehicleStats
        : [];

    const popularTours = Array.isArray(payload.popularTours)
        ? payload.popularTours
        : [];

    const customerCount = Number(payload.customers || 0);

    const bookingCount = bookingsSeries.reduce(
        (sum, item) => sum + Number(item.bookings || 0),
        0
    );







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

                    value={`KES ${Number(revenue.totalRevenue || 0).toLocaleString()}`}

                />



                <Card

                    title="Customers"

                    value={customerCount}

                />



                <Card

                    title="Bookings"

                    value={bookingCount}

                />



                <Card

                    title="Vehicles"

                    value={
                        vehicleStats.reduce(
                            (total, item) =>
                                total + Number(item.count || 0),
                            0
                        )
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
                        monthlyRevenue
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
                            bookingStatus
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