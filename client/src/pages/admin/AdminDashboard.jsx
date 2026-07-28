import { useQuery } from "@tanstack/react-query";

import axios from "axios";

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminStats"],

    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/dashboard`,

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return response.data.data;
    },
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
          {error?.message}
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
        <Card title="Users" value={data?.customers} />

        <Card title="Tours" value={data?.popularTours?.length} />

        <Card title="Bookings" value={data?.bookings} />

        <Card title="Revenue" value={`$${data?.revenue || 0}`} />
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
