import { useState } from "react";
import { Eye, X } from "lucide-react";
import useAgentCustomers from "../../hooks/useAgentCustomers";

const nameOf = (customer) => [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || customer?.name || "Customer";

export default function AgentCustomers() {
  const { data = [], isLoading, isError } = useAgentCustomers();
  const [selected, setSelected] = useState(null);
  const customers = Array.isArray(data) ? data : data?.customers || data?.data?.customers || [];

  if (isLoading) return <div className="p-6">Loading customers...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load customers</div>;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6"><h1 className="text-2xl font-bold">My Customers</h1><p className="mt-1 text-slate-500">Customers associated with your agency.</p></div>
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full min-w-[720px]"><thead className="bg-gray-100"><tr className="border-b"><th className="p-4 text-left">Name</th><th className="p-4 text-left">Phone</th><th className="p-4 text-left">Nationality</th><th className="p-4 text-left">Status</th><th className="p-4 text-left">Actions</th></tr></thead>
          <tbody>{customers.length === 0 ? <tr><td colSpan="5" className="p-6 text-center text-gray-500">No customers found</td></tr> : customers.map((customer) => <tr key={customer._id} className="border-b last:border-0"><td className="p-4 font-medium">{nameOf(customer)}</td><td className="p-4">{customer.phone || "-"}</td><td className="p-4">{customer.nationality || "-"}</td><td className="p-4"><span className="rounded-full bg-green-100 px-3 py-1 text-sm">{customer.status || "Active"}</span></td><td className="p-4"><button type="button" onClick={() => setSelected(customer)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Eye size={15}/> View / Details</button></td></tr>)}</tbody>
        </table>
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><h2 className="text-xl font-bold">{nameOf(selected)}</h2><p className="text-sm text-slate-500">Customer details</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div><div className="grid gap-4 p-5 sm:grid-cols-2"><Detail label="Phone" value={selected.phone}/><Detail label="Email" value={selected.email}/><Detail label="Nationality" value={selected.nationality}/><Detail label="Status" value={selected.status || "Active"}/><Detail label="Customer ID" value={selected._id}/><Detail label="Created" value={selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : undefined}/></div><div className="flex justify-end border-t p-5"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 font-semibold">Close</button></div></div></div>}
    </div>
  );
}

function Detail({ label, value }) { return <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 break-words font-medium text-slate-900">{value || "Not available"}</div></div>; }
