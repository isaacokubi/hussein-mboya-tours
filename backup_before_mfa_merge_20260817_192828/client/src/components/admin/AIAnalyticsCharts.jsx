import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";


export default function AIAnalyticsCharts({
  analytics={}
}){


  const revenue =
    analytics.monthlyRevenue || [];


  const bookings =
    analytics.recentBookings || [];



  return (

    <div className="grid md:grid-cols-2 gap-6">


      <div className="bg-white rounded-xl shadow p-5">

        <h3 className="font-bold mb-4">
          Revenue Trend
        </h3>


        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={revenue}>

            <CartesianGrid />

            <XAxis dataKey="_id.month"/>

            <YAxis/>

            <Tooltip/>

            <Line
              type="monotone"
              dataKey="revenue"
            />

          </LineChart>

        </ResponsiveContainer>


      </div>



      <div className="bg-white rounded-xl shadow p-5">

        <h3 className="font-bold mb-4">
          Booking Activity
        </h3>


        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={bookings}>

            <CartesianGrid />

            <XAxis dataKey="_id.day"/>

            <YAxis/>

            <Tooltip/>

            <Bar
              dataKey="bookings"
            />

          </BarChart>

        </ResponsiveContainer>


      </div>


    </div>

  );

}
