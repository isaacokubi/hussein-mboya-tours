export default function RecentBookings({
  bookings = []
}) {


  // Ensure bookings is always an array
  const bookingList = Array.isArray(bookings)
    ? bookings
    : [];


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
        bookingList.length === 0 ?

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
                (booking) => (

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

                        {
                          booking?.paymentStatus ||
                          "pending"
                        }

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