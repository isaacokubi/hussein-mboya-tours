import api from "./axios";


/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL VEHICLES
// ============================================================

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");
  return data;
};




// ============================================================
// GET SINGLE VEHICLE
// ============================================================

export const getVehicleById = async (id) => {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
};




// ============================================================
// CREATE VEHICLE
// ============================================================
//
// Sends:
// - vehicle details
// - image file
//
// Backend:
// upload.single("image")
//
// ============================================================

export const createVehicle = async (data) => {
  const response = await api.post(
    "/vehicles",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};




// ============================================================
// UPDATE VEHICLE
// ============================================================

export const updateVehicle = async (id, data) => {
  const response = await api.put(
    `/vehicles/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};




// ============================================================
// DELETE VEHICLE
// ============================================================

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
};




/*
|--------------------------------------------------------------------------
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL DRIVERS
// ============================================================

export const getDrivers = async () => {
  const { data } = await api.get("/staff/drivers");
  return data;
};




// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================

export const assignDriver = async (
  vehicleId,
  driverId
) => {
  const { data } = await api.put(
    `/vehicles/${vehicleId}/assign-driver`,
    {
      driverId,
      driver: driverId,
    }
  );
  return data;
};




// ============================================================
// REMOVE DRIVER FROM VEHICLE
// ============================================================

export const removeDriver = async (vehicleId) => {
  const { data } = await api.put(
    `/vehicles/${vehicleId}/remove-driver`
  );
  return data;
};




/*
|--------------------------------------------------------------------------
| VEHICLE STATUS
|--------------------------------------------------------------------------
*/


// ============================================================
// UPDATE VEHICLE STATUS
// ============================================================

export const updateVehicleStatus = async (
  id,
  status
) => {
  const { data } = await api.put(
    `/vehicles/${id}/status`,
    { status }
  );
  return data;
};
