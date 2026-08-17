import { useEffect, useState } from "react";
import { createVehicle, updateVehicle, getDrivers, assignDriver } from "../../api/vehicleApi";

export default function AddVehicleModal({ close, refresh, vehicle }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    registrationNumber: "",
    model: "",
    manufacturer: "",
    year: "",
    type: "SUV",
    capacity: "",
    driver: "",
    fuelType: "Diesel",
    transmission: "Manual",
    description: "",
    image: null,
  });

  useEffect(() => {
    getDrivers()
      .then((res) => setDrivers(res?.data || res?.drivers || []))
      .catch(() => setError("Failed to load drivers."));
  }, []);


  useEffect(() => {
    if (vehicle) {
      setForm({
        name: vehicle.name || "",
        registrationNumber: vehicle.registrationNumber || "",
        model: vehicle.model || "",
        manufacturer: vehicle.manufacturer || "",
        year: vehicle.year || "",
        type: vehicle.type || "SUV",
        capacity: vehicle.capacity || "",
        driver: vehicle.driver?._id || vehicle.driver || "",
        fuelType: vehicle.fuelType || "Diesel",
        transmission: vehicle.transmission || "Manual",
        description: vehicle.description || "",
        image: null,
      });
    }
  }, [vehicle]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const capacity = Number(form.capacity);
      const year = form.year === "" ? null : Number(form.year);

      if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
        setError("Passenger capacity must be a whole number greater than 0.");
        return;
      }

      if (year !== null && (!Number.isFinite(year) || year < 1990 || year > new Date().getFullYear() + 1)) {
        setError(`Vehicle year must be between 1990 and ${new Date().getFullYear() + 1}.`);
        return;
      }

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "driver" || key === "capacity" || key === "year" || value === null || value === "") return;
        data.append(key, value);
      });
      data.append("capacity", String(capacity));
      if (year !== null) data.append("year", String(year));

      const response = vehicle
        ? await updateVehicle(vehicle._id, data)
        : await createVehicle(data);
      const createdVehicle = response?.data || response?.vehicle;

      if (form.driver && createdVehicle?._id) {
        await assignDriver(createdVehicle._id, form.driver);
      }

      await refresh();
      close();
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Failed to create vehicle. Check the required fields and image format."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-2xl font-bold">{vehicle ? "Edit Vehicle" : "Add Vehicle"}</h2>
        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <input required name="name" value={form.name} placeholder="Vehicle name" onChange={handleChange} className="rounded-lg border p-3" />
          <input required name="registrationNumber" value={form.registrationNumber} placeholder="Registration number" onChange={handleChange} className="rounded-lg border p-3" />
          <input required name="model" value={form.model} placeholder="Model" onChange={handleChange} className="rounded-lg border p-3" />
          <input name="manufacturer" value={form.manufacturer} placeholder="Manufacturer" onChange={handleChange} className="rounded-lg border p-3" />
          <input type="number" name="year" value={form.year} placeholder="Year" onChange={handleChange} className="rounded-lg border p-3" />

          <select name="type" value={form.type} onChange={handleChange} className="rounded-lg border p-3">
            <option value="SUV">SUV</option>
            <option value="VAN">Van</option>
            <option value="BUS">Bus</option>
            <option value="LAND_CRUISER">Land Cruiser</option>
            <option value="MINIBUS">Minibus</option>
            <option value="SEDAN">Sedan</option>
            <option value="PICKUP">Pickup</option>
          </select>

          <input required type="number" min="1" name="capacity" value={form.capacity} placeholder="Passenger capacity" onChange={handleChange} className="rounded-lg border p-3" />

          <select name="fuelType" value={form.fuelType} onChange={handleChange} className="rounded-lg border p-3">
            <option>Diesel</option><option>Petrol</option><option>Hybrid</option><option>Electric</option>
          </select>

          <select name="transmission" value={form.transmission} onChange={handleChange} className="rounded-lg border p-3">
            <option>Manual</option><option>Automatic</option>
          </select>

          <select name="driver" value={form.driver} onChange={handleChange} className="rounded-lg border p-3">
            <option value="">Assign driver later</option>
            {drivers.map((driver) => <option key={driver._id} value={driver._id}>{driver.name}</option>)}
          </select>

          <label className="md:col-span-2">
            <span className="mb-2 block font-medium">Vehicle image</span>
            <input required={!vehicle} type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="w-full rounded-lg border p-3" />
          </label>

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Vehicle description / notes" rows={3} className="md:col-span-2 rounded-lg border p-3" />

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" onClick={close} disabled={loading} className="rounded-lg bg-gray-200 px-5 py-2">Cancel</button>
            <button disabled={loading} className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white disabled:opacity-50">
              {loading ? "Saving..." : vehicle ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
