/**
 * Purpose: Vehicles page-level UI component. Main declarations: statusLabel, statusTone, imageUrl, Vehicles, handleAssign.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useMemo, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load lucide-react so this module can use its exported dependencies.
import { Car, CheckCircle2, ChevronDown, Image as ImageIcon, RefreshCw, Search, Users, Wrench, X, Trash2, Pencil } from "lucide-react";
// Load ../../api/vehicleApi so this module can use its exported dependencies.
import { getVehicles, deleteVehicle, assignDriver, getDrivers } from "../../api/vehicleApi";
// Load ../../components/admin/AddVehicleModal so this module can use its exported dependencies.
import AddVehicleModal from "../../components/admin/AddVehicleModal";

// Declare statusLabel for use by the surrounding module or function.
const statusLabel = (value) => String(value || "available").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
// Declare statusTone for use by the surrounding module or function.
const statusTone = (value) => {
  // Declare s for use by the surrounding module or function.
  const s = String(value || "").toLowerCase();
  // Check the condition (s === "available") and run the matching branch.
  if (s === "available") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  // Check the condition (s === "assigned") and run the matching branch.
  if (s === "assigned") return "blue";
  // Check the condition (s === "maintenance") and run the matching branch.
  if (s === "maintenance") return "amber";
  // Return a configured text value to the caller.
  return "red";
};
// Declare imageUrl for use by the surrounding module or function.
const imageUrl = (vehicle) => vehicle?.image?.url || vehicle?.image?.secure_url || (typeof vehicle?.image === "string" ? vehicle.image : "");

// Define Vehicles; its parameters and body implement this operation.
export default function Vehicles() {
  // Declare queryClient for use by the surrounding module or function.
  const queryClient = useQueryClient();
  // Declare [showAdd, setShowAdd] for use by the surrounding module or function.
  const [showAdd, setShowAdd] = useState(false);
  // Declare [editingVehicle, setEditingVehicle] for use by the surrounding module or function.
  const [editingVehicle, setEditingVehicle] = useState(null);
  // Declare [search, setSearch] for use by the surrounding module or function.
  const [search, setSearch] = useState("");
  // Declare [statusFilter, setStatusFilter] for use by the surrounding module or function.
  const [statusFilter, setStatusFilter] = useState("all");
  // Declare { data, isLoading, isError, error, isFetching, refetch } for use by the surrounding module or function.
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({ queryKey: ["vehicles"], queryFn: getVehicles, staleTime: 15000 });
  // Declare { data: driversData } for use by the surrounding module or function.
  const { data: driversData } = useQuery({ queryKey: ["admin-vehicle-drivers"], queryFn: getDrivers, staleTime: 30000 });
  // Declare vehicles for use by the surrounding module or function.
  const vehicles = Array.isArray(data?.data) ? data.data : Array.isArray(data?.vehicles) ? data.vehicles : [];
  // Declare drivers for use by the surrounding module or function.
  const drivers = Array.isArray(driversData?.data) ? driversData.data : Array.isArray(driversData?.drivers) ? driversData.drivers : [];

  // Declare removeMutation for use by the surrounding module or function.
  const removeMutation = useMutation({ mutationFn: deleteVehicle, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Vehicle removed successfully"); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to remove vehicle") });
  // Declare assignMutation for use by the surrounding module or function.
  const assignMutation = useMutation({ mutationFn: ({ vehicleId, driverId }) => assignDriver(vehicleId, driverId), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vehicles"] }); toast.success("Driver assigned successfully"); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to assign driver") });

  // Declare filteredVehicles for use by the surrounding module or function.
  const filteredVehicles = useMemo(() => {
    // Declare q for use by the surrounding module or function.
    const q = search.trim().toLowerCase();
    // Return the result of vehicles.filter() to the caller.
    return vehicles.filter((v) => {
      // Declare matchesSearch for use by the surrounding module or function.
      const matchesSearch = !q || [v.name, v.registrationNumber, v.registration, v.type, v.model, v.manufacturer, v.driver?.name].some((value) => String(value || "").toLowerCase().includes(q));
      // Declare matchesStatus for use by the surrounding module or function.
      const matchesStatus = statusFilter === "all" || String(v.status || "").toLowerCase() === statusFilter;
      // Return the expression shown below to the caller.
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  // Declare stats for use by the surrounding module or function.
  const stats = useMemo(() => ({
    total: vehicles.length,
    available: vehicles.filter((v) => String(v.status).toLowerCase() === "available").length,
    assigned: vehicles.filter((v) => String(v.status).toLowerCase() === "assigned").length,
    maintenance: vehicles.filter((v) => String(v.status).toLowerCase() === "maintenance").length,
  }), [vehicles]);

  // Declare handleAssign for use by the surrounding module or function.
  const handleAssign = (vehicleId) => {
    // Check the condition (!drivers.length) and run the matching branch.
    if (!drivers.length) return toast.info("No active drivers are available to assign.");
    // Declare vehicle for use by the surrounding module or function.
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    // Declare current for use by the surrounding module or function.
    const current = vehicle?.driver?._id || vehicle?.driver || "";
    // Declare name for use by the surrounding module or function.
    const name = window.prompt(`Enter driver name (available: ${drivers.map((d) => d.name).join(", ")})`, vehicle?.driver?.name || "");
    // Check the condition (!name?.trim()) and run the matching branch.
    if (!name?.trim()) return;
    // Declare driver for use by the surrounding module or function.
    const driver = drivers.find((d) => String(d.name || "").trim().toLowerCase() === name.trim().toLowerCase());
    // Check the condition (!driver) and run the matching branch.
    if (!driver) return toast.error("Driver not found. Use one of the names shown.");
    // Check the condition (String(driver._id) === String(current)) and run the matching branch.
    if (String(driver._id) === String(current)) return toast.info("This driver is already assigned.");
    // Perform the side effect or state update expressed on the following line.
    assignMutation.mutate({ vehicleId, driverId: driver._id });
  };

  // Declare handleRemove for use by the surrounding module or function.
  const handleRemove = (id) => {
    // Check the condition (window.confirm("Remove this vehicle from the active fleet? This is a s) and run the matching branch.
    if (window.confirm("Remove this vehicle from the active fleet? This is a soft delete.")) removeMutation.mutate(id);
  };

  // Check the condition (isLoading) and run the matching branch.
  if (isLoading) return <LoadingState />;
  // Check the condition (isError) and run the matching branch.
  if (isError) return <ErrorState message={error?.response?.data?.message || error?.message || "Unable to load vehicles."} retry={refetch} />;

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-green-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100 ring-1 ring-white/15"><Car size={14} /> Fleet management</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Vehicle Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-50/90 sm:text-base">Manage safari vehicles, registrations, capacity, drivers, availability and vehicle photography.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/20 hover:bg-white/15 disabled:opacity-50"><RefreshCw size={16} className={isFetching ? "animate-spin" : ""} /> Refresh</button>
              <button type="button" onClick={() => { setEditingVehicle(null); setShowAdd(true); }} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-emerald-800 shadow-sm hover:bg-emerald-50"><span className="text-lg leading-none">+</span> Add Vehicle</button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric title="Total vehicles" value={stats.total} icon={Car} />
          <Metric title="Available" value={stats.available} icon={CheckCircle2} />
          <Metric title="Assigned" value={stats.assigned} icon={Users} />
          <Metric title="Maintenance" value={stats.maintenance} icon={Wrench} />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicle, registration, type or driver..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" />{search && <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}</div>
            <div className="relative"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"><option value="all">All statuses</option><option value="available">Available</option><option value="assigned">Assigned</option><option value="maintenance">Maintenance</option><option value="out_of_service">Out of service</option></select><ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
          </div>
          <p className="mt-3 text-sm text-slate-500">Showing <span className="font-bold text-slate-800">{filteredVehicles.length}</span> of <span className="font-bold text-slate-800">{vehicles.length}</span> vehicles</p>
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead className="bg-slate-50"><tr className="border-b border-slate-200"><Header>Image</Header><Header>Vehicle</Header><Header>Registration</Header><Header>Type</Header><Header>Capacity</Header><Header>Driver</Header><Header>Status</Header><Header align="right">Actions</Header></tr></thead>
              <tbody>
                {filteredVehicles.map((vehicle) => <VehicleRow key={vehicle._id} vehicle={vehicle} onEdit={() => { setEditingVehicle(vehicle); setShowAdd(true); }} onAssign={() => handleAssign(vehicle._id)} onDelete={() => handleRemove(vehicle._id)} busy={removeMutation.isPending || assignMutation.isPending} />)}
                {!filteredVehicles.length && <tr><td colSpan="8" className="p-16 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Car size={26} /></div><h3 className="mt-4 font-black text-slate-900">No vehicles found</h3><p className="mt-1 text-sm text-slate-500">{search || statusFilter !== "all" ? "Try changing the search or status filter." : "Add your first fleet vehicle to get started."}</p></td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {showAdd && <AddVehicleModal vehicle={editingVehicle} close={() => { setShowAdd(false); setEditingVehicle(null); }} refresh={() => queryClient.invalidateQueries({ queryKey: ["vehicles"] })} />}
      </div>
    </div>
  );
}

// Define VehicleRow; its parameters and body implement this operation.
function VehicleRow({ vehicle, onEdit, onAssign, onDelete, busy }) {
  // Declare src for use by the surrounding module or function.
  const src = imageUrl(vehicle);
  // Declare tone for use by the surrounding module or function.
  const tone = statusTone(vehicle.status);
  // Declare statusClasses for use by the surrounding module or function.
  const statusClasses = tone === "blue" ? "bg-blue-50 text-blue-700 ring-blue-100" : tone === "amber" ? "bg-amber-50 text-amber-700 ring-amber-100" : tone === "red" ? "bg-red-50 text-red-700 ring-red-100" : tone;
  // Return the expression shown below to the caller.
  return <tr className="border-b border-slate-100 transition hover:bg-emerald-50/40 last:border-0">
    <td className="p-4"><div className="group relative h-20 w-28 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200">{src ? <img src={src} alt={`${vehicle.name || "Vehicle"} fleet image`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}<div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 text-slate-400 ${src ? "pointer-events-none" : ""}`}><ImageIcon size={23} /><span className="text-[10px] font-bold uppercase tracking-wide">No image</span></div></div></td>
    <td className="p-4"><div className="font-black text-slate-900">{vehicle.name || "Unnamed vehicle"}</div><div className="mt-1 text-xs font-medium text-slate-500">{vehicle.manufacturer || ""}{vehicle.manufacturer && vehicle.model ? " · " : ""}{vehicle.model || "Model not set"}</div></td>
    <td className="p-4 font-bold text-slate-800">{vehicle.registrationNumber || vehicle.registration || "—"}</td>
    <td className="p-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700">{statusLabel(vehicle.type || "vehicle")}</span></td>
    <td className="p-4 font-black text-slate-900">{Number.isFinite(Number(vehicle.capacity)) ? `${vehicle.capacity} pax` : "—"}</td>
    <td className="p-4"><div className="font-semibold text-slate-800">{vehicle.driver?.name || "No driver"}</div>{vehicle.driver?.phone && <div className="mt-0.5 text-xs text-slate-500">{vehicle.driver.phone}</div>}</td>
    <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${statusClasses}`}>{statusLabel(vehicle.status)}</span></td>
    <td className="p-4"><div className="flex justify-end gap-2"><button type="button" onClick={onEdit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"><Pencil size={14} /> Edit</button><button type="button" onClick={onAssign} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white hover:bg-emerald-800 disabled:opacity-50"><Users size={14} /> {vehicle.driver ? "Reassign" : "Assign"}</button><button type="button" onClick={onDelete} disabled={busy} aria-label={`Delete ${vehicle.name || "vehicle"}`} className="inline-flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 disabled:opacity-50"><Trash2 size={14} /></button></div></td>
  </tr>;
}

// Define Metric; its parameters and body implement this operation.
function Metric({ title, value, icon: Icon }) { return <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</p><p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value.toLocaleString("en-KE")}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Icon size={19} /></div></div></div>; }
// Define Header; its parameters and body implement this operation.
function Header({ children, align = "left" }) { return <th className={`${align === "right" ? "text-right" : "text-left"} whitespace-nowrap p-4 text-xs font-black uppercase tracking-wider text-slate-500`}>{children}</th>; }
// Define LoadingState; its parameters and body implement this operation.
function LoadingState() { return <div className="min-h-screen bg-slate-50 p-4 sm:p-6"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-36 rounded-3xl bg-slate-200" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="h-24 rounded-2xl bg-white" /><div className="h-24 rounded-2xl bg-white" /><div className="h-24 rounded-2xl bg-white" /><div className="h-24 rounded-2xl bg-white" /></div><div className="h-96 rounded-2xl bg-white" /></div></div>; }
// Define ErrorState; its parameters and body implement this operation.
function ErrorState({ message, retry }) { return <div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600"><X size={22} /></div><h2 className="mt-4 text-lg font-black text-slate-900">Unable to load vehicles</h2><p className="mt-2 text-sm text-slate-500">{message}</p><button type="button" onClick={() => retry()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white"><RefreshCw size={16} /> Retry</button></div></div>; }
