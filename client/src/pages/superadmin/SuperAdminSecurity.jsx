import { useQuery } from "@tanstack/react-query";
import { getSecurityStatus } from "../../api/superAdminApi";

export default function SuperAdminSecurity() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["superadmin-security"],
    queryFn: getSecurityStatus,
    staleTime: 30_000,
  });

  if (isLoading) return <div className="p-8">Loading security infrastructure...</div>;

  const data = response?.data || response || {};

  return (
    <div className="space-y-8 p-8">
      <div><h1 className="text-3xl font-bold">Security Center</h1><p className="text-gray-500">Platform authentication, authorization and threat monitoring</p></div>
      <div className="grid gap-6 md:grid-cols-4">
        <Card title="Security Score" value={`${data.securityScore || 0}/100`} />
        <Card title="Threat Level" value={data.threatLevel || "Low"} />
        <Card title="Authentication" value={typeof data.authentication === "object" ? data.authentication.status || "Active" : data.authentication || "Unknown"} />
        <Card title="Authorization" value={typeof data.authorization === "object" ? `Roles: ${data.authorization.roles || 0} | Permissions: ${data.authorization.permissions || 0} | Admins: ${data.authorization.admins || 0}` : data.authorization || "Unknown"} />
      </div>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold">Security Controls</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(data.controls) && data.controls.length > 0 ? data.controls.map((control, index) => (
            <div key={control._id || control.name || index} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div><p className="font-semibold">{control.name}</p><p className="text-sm text-gray-500">Security module protection</p></div>
              <span className={control.status === "active" ? "font-semibold text-green-600" : "font-semibold text-red-600"}>{control.status || "unknown"}</span>
            </div>
          )) : <div className="text-gray-500">No security controls available</div>}
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold">System Protection Status</h2>
        <table className="w-full"><tbody>
          <Row name="Authentication Service" status={typeof data.authentication === "object" ? data.authentication.status : data.authentication} />
          <Row name="Authorization Service" status={typeof data.authorization === "object" ? data.authorization.status || `Healthy (${data.authorization.roles || 0} Roles, ${data.authorization.permissions || 0} Permissions, ${data.authorization.admins || 0} Admins)` : data.authorization} />
          <Row name="Database" status={data.database} />
        </tbody></table>
      </div>
    </div>
  );
}

function Card({ title, value }) { return <div className="rounded-xl bg-white p-5 shadow"><h3 className="text-gray-500">{title}</h3><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
function Row({ name, status }) { return <tr className="border-b"><td className="py-3 font-medium">{name}</td><td className="py-3 text-right"><span className="rounded bg-gray-100 px-3 py-1">{typeof status === "object" ? JSON.stringify(status) : status || "Unknown"}</span></td></tr>; }
