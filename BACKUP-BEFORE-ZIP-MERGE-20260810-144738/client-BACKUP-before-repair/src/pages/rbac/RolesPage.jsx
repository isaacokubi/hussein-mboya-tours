import {
    useQuery
} from "@tanstack/react-query";

import {
    getRoles
} from "../../admin/rolesApi.js";



export default function RolesPage(){

    const {
        data,
        isLoading
    } = useQuery({

        queryKey:["roles"],

        queryFn:getRoles

    });



    if(isLoading){

        return (
            <div>
                Loading roles...
            </div>
        );

    }



    const roles =
    data?.data ||
    data ||
    [];



    return (

        <div className="space-y-6">

            <h1 className="
                text-3xl
                font-bold
            ">

                Roles & Permissions

            </h1>



            <div className="
                bg-white
                rounded-xl
                shadow
                overflow-hidden
            ">

                <table className="w-full">

                    <thead>

                        <tr className="
                            bg-gray-100
                        ">

                            <th className="p-4 text-left">
                                Role
                            </th>

                            <th className="p-4 text-left">
                                Permissions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            roles.map(role=>(

                                <tr
                                key={role._id}
                                className="border-b"
                                >

                                    <td className="p-4">

                                        {role.name}

                                    </td>

                                    <td className="p-4">

                                        {

                                            role.permissions
                                            ?.length || 0

                                        }

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}