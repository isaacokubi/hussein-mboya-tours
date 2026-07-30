import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../../api/adminApi";

export default function AdminDashboard() {

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({

    queryKey: ["adminDashboard"],

    queryFn: getDashboard,

  });


  if (isLoading) {
    return (
      <div className="p-6">
        Loading dashboard...
      </div>
    );
  }


  if (isError) {
    return (
      <div className="p-6 text-red-600">
        {error?.message || "Failed to load dashboard"}
      </div>
    );
  }


  const stats = data?.data || data;


  const {
    users = 0,
    tours = 0,
    bookings = 0,
    revenue = 0,
    bookingStatus = [],
    popularTours = [],
  } = stats;



  return (

    <div className="p-6 space-y-8">


      {/* HEADER */}

      <div>

        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-gray-500">
          Hussein Mboya Tours Management Panel
        </p>

      </div>



      {/* STAT CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">


        <DashboardCard
          title="Users"
          value={users}
        />


        <DashboardCard
          title="Tours"
          value={tours}
        />


        <DashboardCard
          title="Bookings"
          value={bookings}
        />


        <DashboardCard
          title="Revenue"
          value={`Ksh.${Number(revenue).toLocaleString()}`}
        />


      </div>




      {/* BOOKING STATUS */}

      <section className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Booking Status
        </h2>


        <div className="grid md:grid-cols-3 gap-4">


          {bookingStatus.map((item,index)=>(

            <div
              key={index}
              className="border rounded-lg p-4"
            >

              <h3 className="font-bold capitalize">
                {item._id.bookingStatus}
              </h3>


              <p className="text-gray-600">
                Payment: {item._id.paymentStatus}
              </p>


              <p className="text-2xl font-bold mt-2">
                {item.count}
              </p>


            </div>

          ))}


        </div>


      </section>






      {/* POPULAR TOURS */}

      <section className="bg-white rounded-xl shadow p-6">


        <h2 className="text-xl font-semibold mb-4">
          Popular Tours
        </h2>



        <div className="space-y-3">


        {popularTours.map((tour,index)=>(


          <div
            key={tour._id}
            className="flex justify-between items-center border-b pb-3"
          >


            <div>


              <p className="font-semibold">
                #{index + 1} {tour.title}
              </p>


            </div>



            <div className="font-bold">

              {tour.totalBookings} bookings

            </div>



          </div>


        ))}


        </div>


      </section>



    </div>

  );

}





function DashboardCard({
  title,
  value
}){


return (

<div className="bg-white shadow rounded-xl p-6">

<h3 className="text-gray-500">
{title}
</h3>


<p className="text-3xl font-bold mt-2">
{value}
</p>


</div>

);

}