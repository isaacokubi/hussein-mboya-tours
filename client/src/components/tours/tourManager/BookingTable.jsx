export default function BookingTable({ bookings = [] }) {
  const statusClass = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "paid": return "bg-green-100 text-green-700";
      case "confirmed": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "cancelled":
      case "failed":
      case "refunded": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-white p-6 shadow">
      <h2 className="mb-6 text-xl font-bold">Recent Bookings</h2>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-3">Booking</th>
            <th>Customer</th>
            <th>Tour</th>
            <th>Travel Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length ? bookings.map((booking) => {
            const status = typeof booking.status === "object"
              ? booking.status?.status || booking.status?.bookingStatus || booking.paymentStatus || "pending"
              : booking.status || booking.paymentStatus || "pending";
            const customerName = booking.customer?.name || booking.user?.name || booking.customerSnapshot?.name || booking.contact?.name || "Unknown";
            const tourTitle = booking.tour?.title || booking.tour?.name || (booking.customTourRequest ? "Custom Tour Package" : "Tour");
            const bookingNumber = booking.bookingNumber || booking._id?.slice(-6).toUpperCase();
            const travelDate = booking.travelDate || booking.date || booking.createdAt;
            return (
              <tr key={booking._id || booking.id} className="border-b hover:bg-gray-50">
                <td className="py-4">{bookingNumber}</td>
                <td>{customerName}</td>
                <td>{tourTitle}</td>
                <td>{formatDate(travelDate)}</td>
                <td><span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass(status)}`}>{status}</span></td>
              </tr>
            );
          }) : <tr><td colSpan="5" className="py-8 text-center text-gray-500">No bookings found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
