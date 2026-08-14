import { useSettings } from "../../context/SettingsContext";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getCustomerProfile } from "../../api/customerApi";

export default function CustomerDetails(
) {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-customer", id],
    queryFn: () => getCustomerProfile(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <div className="p-6">Loading customer...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customer.</div>;

  const customer = data?.data?.customer || data?.customer;
  const bookings = data?.data?.bookings || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link to="/admin/customers" className="text-sm font-semibold text-emerald-700">← Back to customers</Link>
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold">{customer?.name || "Customer"}</h1>
          <p className="mt-1 text-slate-500">{customer?.email} · {customer?.phone}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Metric label="Bookings" value={data?.data?.summary?.totalBookings || 0} />
            <Metric label="Total paid" value={`settings.currency || "KES" ${Number(data?.data?.summary?.totalPaid || 0).toLocaleString()}`} />
            <Metric label="Confirmed spend" value={`settings.currency || "KES" ${Number(data?.data?.summary?.totalSpent || 0).toLocaleString()}`} />
          </div>
        </section>
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-slate-50"><tr><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Tour</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Amount</th></tr></thead>
            <tbody>
              {bookings.map((b) => <tr key={b._id} className="border-t"><td className="p-4">{b.bookingNumber || b._id}</td><td className="p-4">{b.tour?.title || "-"}</td><td className="p-4">{b.travelDate ? new Date(b.travelDate).toLocaleDateString() : "-"}</td><td className="p-4 capitalize">{b.status || "-"}</td><td className="p-4 font-semibold">settings.currency || "KES" {Number(b.totalAmount || 0).toLocaleString()}</td></tr>)}
              {!bookings.length && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No bookings found.</td></tr>}
            </tbody>
          </table></div>
        </section>
      </div>
    </div>
  );
}
function Metric({ label, value }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}
