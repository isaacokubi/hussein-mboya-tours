import { useQuery } from "@tanstack/react-query";

import {

  Users,
  Map,
  CalendarCheck,
  Wallet,
  TrendingUp,
  CreditCard,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { getDashboard } from "../../api/adminApi";
import { getPaymentStats } from "../../api/admin/adminPaymentApi";
import { getAdminRoles } from "../../api/admin/adminRoleApi";
import { getSystemHealth } from "../../api/admin/systemHealthApi";

export default function AdminDashboard() {

  useQuery({
    queryKey: ["adminPaymentStats"],
    queryFn: getPaymentStats,
    staleTime: 300000,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["adminRoles"],
    queryFn: getAdminRoles,
    staleTime: 300000,
  });

  const { data: healthData } = useQuery({
    queryKey: ["systemHealth"],
    queryFn: getSystemHealth,
    staleTime: 300000,
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminDashboard"],

    queryFn: getDashboard,

    staleTime: 300000,
  });



  if (isLoading) {
    return (
      <div
        className="
        p-8
        text-center
      "
      >
        Loading admin dashboard...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="
        p-8
        text-red-600
      "
      >
        {error?.message || "Unable to load dashboard"}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESPONSE
  |--------------------------------------------------------------------------
  */


  const stats = data?.data || data || {};



const statusDataList =
  stats.status || [];

const monthlyRevenueData =
  (stats.monthlyRevenue || []).map(item => ({
    month:
      item.month ||
      `${item._id?.month}/${item._id?.year}`,
    amount:
      item.amount ||
      item.total ||
      0
  }));

const paymentStats =
    stats.paymentStats ||
    {
      completed: 0,
      pending: 0,
      failed: 0
    };
const systemHealth =
  healthData?.system ||
  {};

  const {
    users = 0,

    tours = 0,

    bookings = 0,

    destinations = 0,

    revenue = 0,

    popularTours = [],

    recentBookings = [],

    agents = [],

    guides = [],

    notifications = [],
  } = stats;

  return (
    <div
      className="
min-h-screen
bg-gradient-to-br
from-slate-100
via-gray-50
to-blue-50
p-6
space-y-8
"
    >
      <div>
        <h1
          className="
            text-4xl
font-extrabold
tracking-tight
bg-gradient-to-r
from-blue-700
to-purple-600
bg-clip-text
text-transparent
          "
        >
          Coherent Tours Control Center
        </h1>

        <p
          className="
          text-gray-500
          mt-2
        "
        >
          Complete business management overview
        </p>


      <div
        className="
        grid
        md:grid-cols-3
        gap-5
        "
      >

        <div
          className="
          bg-gradient-to-r
          from-blue-600
          to-indigo-700
          text-white
          rounded-2xl
          p-6
          shadow-xl
          "
        >
          <h3 className="text-lg font-semibold">
            Business Overview
          </h3>

          <p className="mt-2 opacity-90">
            Manage tours, customers, payments and operations from one place.
          </p>
        </div>


        <div
          className="
          bg-gradient-to-r
          from-purple-600
          to-pink-600
          text-white
          rounded-2xl
          p-6
          shadow-xl
          "
        >
          <h3 className="text-lg font-semibold">
            Operations
          </h3>

          <p className="mt-2 opacity-90">
            Monitor bookings and tour performance.
          </p>
        </div>


        <div
          className="
          bg-gradient-to-r
          from-green-600
          to-emerald-600
          text-white
          rounded-2xl
          p-6
          shadow-xl
          "
        >
          <h3 className="text-lg font-semibold">
            Financial Health
          </h3>

          <p className="mt-2 opacity-90">
            Track revenue and payment status.
          </p>
        </div>

      </div>
      </div>{" "}
      {/* STATISTICS CARDS */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
xl:grid-cols-6
          gap-5
        "
      >
        <StatCard title="Users" value={users} icon={<Users />} />

        <StatCard title="Tours" value={tours} icon={<Map />} />

        <StatCard
          title="Destinations"
          value={destinations}
          icon={<TrendingUp />}
        />

        <StatCard title="Bookings" value={bookings} icon={<CalendarCheck />} />

        <StatCard
          title="Revenue"
          value={`Ksh ${Number(revenue).toLocaleString()}`}
          icon={<Wallet />}
        />

        <StatCard
          title="Paid Payments"
          value={paymentStats.completed || 0}
          icon={<CreditCard />}
        />

        <StatCard
          title="System Status"
          value={systemHealth.status || "Healthy"}
          icon={<TrendingUp />}
        />
      </div>
      {/* REVENUE ANALYTICS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Revenue Analytics
        </h2>

        {monthlyRevenueData.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No revenue data available
          </p>
        ) : (
          <div
            className="
                h-[350px]
              "
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line type="monotone" dataKey="amount" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>{" "}
      {/* PAYMENT OVERVIEW */}
      <section
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
            font-semibold
            mb-4
          "
        >
          Payment Overview
        </h2>

        <div
          className="
            grid
            md:grid-cols-3
            gap-4
          "
        >
          <PaymentBox title="Completed" value={paymentStats.completed} />

          <PaymentBox title="Pending" value={paymentStats.pending} />

          <PaymentBox title="Failed" value={paymentStats.failed} />
        </div>
      </section>
      {/* BOOKING STATUS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Booking Status
        </h2>

        <div
          className="
            grid
            md:grid-cols-3
            gap-4
          "
        >
          {(Array.isArray(statusDataList) ? statusDataList : []).map((item, index) => (
            <div
              key={index}
              className="
                    border
                    rounded-lg
                    p-4
                  "
            >
              <h3
                className="
                      font-bold
                      capitalize
                    "
              >
                  {
                    typeof item?._id === "string"
                      ? item._id
                      : item?._id?.status || "Unknown"
                  }
              </h3>

              <p>{item.count || 0} bookings</p>
            </div>
          ))}
        </div>
      </section>
      {/* POPULAR TOURS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Most Popular Tours
        </h2>

        {popularTours.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No tour analytics available
          </p>
        ) : (
          <div
            className="
                space-y-4
              "
          >
            {(Array.isArray(popularTours) ? popularTours : []).map((tour, index) => (
              <div
                key={tour._id || index}
                className="
                        flex
                        justify-between
                        items-center
                        border-b
                        pb-3
                      "
              >
                <div>
                  <p
                    className="
                            font-semibold
                          "
                  >
                    #{index + 1} {tour.title || tour.name || "Tour"}
                  </p>

                  <p
                    className="
                            text-sm
                            text-gray-500
                          "
                  >
                    Revenue: Ksh {Number(tour.revenue || 0).toLocaleString()}
                  </p>
                </div>

                <div
                  className="
                          font-bold
                        "
                >
                  {tour.totalBookings || 0} bookings
                </div>
              </div>
            ))}
          </div>
        )}
      </section>{" "}
      {/* RECENT BOOKINGS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Recent Bookings
        </h2>

        {recentBookings.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No recent bookings
          </p>
        ) : (
          <div
            className="
                overflow-x-auto
              "
          >
            <table
              className="
w-full
text-left
overflow-hidden
rounded-xl
"
            >
              <thead>
                <tr
                  className="
                      border-b
                    "
                >
                  <th className="p-3">Customer</th>

                  <th className="p-3">Tour</th>

                  <th className="p-3">Amount</th>

                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {(Array.isArray(recentBookings) ? recentBookings : []).map((booking, index) => (
                  <tr
                    key={booking._id || index}
                    className="
                          border-b
                        "
                  >
                    <td className="p-3">
                      {booking.customer?.name || booking.fullName || "Guest"}
                    </td>

                    <td className="p-3">{booking.tour?.title || "Tour"}</td>

                    <td className="p-3">
                      Ksh{" "}
                      {Number(
                        booking.amount || booking.totalAmount || 0,
                      ).toLocaleString()}
                    </td>

                    <td className="p-3">
                      <span
                        className="
                              px-3
                              py-1
                              rounded-full
                              text-sm
                              bg-gray-100
                            "
                      >
                        {booking.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {/* AGENT PERFORMANCE */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Agent Performance
        </h2>

        {agents.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No agents found
          </p>
        ) : (
          <div
            className="
                grid
                md:grid-cols-3
                gap-5
              "
          >
            {(Array.isArray(agents) ? agents : []).map((agent, index) => (
              <div
                key={agent._id || index}
                className="
                        border
                        rounded-xl
                        p-5
                      "
              >
                <h3
                  className="
                          font-bold
                        "
                >
                  {agent.name || "Agent"}
                </h3>

                <p
                  className="
                          text-gray-500
                        "
                >
                  Bookings: {agent.bookings || 0}
                </p>

                <p
                  className="
                          mt-2
                          font-semibold
                        "
                >
                  Commission: Ksh{" "}
                  {Number(agent.commission || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* TOUR GUIDES */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Tour Guides
        </h2>

        {guides.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No guides assigned
          </p>
        ) : (
          <div
            className="
                grid
                md:grid-cols-4
                gap-4
              "
          >
            {(Array.isArray(guides) ? guides : []).map((guide, index) => (
              <div
                key={guide._id || index}
                className="
                        border
                        rounded-xl
                        p-4
                      "
              >
                <h3
                  className="
                          font-bold
                        "
                >
                  {guide.name || "Guide"}
                </h3>

                <p
                  className="
                          text-sm
                          text-gray-500
                        "
                >
                  Assigned Tours: {guide.assignedTours || 0}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>{" "}
      {/* QUICK ADMIN ACTIONS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          Quick Actions
        </h2>

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            lg:grid-cols-3
xl:grid-cols-6
            gap-4
          "
        >
          <ActionButton title="Create Tour" link="/tour-manager/create-tour" />

          <ActionButton title="Destinations" link="/admin/destinations" />

          <ActionButton title="Bookings" link="/admin/bookings" />

          <ActionButton title="Customers" link="/admin/customers" />

          <ActionButton title="Payments" link="/admin/payments" />

          <ActionButton title="Reports" link="/admin/reports" />
        </div>
      </section>
      {/* NOTIFICATIONS */}
      <section
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
            font-semibold
            mb-5
          "
        >
          System Notifications
        </h2>

        {notifications.length === 0 ? (
          <p
            className="
              text-gray-500
            "
          >
            No new notifications
          </p>
        ) : (
          <div
            className="
                space-y-3
              "
          >
            {(Array.isArray(notifications) ? notifications : []).map((notification, index) => (
              <div
                key={notification._id || index}
                className="
                        border
                        rounded-lg
                        p-4
                      "
              >
                <h3
                  className="
                          font-semibold
                        "
                >
                  {notification.title || "Notification"}
                </h3>

                <p
                  className="
                          text-gray-600
                        "
                >
                  {notification.message || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* FOOTER SUMMARY */}
      <section
        className="
          bg-gradient-to-r
          from-blue-600
          to-purple-600
          rounded-xl
          p-6
          text-white
        "
      >
        <div
          className="
            grid
            md:grid-cols-4
            gap-5
          "
        >
          <SummaryBox title="Total Customers" value={users} />

          <SummaryBox title="Available Tours" value={tours} />

          <SummaryBox title="Active Bookings" value={bookings} />

          <SummaryBox
            title="Business Revenue"
            value={`Ksh ${Number(revenue).toLocaleString()}`}
          />
        </div>
      </section>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({ title, value, icon }) {
  return (
    <div
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
        <p
          className="
          text-gray-500
          text-sm
        "
        >
          {title}
        </p>

        <h2
          className="
          text-2xl
          font-bold
          mt-2
        "
        >
          {value}
        </h2>
      </div>

      <div
        className="
          text-blue-600
        "
      >
        {icon}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PAYMENT BOX
|--------------------------------------------------------------------------
*/

function PaymentBox({ title, value }) {
  return (
    <div
      className="
        border
        rounded-lg
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

      <h3
        className="
        text-3xl
        font-bold
        mt-2
      "
      >
        {value}
      </h3>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ACTION BUTTON
|--------------------------------------------------------------------------
*/

function ActionButton({ title, link }) {
  return (
    <a
      href={link}
      className="
        border
        rounded-xl
        p-4
        text-center
        hover:bg-gray-100
        transition
        font-semibold
      "
    >
      {title}
    </a>
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY BOX
|--------------------------------------------------------------------------
*/

function SummaryBox({ title, value }) {
  return (
    <div>
      <p
        className="
        opacity-80
        text-sm
      "
      >
        {title}
      </p>

      <h2
        className="
        text-2xl
        font-bold
        mt-2
      "
      >
        {value}
      </h2>
    </div>
  );
}
