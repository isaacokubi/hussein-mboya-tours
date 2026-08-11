export default function DataTable({
    columns = [],
    data = []
}) {


    const safeValue = (value)=>{


        if(value === null || value === undefined){

            return "-";

        }



        if(typeof value === "object"){

            return JSON.stringify(value);

        }



        return value;

    };



    return (

        <div
            className="
                overflow-x-auto
                bg-white
                rounded-xl
                shadow
            "
        >


            <table
                className="
                    w-full
                "
            >


                <thead
                    className="
                        bg-gray-100
                    "
                >

                    <tr>


                    {
                        columns.map(col=>(


                            <th

                                key={col.key}

                                className="
                                    p-4
                                    text-left
                                "

                            >

                                {col.label}


                            </th>


                        ))
                    }


                    </tr>


                </thead>




                <tbody>


                {
                    data.length === 0

                    ?

                    (

                        <tr>

                            <td

                                colSpan={columns.length}

                                className="
                                    p-6
                                    text-center
                                    text-gray-500
                                "

                            >

                                No data available

                            </td>

                        </tr>

                    )

                    :

                    data.map(
                        (row,index)=>(


                        <tr

                            key={
                                row._id || index
                            }

                            className="
                                border-b
                            "

                        >



                        {
                            columns.map(col=>(


                                <td

                                    key={col.key}

                                    className="
                                        p-4
                                    "

                                >


                                {
                                    col.render

                                    ?

                                    col.render(row)

                                    :

                                    safeValue(
                                        row[col.key]
                                    )

                                }


                                </td>


                            ))
                        }



                        </tr>


                    ))
                }



                </tbody>


            </table>


        </div>

    );

}