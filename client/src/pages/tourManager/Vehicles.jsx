import { useState } from "react";
import { FaCar, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import useVehicles from "../../hooks/useVehicles";
import AddVehicleModal from "../../components/admin/AddVehicleModal";
import { deleteVehicle } from "../../api/vehicleApi";

export default function Vehicles() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const { vehicles = [], isLoading, refetch } = useVehicles();

  const removeVehicle = async (id) => {
    if (!window.confirm("Remove this vehicle?")) return;
    try {
      await deleteVehicle(id);
      toast.success("Vehicle removed");
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const visibleVehicles = vehicles.filter((vehicle) => !vehicle.isDeleted);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vehicles Management</h1>
          <p className="text-gray-500">Manage tour transport vehicles</p>
        </div>
        <button type="button" onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-white">
          <FaPlus /> Add Vehicle
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        {isLoading ? (
          <p>Loading vehicles...</p>
        ) : visibleVehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles available</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {visibleVehicles.map((vehicle) => (
              <div key={vehicle._id} className="rounded-xl border bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <FaCar className="text-2xl text-orange-600" />
                  <h2 className="text-lg font-bold">{vehicle.name}</h2>
                </div>
                <p>Registration: <span className="ml-1 font-semibold">{vehicle.registrationNumber || "N/A"}</span></p>
                <p>Type: <span className="ml-1 font-semibold">{vehicle.type || "N/A"}</span></p>
                <p>Capacity: <span className="ml-1 font-semibold">{vehicle.capacity || 0}</span></p>
                <p>Driver: <span className="ml-1 font-semibold">{vehicle.driver?.name || "No driver"}</span></p>
                <span className="mt-3 inline-block rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">{vehicle.status || "Available"}</span>
                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => setEditingVehicle(vehicle)} className="text-blue-600" aria-label={`Edit ${vehicle.name}`}><FaEdit /></button>
                  <button type="button" onClick={() => removeVehicle(vehicle._id)} className="text-red-600" aria-label={`Delete ${vehicle.name}`}><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddVehicleModal close={() => setShowAdd(false)} refresh={refetch} />}
      {editingVehicle && <AddVehicleModal key={editingVehicle._id} vehicle={editingVehicle} close={() => setEditingVehicle(null)} refresh={refetch} />}
    </div>
  );
}
