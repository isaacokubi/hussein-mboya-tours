export default function BookingOverview({
  bookingStatus = []
}) {

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
        Booking Overview
      </h2>


      <div
        className="
          grid
          md:grid-cols-3
          gap-4
        "
      >

        {
          bookingStatus.length === 0 ? (

            <p className="
              text-gray-500
            ">
              No booking data available
            </p>

          ) : (

            bookingStatus.map(
              (item, index) => (

                <div
                  key={index}
                  className="
                    border
                    rounded-lg
                    p-4
                    hover:shadow-md
                    transition
                  "
                >

                  <h3
                    className="
                      font-bold
                      capitalize
                      text-lg
                    "
                  >

                    {
                      item?._id?.bookingStatus ||
                      item?._id?.paymentStatus ||
                      "Unknown"
                    }

                  </h3>


                  <p
                    className="
                      text-gray-600
                      mt-2
                    "
                  >

                    Payment:

                    <span className="
                      ml-2
                      font-medium
                    ">
                      {
                        item?._id?.paymentStatus ||
                        "Not available"
                      }
                    </span>

                  </p>


                  <h2
                    className="
                      text-3xl
                      font-bold
                      mt-4
                    "
                  >

                    {
                      item?.count || 0
                    }

                  </h2>


                  <p className="
                    text-sm
                    text-gray-500
                  ">
                    Bookings
                  </p>


                </div>

              )

            )

          )
        }


      </div>


    </section>

  );

}