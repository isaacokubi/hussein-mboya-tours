import { useParams } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { getBooking } from "../api/bookingApi";

export default function BookingDetails() {
  const { id } = useParams();

  const { data: booking } = useQuery({
    queryKey: ["booking", id],

    queryFn: () => getBooking(id),
  });

  if (!booking) return <div>Loading...</div>;

  return (
    <div
      className="
p-10
"
    >
      <h1
        className="
text-4xl
font-bold
"
      >
        {booking.tour.title}
      </h1>

      <div
        className="
mt-5
bg-white
shadow
rounded-xl
p-6
"
      >
        <p>
          Booking Number:
          <strong>{booking.bookingNumber}</strong>
        </p>

        <p>
          Travel Date:
          {booking.travelDate}
        </p>

        <p>Amount Paid: KES {booking.totalAmount}</p>

        <p>
          Status:
          {booking.bookingStatus}
        </p>
      </div>
    </div>
  );
}
