import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import { getBookings, completeBooking, cancelBooking } from "../../api/tourManagerApi";

export default function TourManagerBookings() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["tour-manager-bookings"], queryFn: getBookings });
  const bookings = Array.isArray(data) ? data : data?.bookings || data?.data || [];

  const completeMutation = useMutation({
    mutationFn: completeBooking,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tour-manager-bookings"] }); toast.success("Booking marked completed."); },
    onError: e => toast.error(e?.response?.data?.message || "Could not complete booking."),
  });
  const cancelMutation = useMutation({
    mutationFn: ({id,reason}) => cancelBooking(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tour-manager-bookings"] }); toast.success("Booking cancelled."); },
    onError: e => toast.error(e?.response?.data?.message || "Could not cancel booking."),
  });

  if (isLoading) return <div className="p-6">Loading bookings...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load bookings.</div>;

  return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl">
    <div className="mb-6"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Reservations</p><h1 className="text-3xl font-bold text-slate-900">Booking Operations</h1><p className="text-slate-500">Confirm operational status, complete trips and cancel bookings when necessary.</p></div>
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><div className="overflow-x-auto"><table className="w-full"><thead className="bg-slate-50"><tr><th className="p-4 text-left">Booking</th><th className="p-4 text-left">Customer</th><th className="p-4 text-left">Tour</th><th className="p-4 text-left">Travel date</th><th className="p-4 text-left">Payment</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
    <tbody>{bookings.map(b=><tr key={b._id} className="border-t hover:bg-slate-50"><td className="p-4 font-semibold">{b.bookingNumber || b._id}</td><td className="p-4">{b.customer?.name || b.user?.name || b.customerSnapshot?.name || "-"}</td><td className="p-4">{b.tour?.title || "-"}</td><td className="p-4">{b.travelDate ? new Date(b.travelDate).toLocaleDateString() : "-"}</td><td className="p-4 capitalize">{b.paymentStatus || "pending"}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">{b.status || "pending"}</span></td><td className="p-4"><div className="flex justify-end gap-2">{b.paymentStatus==="paid" && !["completed","cancelled","refunded"].includes(b.status) && <button onClick={()=>completeMutation.mutate(b._id)} disabled={completeMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><CheckCircle size={14}/> Complete</button>}{!["completed","cancelled","refunded"].includes(b.status) && <button onClick={()=>{if(window.confirm("Cancel this booking? This releases its reserved tour capacity.")) cancelMutation.mutate({id:b._id,reason:"Cancelled by tour manager"})}} disabled={cancelMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"><XCircle size={14}/> Cancel</button>}</div></td></tr>)}{!bookings.length&&<tr><td colSpan="7" className="p-10 text-center text-slate-500">No bookings found.</td></tr>}</tbody></table></div></div>
  </div></div>;
}
