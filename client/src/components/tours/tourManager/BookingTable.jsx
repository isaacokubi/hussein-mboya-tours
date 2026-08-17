export default function BookingTable({ bookings = [] }) {
  const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-bold">Recent Bookings</h2>
      <table className="w-full min-w-[700px]">
        <thead><tr className="border-b text-left text-gray-500"><th className="py-3">Booking</th><th>Customer</th><th>Tour</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {bookings.length ? bookings.map((booking) => {
            const status = typeof booking.status === "object"
              ? booking.status?.status || booking.status?.bookingStatus || "pending"
              : booking.status || "pending";
            return (
              <tr key={booking._id} className="border-b hover:bg-gray-50">
                <td className="py-4">{booking.bookingNumber || booking._id?.slice(-6).toUpperCase()}</td>
                <td>{booking.user?.name || booking.customer?.name || "Unknown"}</td>
                <td>{booking.tour?.title || booking.tour?.name || "Tour"}</td>
                <td>{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "-"}</td>
                <td><span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass(status)}`}>{status}</span></td>
              </tr>
            );
          }) : <tr><td colSpan="5" className="py-8 text-center text-gray-500">No bookings found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
