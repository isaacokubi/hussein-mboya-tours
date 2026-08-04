export default function RecentBookings({
  bookings = []
}) {


  const bookingList = Array.isArray(bookings)
    ? bookings
    : [];




  const getBookingStatus = (status) => {

    if (!status) {
      return "pending";
    }

    return typeof status === "string"
      ? status
      : status.status || "pending";

  };


  const getPaymentStatus = (paymentStatus) => {

    if (!paymentStatus) {
      return "pending";
    }


    if (typeof paymentStatus === "string") {
      return paymentStatus;
    }


    if (typeof paymentStatus === "object") {

      return (
        paymentStatus.paymentStatus ||
        paymentStatus.status ||
        "pending"
      );

    }


    return "pending";

  };



  return (

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
          font-bold
          mb-5
        "
      >
        Recent Bookings
      </h2>



      {
        bookingList.length === 0

        ?

        (

          <p
            className="
              text-gray-500
            "
          >
            No recent bookings available
          </p>

        )

        :

        (

          <div
            className="
              space-y-4
            "
          >

          {
            bookingList.map(

              (booking)=>(

                <div
                  key={booking?._id}
                  className="
                    border
                    rounded-lg
                    p-4
                    flex
                    justify-between
                    items-center
                  "
                >


                  <div>


                    <h3
                      className="
                        font-semibold
                      "
                    >

                    {
                      booking?.bookingNumber ||
                      "Booking"
                    }

                    </h3>



                    <p
                      className="
                        text-gray-500
                      "
                    >

                    {
                      booking?.customer?.name ||
                      booking?.fullName ||
                      "Customer"
                    }

                    </p>


                  </div>




                  <div
                    className="
                      text-right
                    "
                  >


                    <p
                      className="
                        font-bold
                      "
                    >

                    Ksh {

                      Number(
                        booking?.totalAmount ||
                        booking?.amount ||
                        0
                      )
                      .toLocaleString()

                    }

                    </p>




                    <span
                      className="
                        text-sm
                        capitalize
                      "
                    >

                    <p>
                      Status:

                      {" "}

                      {
                        getBookingStatus(
                          booking?.status
                        )
                      }
                    </p>


                    <p>
                      Payment:

                      {" "}

                      {
                        getPaymentStatus(
                          booking?.paymentStatus
                        )
                      }
                    </p>

                    </span>


                  </div>


                </div>

              )

            )
          }


          </div>

        )

      }



    </section>

  );

}