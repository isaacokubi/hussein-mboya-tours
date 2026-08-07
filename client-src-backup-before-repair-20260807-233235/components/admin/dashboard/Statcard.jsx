export default function StatCard({
    title,
    value = 0,
    icon,
}) {


    return (

        <div
            className="
                bg-white
                rounded-xl
                shadow
                p-6
                border
                hover:shadow-md
                transition
            "
        >


            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >


                <div>


                    <p
                        className="
                            text-sm
                            text-gray-500
                            font-medium
                        "
                    >
                        {title}
                    </p>



                    <h2
                        className="
                            text-3xl
                            font-bold
                            mt-2
                            text-gray-900
                        "
                    >
                        {
                            typeof value === "object"
                            ? "0"
                            : value
                        }
                    </h2>


                </div>



                {
                    icon && (

                        <div
                            className="
                                text-3xl
                                text-gray-400
                            "
                        >
                            {icon}
                        </div>

                    )
                }


            </div>


        </div>

    );

}