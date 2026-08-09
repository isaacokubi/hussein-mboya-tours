import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";



export default function RevenueChart({
    revenue = []
}){


    const data = Array.isArray(revenue)
        ? revenue
        : [];



    return (

        <section className="
            bg-white
            rounded-xl
            shadow
            p-6
        ">


            <h2 className="
                text-xl
                font-bold
                mb-5
            ">

                Revenue Analytics

            </h2>



            {
                data.length === 0 ?

                (

                    <p className="
                        text-gray-500
                    ">

                        No revenue data available

                    </p>

                )

                :

                (

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <LineChart
                            data={data}
                        >

                            <CartesianGrid />

                            <XAxis
                                dataKey="month"
                            />

                            <YAxis />

                            <Tooltip />


                            <Line

                                type="monotone"

                                dataKey="amount"

                                strokeWidth={3}

                            />


                        </LineChart>


                    </ResponsiveContainer>


                )
            }



        </section>


    );


}