import { useSettings } from "../../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { getFinanceStats } from "../../../api/financeApi";

export default function AdminFinance(
) {
  const {
    data: finance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-finance"],
    queryFn: getFinanceStats,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        Loading finance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Failed to load finance data.
      </div>
    );
  }

  const stats = finance?.data || finance || {};

  const revenue =
    Number(
      stats.revenue ??
      stats.totalRevenue ??
      0
    );

  const netRevenue =
    Number(
      stats.netRevenue ??
      stats.paidRevenue ??
      0
    );

  const refunded =
    Number(
      stats.refundedAmount ??
      stats.refunded ??
      0
    );

  const paidBookings =
    stats.paidBookings ??
    stats.bookings ??
    0;

  const pendingPayments =
    stats.pendingPayments ??
    0;

  const failedPayments =
    stats.failedPayments ??
    0;

  const cards = [
    {
      title: "Total Revenue",
      value: `settings.currency || "KES" ${revenue.toLocaleString()}`,
    },
    {
      title: "Net Revenue",
      value: `settings.currency || "KES" ${netRevenue.toLocaleString()}`,
    },
    {
      title: "Refunded",
      value: `settings.currency || "KES" ${refunded.toLocaleString()}`,
    },
    {
      title: "Paid Bookings",
      value: paidBookings,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
    },
    {
      title: "Failed Payments",
      value: failedPayments,
    },
  ];

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Finance Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Financial overview and payment activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg bg-white p-6 shadow"
          >
            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <p className="mt-2 text-2xl font-bold">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
