/**
 * Purpose: Add Vehicle Modal reusable UI component. Main declarations: existingImage, AddVehicleModal, handleChange, submit, Field.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load ../../api/vehicleApi so this module can use its exported dependencies.
import { createVehicle, updateVehicle, getDrivers, assignDriver } from "../../api/vehicleApi";
// Load lucide-react so this module can use its exported dependencies.
import { ImagePlus, X } from "lucide-react";

// Declare existingImage for use by the surrounding module or function.
const existingImage = (vehicle) => vehicle?.image?.url || vehicle?.image?.secure_url || (typeof vehicle?.image === "string" ? vehicle.image : "");

// Define AddVehicleModal; its parameters and body implement this operation.
export default function AddVehicleModal({ close, refresh, vehicle }) {
  // Declare [drivers, setDrivers] for use by the surrounding module or function.
  const [drivers, setDrivers] = useState([]);
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);
  // Declare [error, setError] for use by the surrounding module or function.
  const [error, setError] = useState("");
  // Declare [preview, setPreview] for use by the surrounding module or function.
  const [preview, setPreview] = useState("");
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState({ name: "", registrationNumber: "", model: "", manufacturer: "", year: "", type: "SUV", capacity: "", driver: "", fuelType: "Diesel", transmission: "Manual", description: "", image: null });

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Perform the side effect or state update expressed on the following line.
    getDrivers().then((res) => setDrivers(res?.data || res?.drivers || [])).catch(() => setError("Failed to load drivers."));
  }, []);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!vehicle) and run the matching branch.
    if (!vehicle) return;
    // Perform the side effect or state update expressed on the following line.
    setForm({ name: vehicle.name || "", registrationNumber: vehicle.registrationNumber || vehicle.registration || "", model: vehicle.model || "", manufacturer: vehicle.manufacturer || "", year: vehicle.year || "", type: vehicle.type || "SUV", capacity: vehicle.capacity || "", driver: vehicle.driver?._id || vehicle.driver || "", fuelType: vehicle.fuelType || "Diesel", transmission: vehicle.transmission || "Manual", description: vehicle.description || "", image: null });
    // Perform the side effect or state update expressed on the following line.
    setPreview(existingImage(vehicle));
  }, [vehicle]);

  // Declare handleChange for use by the surrounding module or function.
  const handleChange = (event) => {
    // Declare { name, value, files } for use by the surrounding module or function.
    const { name, value, files } = event.target;
    // Check the condition (name === "image") and run the matching branch.
    if (name === "image") {
      // Declare file for use by the surrounding module or function.
      const file = files?.[0] || null;
      // Perform the side effect or state update expressed on the following line.
      setForm((current) => ({ ...current, image: file }));
      // Check the condition (preview?.startsWith("blob:")) and run the matching branch.
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      // Perform the side effect or state update expressed on the following line.
      setPreview(file ? URL.createObjectURL(file) : existingImage(vehicle));
      // Return the result to the caller.
      return;
    }
    // Perform the side effect or state update expressed on the following line.
    setForm((current) => ({ ...current, [name]: value }));
  };

  // Declare submit for use by the surrounding module or function.
  const submit = async (event) => {
    // Perform the side effect or state update expressed on the following line.
    event.preventDefault();
    // Perform the side effect or state update expressed on the following line.
    setLoading(true); setError("");
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare capacity for use by the surrounding module or function.
      const capacity = Number(form.capacity);
      // Declare year for use by the surrounding module or function.
      const year = form.year === "" ? null : Number(form.year);
      // Check the condition (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capaci) and run the matching branch.
      if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) throw new Error("Passenger capacity must be a whole number greater than 0.");
      // Check the condition (year !== null && (!Number.isFinite(year) || year < 1990 || year > new ) and run the matching branch.
      if (year !== null && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) throw new Error(`Vehicle year must be between 1990 and ${new Date().getFullYear() + 1}.`);
      // Declare data for use by the surrounding module or function.
      const data = new FormData();
      // Perform the side effect or state update expressed on the following line.
      Object.entries(form).forEach(([key, value]) => { if (key === "driver" || key === "capacity" || key === "year" || value === null || value === "") return; data.append(key, value); });
      // Perform the side effect or state update expressed on the following line.
      data.append("capacity", String(capacity));
      // Check the condition (year !== null) and run the matching branch.
      if (year !== null) data.append("year", String(year));
      // Declare response for use by the surrounding module or function.
      const response = vehicle ? await updateVehicle(vehicle._id, data) : await createVehicle(data);
      // Declare saved for use by the surrounding module or function.
      const saved = response?.data || response?.vehicle;
      // Check the condition (form.driver && saved?._id && String(form.driver) !== String(vehicle?.d) and run the matching branch.
      if (form.driver && saved?._id && String(form.driver) !== String(vehicle?.driver?._id || vehicle?.driver || "")) await assignDriver(saved._id, form.driver);
      // Perform the side effect or state update expressed on the following line.
      await refresh(); close();
    } catch (requestError) {
      // Perform the side effect or state update expressed on the following line.
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to save vehicle. Check the required fields and image format.");
    } finally { setLoading(false); }
  };

  // Return the expression shown below to the caller.
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-black/10">
      <div className="flex items-center justify-between border-b border-slate-200 p-6"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Fleet management</p><h2 className="mt-1 text-2xl font-black text-slate-900">{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h2></div><button type="button" onClick={close} disabled={loading} aria-label="Close vehicle form" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button></div>
      <div className="p-6">{error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field required name="name" value={form.name} placeholder="Vehicle name" onChange={handleChange} />
          <Field required name="registrationNumber" value={form.registrationNumber} placeholder="Registration number" onChange={handleChange} />
          <Field required name="model" value={form.model} placeholder="Model" onChange={handleChange} />
          <Field name="manufacturer" value={form.manufacturer} placeholder="Manufacturer" onChange={handleChange} />
          <Field type="number" name="year" value={form.year} placeholder="Year" onChange={handleChange} />
          <Select name="type" value={form.type} onChange={handleChange}><option value="SUV">SUV</option><option value="VAN">Van</option><option value="BUS">Bus</option><option value="LAND_CRUISER">Land Cruiser</option><option value="MINIBUS">Minibus</option><option value="SEDAN">Sedan</option><option value="PICKUP">Pickup</option></Select>
          <Field required type="number" min="1" name="capacity" value={form.capacity} placeholder="Passenger capacity" onChange={handleChange} />
          <Select name="fuelType" value={form.fuelType} onChange={handleChange}><option>Diesel</option><option>Petrol</option><option>Hybrid</option><option>Electric</option></Select>
          <Select name="transmission" value={form.transmission} onChange={handleChange}><option>Manual</option><option>Automatic</option></Select>
          <Select name="driver" value={form.driver} onChange={handleChange}><option value="">Assign driver later</option>{drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.name}</option>)}</Select>

          <label className="md:col-span-2"><span className="mb-2 block text-sm font-black text-slate-800">Vehicle image</span><div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200">{preview ? <img src={preview} alt="Vehicle preview" className="h-full w-full object-cover" onError={() => setPreview("")} /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImagePlus size={28} /><span className="text-xs font-bold">No image selected</span></div>}</div><div><input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={!vehicle} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:font-bold file:text-white" /><p className="mt-2 text-xs text-slate-500">Upload a clear JPEG, PNG or WebP photo. {vehicle ? "Leave empty to keep the current image." : "An image is required."}</p></div></div></label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Vehicle description / notes" rows={3} className="md:col-span-2 rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
          <div className="md:col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={close} disabled={loading} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button><button disabled={loading} className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50">{loading ? "Saving…" : vehicle ? "Update Vehicle" : "Save Vehicle"}</button></div>
        </form>
      </div>
    </div>
  </div>;
}

// Define Field; its parameters and body implement this operation.
function Field({ className = "", ...props }) { return <input {...props} className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`} />; }
// Define Select; its parameters and body implement this operation.
function Select({ children, ...props }) { return <select {...props} className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">{children}</select>; }
