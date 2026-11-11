/**
 * Purpose: Revenue Chart reusable UI component. Main declarations: RevenueChart.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";



// Define RevenueChart; its parameters and body implement this operation.
export default function RevenueChart({
    revenue = []
}){


    // Declare data for use by the surrounding module or function.
    const data = Array.isArray(revenue)
        ? revenue
        : [];



    // Return the expression shown below to the caller.
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
