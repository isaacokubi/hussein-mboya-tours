export default function BookingOverview({
    statusData = []
}) {


    const getStatus = (item) => {

        const status =
            item?._id?.status;


        const paymentStatus =
            item?._id?.paymentStatus;


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


        return {
            status:
                status || "Unknown",

            paymentStatus:
                payment
        };

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
