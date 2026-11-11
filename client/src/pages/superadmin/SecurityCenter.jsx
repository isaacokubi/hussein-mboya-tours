/**
 * Purpose: Security Center page-level UI component. Main declarations: SecurityCenter, Card.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useQuery } from "@tanstack/react-query";
// Load ../../api/superAdminApi so this module can use its exported dependencies.
import { getSecurityStatus, getSecurityEvents } from "../../api/superAdminApi";

// Define SecurityCenter; its parameters and body implement this operation.
export default function SecurityCenter() {
  // Declare statusQuery for use by the surrounding module or function.
  const statusQuery = useQuery({ queryKey: ["security-center-status"], queryFn: getSecurityStatus, staleTime: 30_000, retry: 1 });
  // Declare eventsQuery for use by the surrounding module or function.
  const eventsQuery = useQuery({ queryKey: ["security-center-events"], queryFn: getSecurityEvents, staleTime: 30_000, retry: 1 });

  // Check the condition (statusQuery.isLoading) and run the matching branch.
  if (statusQuery.isLoading) return <div className="p-8">Checking security infrastructure...</div>;

  // Check the condition (statusQuery.isError) and run the matching branch.
  if (statusQuery.isError) {
    // Return the expression shown below to the caller.
    return <div className="space-y-4 p-8"><h1 className="text-3xl font-bold">Security Center</h1><div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><h2 className="font-bold">Security status unavailable</h2><p className="mt-1 text-sm">{statusQuery.error?.response?.data?.message || statusQuery.error?.message || "Unable to reach the security service."}</p><button type="button" onClick={() => statusQuery.refetch()} className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white">Retry</button></div></div>;
  }

  // Declare response for use by the surrounding module or function.
  const response = statusQuery.data?.data || statusQuery.data || {};
  // Declare events for use by the surrounding module or function.
  const events = eventsQuery.data?.data || eventsQuery.data || [];
  // Declare authentication for use by the surrounding module or function.
  const authentication = typeof response.authentication === "object" ? response.authentication.status : response.authentication;
  // Declare authorization for use by the surrounding module or function.
  const authorization = typeof response.authorization === "object" ? response.authorization.status : response.authorization;

  // Return the expression shown below to the caller.
  return <div className="space-y-8 p-8">
    <div><h1 className="text-3xl font-bold">Security Center</h1><p className="text-gray-500">Platform authentication, authorization and threat monitoring</p></div>
    <div className="grid gap-5 md:grid-cols-4">
      <Card title="Security Score" value={`${Number(response.securityScore ?? 0)}/100`} />
      <Card title="Threat Level" value={String(response.threatLevel || "Unknown").toUpperCase()} />
      <Card title="Authentication" value={authentication || "Unknown"} />
      <Card title="Authorization" value={authorization || "Unknown"} />
    </div>
    <section className="rounded-xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold">Security Controls</h2><div className="grid gap-3 md:grid-cols-2">{(response.controls || []).map((control, index) => <div key={control.name || index} className="flex justify-between rounded-lg bg-gray-50 p-4"><span className="font-semibold">{control.name}</span><span className={control.status === "active" ? "font-semibold text-green-600" : "font-semibold text-amber-600"}>{control.status || "unknown"}</span></div>)}</div></section>
    <section className="rounded-xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold">Recent Security Events</h2>{eventsQuery.isError ? <p className="text-red-600">Unable to load security events.</p> : events.length === 0 ? <p className="text-gray-500">No security events recorded.</p> : events.map((event, index) => <div key={event._id || index} className="border-b py-3">{event.message || event.action || event.event || "Security event"}</div>)}</section>
  </div>;
}

// Define Card; its parameters and body implement this operation.
function Card({ title, value }) { return <div className="rounded-xl bg-white p-5 shadow"><h3 className="text-gray-500">{title}</h3><p className="mt-2 text-3xl font-bold">{value}</p></div>; }
