import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getFinanceStats } from "../../../api/financeApi";

export default function AdminFinance() {
  const {
    data: finance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-finance"],
    queryFn: getFinanceStats,
  });

  if (isLoading) {
    return <div className="p-6">Loading finance data...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Failed to load finance data. Please refresh and try again.
        </div>
      </div>
    );
  }

  const stats = finance?.data || finance || {};

  const revenue = Number(stats.revenue ?? stats.totalRevenue ?? 0);
  const netRevenue = Number(stats.netRevenue ?? stats.paidRevenue ?? 0);
  const refunded = Number(stats.refundedAmount ?? stats.refunded ?? 0);
  const paidBookings = stats.paidBookings ?? stats.bookings ?? 0;
  const pendingPayments = stats.pendingPayments ?? 0;
  const failedPayments = stats.failedPayments ?? 0;

  const cards = [
    { title: "Total Revenue", value: `KES ${revenue.toLocaleString()}` },
    { title: "Net Revenue", value: `KES ${netRevenue.toLocaleString()}` },
    { title: "Refunded", value: `KES ${refunded.toLocaleString()}` },
    { title: "Paid Bookings", value: paidBookings },
    { title: "Pending Payments", value: pendingPayments },
    { title: "Failed Payments", value: failedPayments },
  ];

  const financeLinks = [
    {
      title: "Transactions",
      description: "Review M-Pesa transaction records, receipts, amounts and statuses.",
      path: "/admin/finance/transactions",
      label: "View Transactions",
    },
    {
      title: "Payments",
      description: "Review payment records, update statuses and manage refunds.",
      path: "/admin/payments",
      label: "View Payments",
    },
    {
      title: "Reports",
      description: "Review monthly financial revenue reports for the tenant.",
      path: "/admin/finance/reports",
      label: "View Reports",
    },
  ];

  return (
    <section className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Financial overview and payment activity.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Finance Operations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Continue from the finance dashboard to transactions, payments or reports.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {financeLinks.map((item) => (
            <div key={item.path} className="rounded-xl bg-white p-5 shadow">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 min-h-12 text-sm text-gray-600">
                {item.description}
              </p>
              <Link
                to={item.path}
                className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
