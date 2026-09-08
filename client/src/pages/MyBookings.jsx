import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { cancelBooking, getMyBookings, rescheduleBooking } from "../api/bookingApi";

const bookingsFrom = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.bookings)) return response.bookings;
  if (Array.isArray(response?.data?.bookings)) return response.data.bookings;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};
const statusOf = (b) => String(b?.status || b?.bookingStatus || "pending").toLowerCase();
const paymentOf = (b) => String(typeof b?.paymentStatus === "object" ? b.paymentStatus?.paymentStatus || b.paymentStatus?.status || "pending" : b?.paymentStatus || "pending").toLowerCase();
const nameOf = (b) => typeof b?.tour === "object" ? b.tour?.title || b.tour?.name || "Tour Package" : b?.tourTitle || b?.tourName || b?.tour || "Tour Package";
const refOf = (b) => b?.bookingReference || b?.bookingRef || b?.reference || b?.bookingNumber || b?._id?.slice(-8)?.toUpperCase() || "N/A";
const money = (b) => Number(b?.totalAmount ?? b?.amount ?? b?.total ?? b?.pricing?.total ?? 0);
const paid = (b) => Number(b?.amountPaid ?? b?.paidAmount ?? b?.depositAmount ?? b?.paymentSummary?.paid ?? 0);
const balance = (b) => Math.max(Number(b?.balanceAmount ?? b?.balance ?? b?.paymentSummary?.balance ?? money(b) - paid(b)), 0);
const dateOf = (v) => v ? new Date(v).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "Not specified";

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");

  // Do not redirect from this page based on a transient/stale role value.
  // ProtectedRoute already authenticates the session, while the backend
  // enforces customer ownership on /bookings/my-bookings.
  const query = useQuery({
    queryKey: ["my-bookings", user?._id || user?.id || "current"],
    queryFn: () => getMyBookings({ limit: 100 }),
    enabled: !authLoading && !!user,
    staleTime: 30_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: async () => { toast.success("Booking cancelled successfully."); await queryClient.invalidateQueries({ queryKey: ["my-bookings"] }); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to cancel booking."),
  });

  const reschedule = useMutation({
    mutationFn: ({ id, date, changeReason }) => rescheduleBooking(id, { newTravelDate: date, reason: changeReason }),
    onSuccess: async () => { toast.success("Booking rescheduled successfully."); setEditing(null); setNewDate(""); setReason(""); await queryClient.invalidateQueries({ queryKey: ["my-bookings"] }); },
    onError: (e) => toast.error(e?.response?.data?.message || "Unable to reschedule booking."),
  });

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><p className="font-semibold">Loading your account...</p></div>;
  if (!user) return <main className="flex min-h-screen items-center justify-center"><div className="rounded-2xl bg-white p-8 text-center shadow"><p className="font-semibold">Your session has expired.</p><Link to="/login" className="mt-4 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white">Sign in again</Link></div></main>;

  const bookings = bookingsFrom(query.data);
  const upcoming = bookings.filter((b) => b.travelDate && new Date(b.travelDate) >= new Date() && statusOf(b) !== "cancelled");
  const paidTrips = bookings.filter((b) => ["paid", "completed", "success"].includes(paymentOf(b)));

  return <main className="min-h-screen bg-gray-100 px-3 py-5 sm:px-6 sm:py-8"><div className="mx-auto max-w-7xl">
    <header className="mb-6 rounded-2xl bg-gradient-to-r from-green-900 to-yellow-600 p-5 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold sm:text-4xl">My Bookings</h1><p className="mt-2">View, pay, reschedule and manage all your trips.</p></div><Link to="/tours" className="w-fit rounded-xl bg-white px-5 py-3 font-bold text-green-900">Explore Tours</Link></div></header>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"><Stat title="Total Bookings" value={bookings.length}/><Stat title="Upcoming Trips" value={upcoming.length}/><Stat title="Paid Trips" value={paidTrips.length}/></div>
    {query.isLoading && <Panel>Loading your bookings...</Panel>}
    {query.isError && <Panel><p className="font-semibold text-red-700">Unable to load your bookings.</p><p className="mt-2 text-sm text-gray-600">{query.error?.response?.data?.message || query.error?.message || "Please try again."}</p><button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="mt-4 rounded-xl bg-green-700 px-6 py-3 font-bold text-white">{query.isFetching ? "Retrying..." : "Retry"}</button></Panel>}
    {!query.isLoading && !query.isError && bookings.length === 0 && <Panel><h2 className="text-2xl font-bold">No Bookings Yet</h2><p className="mt-2 text-gray-600">Start exploring Kenya's best tours.</p><Link to="/tours" className="mt-5 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white">Explore Tours</Link></Panel>}
    <div className="space-y-5">{bookings.map((b) => { const status=statusOf(b); const payment=paymentOf(b); const total=money(b); const amountPaid=paid(b); const due=balance(b); const failed=["failed","cancelled"].includes(payment); const canPay=!['cancelled','completed'].includes(status)&&due>0; const open=editing===b._id; return <article key={b._id||refOf(b)} className="rounded-2xl bg-white p-4 shadow sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><h2 className="text-xl font-bold text-green-800 sm:text-2xl">{nameOf(b)}</h2><p className="mt-1 text-sm text-gray-600">Booking Reference: <b>{refOf(b)}</b></p></div><div className="flex flex-wrap gap-2"><Badge label="Booking" value={status}/><Badge label="Payment" value={payment}/></div></div>
      <div className="my-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Travel Date" value={dateOf(b.travelDate||b.date)}/><Detail label="Pickup" value={b.pickupLocation||b.pickup?.location||b.pickupAddress||"Not specified"}/><Detail label="Total" value={`KES ${total.toLocaleString()}`}/><Detail label="Balance" value={`KES ${due.toLocaleString()}`}/></div>
      <p className="border-t pt-4 text-sm text-gray-600">Travellers: <b>{b.travelers?.length||b.numberOfGuests||1}</b> <span className="ml-5">Paid: <b>KES {amountPaid.toLocaleString()}</b></span></p>
      {open && <div className="mt-4 rounded-xl bg-sky-50 p-4"><div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]"><input type="date" min={new Date(Date.now()+86400000).toISOString().slice(0,10)} value={newDate} onChange={(e)=>setNewDate(e.target.value)} className="rounded-lg border p-2"/><input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason (optional)" className="rounded-lg border p-2"/><button type="button" disabled={!newDate||reschedule.isPending} onClick={()=>reschedule.mutate({id:b._id,date:newDate,changeReason:reason})} className="rounded-lg bg-sky-700 px-4 py-2 font-bold text-white disabled:opacity-50">{reschedule.isPending?"Saving...":"Save Date"}</button></div></div>}
      <div className="mt-5 flex flex-wrap gap-2 border-t pt-4"><Link to={`/bookings/${b._id}`} className="rounded-xl bg-green-700 px-5 py-2.5 font-semibold text-white">Open Booking</Link>{canPay&&<Link to={`/checkout/booking/${b._id}`} className={`rounded-xl px-5 py-2.5 font-bold text-white ${failed?"bg-red-600":"bg-black"}`}>{failed?"Retry Payment":"Pay Balance"}</Link>}{!['cancelled','completed'].includes(status)&&<button type="button" onClick={()=>{setEditing(open?null:b._id);setNewDate("");setReason("")}} className="rounded-xl bg-sky-100 px-5 py-2.5 font-semibold text-sky-800">{open?"Close":"Reschedule"}</button>}{!['cancelled','completed'].includes(status)&&<button type="button" disabled={cancel.isPending} onClick={()=>{if(window.confirm(`Cancel booking ${refOf(b)}?`))cancel.mutate(b._id)}} className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{cancel.isPending?"Cancelling...":"Cancel"}</button>}</div>
    </article>;})}</div>
  </div></main>;
}
function Panel({children}){return <div className="rounded-2xl bg-white p-8 text-center shadow">{children}</div>}
function Stat({title,value}){return <div className="rounded-2xl bg-white p-5 shadow"><p className="text-sm text-gray-500">{title}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>}
function Detail({label,value}){return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold uppercase text-gray-500">{label}</p><p className="mt-1 break-words font-semibold">{value}</p></div>}
function Badge({label,value}){const tone=["completed","paid","success"].includes(value)?"bg-green-100 text-green-700":["cancelled","failed"].includes(value)?"bg-red-100 text-red-700":"bg-yellow-100 text-yellow-700";return <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${tone}`}>{label}: {value}</span>}
