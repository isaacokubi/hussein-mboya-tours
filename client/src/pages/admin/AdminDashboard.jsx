import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../api/adminApi";

export default function AdminDashboard() {

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({

    queryKey: ["adminStats"],

    queryFn: getDashboard,

    select: (response) => response.data,

    staleTime: 5 * 60 * 1000,

  });


  if (isLoading) {

    return (
      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        text-xl
        font-semibold
        "
      >
        Loading dashboard...
      </div>
    );

  }


  if (isError) {

    return (
      <div
        className="
        container
        mx-auto
        px-6
        py-20
        "
      >

        <div
          className="
          bg-red-100
          text-red-700
          p-6
          rounded-xl
          "
        >

          Failed to load dashboard

          <br />

          {error?.response?.data?.message ||
            error.message}

        </div>

      </div>
    );

  }



  return (

    <div
      className="
      container
      mx-auto
      px-6
      py-20
      "
    >

      <h1
        className="
        text-4xl
        font-bold
        mb-10
        "
      >
        Admin Dashboard
      </h1>



      <div
        className="
        grid
        md:grid-cols-4
        gap-6
        "
      >


        <Card
          title="Users"
          value={data?.users}
        />


        <Card
          title="Tours"
          value={data?.tours}
        />


        <Card
          title="Bookings"
          value={data?.bookings}
        />


        <Card
          title="Revenue"
          value={`$${data?.revenue || 0}`}
        />


      </div>



      <div
        className="
        mt-10
        grid
        md:grid-cols-2
        gap-6
        "
      >

        <InfoCard
          title="Booking Status"
          data={data?.bookingStatus}
        />


        <InfoCard
          title="Popular Tours"
          data={data?.popularTours}
        />

      </div>


    </div>

  );

}





function Card({
  title,
  value,
}) {


  return (

    <div
      className="
      bg-white
      rounded-xl
      shadow-lg
      p-6
      border
      "
    >

      <h3
        className="
        text-gray-500
        text-lg
        font-medium
        "
      >
        {title}
      </h3>


      <p
        className="
        text-3xl
        font-bold
        mt-3
        text-gray-900
        "
      >
        {value ?? 0}
      </p>


    </div>

  );

}





function InfoCard({
  title,
  data,
}) {


  return (

    <div
      className="
      bg-white
      rounded-xl
      shadow-lg
      p-6
      border
      "
    >

      <h3
        className="
        text-xl
        font-bold
        mb-4
        "
      >
        {title}
      </h3>



      {
        !data ||
        data.length === 0 ?

        (

          <p className="text-gray-500">
            No data available
          </p>

        )

        :

        (

          <pre
            className="
            text-sm
            bg-gray-50
            p-4
            rounded-lg
            overflow-auto
            "
          >
            {JSON.stringify(data, null, 2)}
          </pre>

        )

      }


    </div>

  );

}