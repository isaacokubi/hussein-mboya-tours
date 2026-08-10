import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "../../api/axios";

export default function StaffManagement() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["staff", "admin"],
        queryFn: async () => {
            const res = await api.get("/staff", {
                params: { includeInactive: true, limit: 100 }
            });
            return res.data;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, active }) => {
            const res = await api.put(`/staff/${id}/status`, {
                isActive: active,
                status: active ? "active" : "inactive",
                availability: active ? "available" : "unavailable"
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Staff status updated.");
            queryClient.invalidateQueries({ queryKey: ["staff", "admin"] });
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                "Unable to update staff status."
            );
        }
    });

    const staff =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data?.staff)
                    ? data.staff
                    : [];

    if (isLoading) {
        return <div className="p-6">Loading staff...</div>;
    }

    if (isError) {
        return <div className="p-6 text-red-600">Failed to load staff.</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <p className="text-gray-600">
                    Manage guides, drivers and other staff.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Position</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((member) => {
                            const active =
                                member.isActive !== false &&
                                String(member.status || "active").toLowerCase() === "active";

                            return (
                                <tr key={member._id} className="border-t">
                                    <td className="p-3">{member.name}</td>
                                    <td className="p-3">{member.email}</td>
                                    <td className="p-3 capitalize">{member.position}</td>
                                    <td className={`p-3 font-semibold ${active ? "text-green-600" : "text-red-600"}`}>
                                        {active ? "Active" : "Inactive"}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            type="button"
                                            disabled={statusMutation.isPending}
                                            onClick={() =>
                                                statusMutation.mutate({
                                                    id: member._id,
                                                    active: !active
                                                })
                                            }
                                            className="rounded bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50"
                                        >
                                            {active ? "Disable" : "Enable"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!staff.length && (
                            <tr>
                                <td colSpan="5" className="p-6 text-center text-gray-500">
                                    No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
