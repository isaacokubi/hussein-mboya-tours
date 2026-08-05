import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export default function StaffManagement(){

    const {
        data,
        isLoading
    } = useQuery({
        queryKey:["staff"],
        queryFn: async()=>{
            const res = await api.get("/staff");

            console.log("STAFF API RESPONSE:", res.data);

            return res.data;
        }
    });

    const staff = data?.data || [];

    if(isLoading){
        return (
            <div className="p-6">
                Loading staff...
            </div>
        );
    }

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Staff Management
            </h1>

            <div className="bg-white rounded-xl shadow overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Position</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>

                    {staff.map((member)=>(

                        <tr key={member._id} className="border-t">

                            <td className="p-3">
                                {member.name}
                            </td>

                            <td className="p-3">
                                {member.email}
                            </td>

                            <td className="p-3 capitalize">
                                {member.position}
                            </td>

                            <td className="p-3">
                                {member.status}
                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}
