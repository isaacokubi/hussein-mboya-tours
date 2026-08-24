import { useQuery } from "@tanstack/react-query";
import { getSecurityStatus } from "../../api/superAdminApi";

export default function SuperAdminSecurity() {
  const { data: response, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["superadmin-security"],
    queryFn: getSecurityStatus,
    staleTime: 30_000,
    retry: 1,
  });

  if (isLoading) return <div className="p-8">Loading security infrastructure...</div>;

  if (isError) {
    return (
      <div className="space-y-4 p-8">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-gray-500">Platform authentication, authorization and threat monitoring</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="font-bold">Security status could not be loaded</h2>
          <p className="mt-1 text-sm">{error?.response?.data?.message || error?.message || "The security service is unavailable."}</p>
          <button type="button" onClick={() => refetch()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">Retry</button>
        </div>
      </div>
    );
  }

  const data = response?.data || response || {};
  const authenticationStatus = typeof data.authentication === "object" ? data.authentication.status : data.authentication;
  const authorization = typeof data.authorization === "object" ? data.authorization : {};
  const authorizationStatus = authorization.status || (authorization.roles > 0 && authorization.permissions > 0 ? "Active" : "Warning");
  const controls = Array.isArray(data.controls) ? data.controls : [];

  return (
    <div className="space-y-8 p-8">
      <div><h1 className="text-3xl font-bold">Security Center</h1><p className="text-gray-500">Platform authentication, authorization and threat monitoring</p></div>
      <div className="grid gap-6 md:grid-cols-4">
        <Card title="Security Score" value={`${Number(data.securityScore ?? 0)}/100`} />
        <Card title="Threat Level" value={String(data.threatLevel || "Unknown").toUpperCase()} />
        <Card title="Authentication" value={authenticationStatus || "Unknown"} />
        <Card title="Authorization" value={authorizationStatus || "Unknown"} />
      </div>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold">Security Controls</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {controls.length > 0 ? controls.map((control, index) => (
            <div key={control._id || control.name || index} className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div><p className="font-semibold">{control.name}</p><p className="text-sm text-gray-500">Security module protection</p></div>
              <span className={control.status === "active" ? "font-semibold text-green-600" : "font-semibold text-amber-600"}>{control.status || "unknown"}</span>
            </div>
          )) : <div className="text-gray-500">No security controls were returned by the security service.</div>}
        </div>
      </div>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-bold">System Protection Status</h2>
        <table className="w-full"><tbody>
          <Row name="Authentication Service" status={authenticationStatus} />
          <Row name="Authorization Service" status={authorizationStatus} />
          <Row name="Database" status={data.database} />
          <Row name="Failed Attempts (24h)" status={data.failedAttempts24h ?? 0} />
          <Row name="Critical Events (24h)" status={data.criticalEvents24h ?? 0} />
        </tbody></table>
      </div>
    </div>
  );
}

function Card({ title, value }) { return <div className="rounded-xl bg-white p-5 shadow"><h3 className="text-gray-500">{title}</h3><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
function Row({ name, status }) { return <tr className="border-b"><td className="py-3 font-medium">{name}</td><td className="py-3 text-right"><span className="rounded bg-gray-100 px-3 py-1">{typeof status === "object" ? JSON.stringify(status) : String(status ?? "Unknown")}</span></td></tr>; }
