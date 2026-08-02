import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";

import { createBooking } from "../api/bookingApi";
import { initiateMpesa } from "../api/mpesaApi";
import { getTourById } from "../api/tourApi";

export default function Checkout() {
const navigate = useNavigate();
const { id } = useParams();

const [travelDate, setTravelDate] = useState("");
const [travellerCount, setTravellerCount] = useState(1);
const [phone, setPhone] = useState("");

const {
data,
isLoading,
error,
} = useQuery({
queryKey: ["tour", id],
queryFn: () => getTourById(id),
enabled: !!id,
});

console.log("CHECKOUT TOUR RESPONSE:", data);

const tour =
data?.tour ||
data?.data?.tour ||
data?.data ||
data;

const bookingMutation = useMutation({
mutationFn: createBooking,


onSuccess: async (response) => {
  try {
    const booking =
      response?.booking ||
      response?.data?.booking ||
      response?.data;

    const amount =
      booking.totalAmount ||
      booking.amount ||
      Number(tour.price || 0) *
        Number(travellerCount);

    await initiateMpesa({
      bookingId: booking._id,
      phone,
      amount,
    });

    toast.success(
      "M-Pesa payment request sent"
    );

    navigate("/dashboard");

  } catch (err) {
    toast.error(
      err?.response?.data?.message ||
      "M-Pesa initiation failed"
    );
  }
},

onError: (err) => {
  toast.error(
    err?.response?.data?.message ||
    "Booking failed"
  );
},


});

if (isLoading) {
return ( <div className="min-h-screen flex items-center justify-center">
Loading tour... </div>
);
}

if (error) {
return ( <div className="min-h-screen flex items-center justify-center text-red-600">
Failed to load tour </div>
);
}

if (!tour?._id) {
return ( <div className="min-h-screen flex items-center justify-center text-red-600">
Tour not found </div>
);
}

const total =
Number(tour.price || 0) *
Number(travellerCount);

const handleSubmit = (e) => {
e.preventDefault();


if (!travelDate) {
  toast.error(
    "Please select a travel date"
  );
  return;
}


if (!phone) {
  toast.error(
    "Please enter your phone number"
  );
  return;
}


const travelers = Array.from(
  {
    length: Number(travellerCount),
  },
  (_, index) => ({
    name: `Traveller ${index + 1}`,
    age: 0,
    passport: "",
  })
);


bookingMutation.mutate({
  tour: tour._id,

  travelDate,

  travelers,

  contact: {
    phone,
  },

  paymentMethod: "MPESA",
});


};

return ( <div className="min-h-screen bg-gray-50 py-10 px-4">


  <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">

    <h1 className="text-3xl font-bold mb-6">
      Complete Booking
    </h1>


    <div className="mb-6 p-4 bg-gray-100 rounded-xl">

      <h2 className="text-xl font-semibold">
        {tour.title}
      </h2>


      <p className="text-gray-600 mt-2">
        {tour.description}
      </p>


      <div className="mt-4 text-green-700 font-bold text-xl">
        KES {Number(tour.price || 0).toLocaleString()}
      </div>

    </div>


    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      <div>

        <label className="block mb-2 font-medium">
          Travel Date
        </label>


        <input
          type="date"
          value={travelDate}
          onChange={(e) =>
            setTravelDate(e.target.value)
          }
          className="w-full border rounded-lg p-3"
          required
        />

      </div>


      <div>

        <label className="block mb-2 font-medium">
          Number of Travellers
        </label>


        <input
          type="number"
          min="1"
          value={travellerCount}
          onChange={(e) =>
            setTravellerCount(
              Number(e.target.value)
            )
          }
          className="w-full border rounded-lg p-3"
        />

      </div>


      <div>

        <label className="block mb-2 font-medium">
          M-Pesa Phone Number
        </label>


        <input
          type="tel"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          placeholder="07XXXXXXXX"
          className="w-full border rounded-lg p-3"
          required
        />

      </div>


      <div className="text-xl font-bold">
        Total: KES {total.toLocaleString()}
      </div>


      <button
        type="submit"
        disabled={bookingMutation.isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
      >

        {bookingMutation.isPending
          ? "Processing..."
          : "Pay with M-Pesa"}

      </button>


    </form>

  </div>

</div>


);
}
