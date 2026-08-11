// client/src/pages/tour-manager/TourManagerDashboard.jsx

import { useQuery } from "@tanstack/react-query";
import AssignmentNotifications from "../../components/notifications/AssignmentNotifications";

import { useNavigate } from "react-router-dom";

import { getDashboardStats } from "../../services/tourManagerService";

import {
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaUsers,
  FaMoneyBillWave,
  FaCar,
  FaUserTie,
  FaClipboardList,
  FaChartLine,
  FaBell,
} from "react-icons/fa";

export default function TourManagerDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tour-manager-dashboard"],

    queryFn: getDashboardStats,
  });

  const dashboard = data?.data || data || {};

  const statsData = dashboard.stats || {};

  const upcomingTours = dashboard.upcomingTours || [];

  const recentBookings = dashboard.recentBookings || [];

  const stats = [
    {
      title: "Total Tours",

      value: statsData.totalTours || 0,

      icon: <FaMapMarkedAlt />,

      color: "bg-blue-600",
    },

    {
      title: "Upcoming Tours",

      value: statsData.upcomingTours || 0,

      icon: <FaCalendarCheck />,

      color: "bg-green-600",
    },

    {
      title: "Total Customers",

      value: statsData.totalCustomers || 0,

      icon: <FaUsers />,

      color: "bg-purple-600",
    },

    {
      title: "Revenue",

      value: `KES ${Number(statsData.revenue || 0).toLocaleString()}`,

      icon: <FaMoneyBillWave />,

      color: "bg-yellow-600",
    },
  ];

  if (isError) {
    return <div className="p-6 text-red-600">Failed loading dashboard.</div>;
  }

  return (
    <div
      className="
        min-h-screen
        bg-gray-100
        p-6
      "
    >
      <div
        className="
          flex
          justify-between
          items-center
          mb-8
        "
      >
        <div>
          <h1
            className="
            text-3xl
            font-bold
            text-gray-800
          "
          >
            Coherent Tours
          </h1>

          <p className="text-gray-500">Tour Manager Dashboard</p>
        </div>

        <div
          className="
          flex
          items-center
          gap-3
        "
        >
          <button
            className="
              bg-white
              p-3
              rounded-full
              shadow
            "
          >
            <FaBell className="text-orange-500" />
          </button>

          <div
            className="
            bg-white
            px-4
            py-2
            rounded-lg
            shadow
          "
          >
            Tour Manager
          </div>
        </div>
      </div>

      <div className="mb-6"><AssignmentNotifications /></div>

      <div
        className="
        grid
        md:grid-cols-4
        gap-6
        mb-8
      "
      >
        {stats.map((item, index) => (
          <div
            key={index}
            className="
                bg-white
                rounded-xl
                shadow
                p-5
                flex
                justify-between
                items-center
              "
          >
            <div>
              <p className="text-gray-500">{item.title}</p>

              <h2
                className="
                  text-3xl
                  font-bold
                  mt-2
                "
              >
                {isLoading ? "..." : item.value}
              </h2>
            </div>

            <div
              className={`
                  ${item.color}
                  text-white
                  p-4
                  rounded-full
                  text-xl
                `}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div
        className="
        grid
        lg:grid-cols-3
        gap-6
      "
      >
        <div
          className="
          lg:col-span-2
          bg-white
          rounded-xl
          shadow
          p-6
        "
        >
          <div
            className="
            flex
            justify-between
            mb-5
          "
          >
            <h2
              className="
              text-xl
              font-bold
            "
            >
              Upcoming Tours
            </h2>

            <button
              onClick={() => navigate("/tour-manager/create-tour")}
              className="
                bg-orange-600
                text-white
                px-4
                py-2
                rounded-lg
              "
            >
              Create Tour
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-3">Tour</th>

                  <th>Date</th>

                  <th>Guests</th>

                  <th>Guide</th>

                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {upcomingTours.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="
                        text-center
                        p-5
                        text-gray-500
                      "
                    >
                      No upcoming tours found
                    </td>
                  </tr>
                ) : (
                  upcomingTours.map((tour, index) => (
                    <tr
                      key={tour?._id || index}
                      className="
                        border-b
                        hover:bg-gray-50
                      "
                    >
                      <td
                        className="
                        p-3
                        font-semibold
                      "
                      >
                        {tour?.title || tour?.name}
                      </td>

                      <td>{tour?.date}</td>

                      <td>{tour?.guests || tour?.capacity || 0}</td>

                      <td>{tour.guide?.name || tour.guide || "-"}</td>

                      <td>
                        <span
                          className="
                          bg-green-100
                          text-green-700
                          px-3
                          py-1
                          rounded-full
                          text-sm
                        "
                        >
                          {tour?.status || "upcoming"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="
          bg-white
          rounded-xl
          shadow
          p-6
        "
        >
          <h2
            className="
            text-xl
            font-bold
            mb-5
          "
          >
            Quick Actions
          </h2>

          <div className="space-y-4">
            <ActionButton
              onClick={() => navigate("/tour-manager/tours")}
              color="bg-blue-600"
              icon={<FaClipboardList />}
              text="Manage Tours"
            />

            <ActionButton
              onClick={() => navigate("/tour-manager/guides")}
              color="bg-green-600"
              icon={<FaUserTie />}
              text="Assign Guides"
            />

            <ActionButton
              onClick={() => navigate("/tour-manager/reports")}
              color="bg-purple-600"
              icon={<FaChartLine />}
              text="View Reports"
            />

            <ActionButton
              onClick={() => navigate("/tour-manager/vehicles")}
              color="bg-orange-600"
              icon={<FaCar />}
              text="Manage Vehicles"
            />
          </div>
        </div>
      </div>

      <div
        className="
        mt-8
        bg-white
        rounded-xl
        shadow
        p-6
      "
      >
        <h2
          className="
          text-xl
          font-bold
          mb-5
        "
        >
          Recent Bookings
        </h2>

        <div
          className="
          grid
          md:grid-cols-3
          gap-5
        "
        >
          {recentBookings.length === 0 ? (
            <p className="text-gray-500">No bookings found</p>
          ) : (
            recentBookings.map((booking, index) => (
              <div
                key={booking._id || index}
                className="
                  border
                  rounded-lg
                  p-5
                "
              >
                <h3 className="font-bold">
                  
    {
        booking.customer?.name ||
        booking.customer?.email ||
        "Guest"
    }
    
                </h3>

                <p className="text-gray-500">
                  
    {
        booking.tour?.title ||
        "Tour Package"
    }
    
                </p>

                <p>Guests: {booking.guests || 0}</p>

                <span
                  className="
                  inline-block
                  mt-3
                  bg-green-100
                  text-green-700
                  px-3
                  py-1
                  rounded-full
                "
                >
                  {typeof booking.paymentStatus === "object" ? (booking.paymentStatus.paymentStatus || booking.paymentStatus.status || "pending") : booking.paymentStatus || booking.payment || "pending"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ onClick, color, icon, text }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        flex
        items-center
        gap-3
        ${color}
        text-white
        p-4
        rounded-lg
      `}
    >
      {icon}

      {text}
    </button>
  );
}
