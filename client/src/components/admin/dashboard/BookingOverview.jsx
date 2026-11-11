/**
 * Purpose: Booking Overview reusable UI component. Main declarations: BookingOverview, getStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export default function BookingOverview({
    statusData = []
}) {


    // Declare getStatus for use by the surrounding module or function.
    const getStatus = (item) => {

        // Declare status for use by the surrounding module or function.
        const status =
            item?._id?.status;


        // Declare paymentStatus for use by the surrounding module or function.
        const paymentStatus =
            item?._id?.paymentStatus;


        // Declare payment for use by the surrounding module or function.
        const payment =
            typeof paymentStatus === "object"

            ?

            (
                paymentStatus.paymentStatus ||
                paymentStatus.status ||
                "pending"
            )

            :

            paymentStatus || "pending";


        // Return the object assembled below to the caller.
        return {
            status:
                status || "Unknown",

            paymentStatus:
                payment
        };

    };



    // Return the expression shown below to the caller.
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
                statusData.map(
                    (item,index)=>{


                        const status =
                            getStatus(item);


                        return (

                            <div
                                key={index}
                                className="
                                border
                                rounded-lg
                                p-4
                                "
                            >

                                <h3
                                    className="
                                    font-bold
                                    capitalize
                                    "
                                >
                                    {
                                        status.status
                                    }
                                </h3>


                                <p>

                                    Payment:

                                    {" "}

                                    {
                                        status.paymentStatus
                                    }

                                </p>


                                <h2
                                    className="
                                    text-2xl
                                    font-bold
                                    mt-3
                                    "
                                >
                                    {
                                        item.count || 0
                                    }
                                </h2>


                            </div>

                        );


                    }

                )
            }

            </div>


        </section>

    );

}
