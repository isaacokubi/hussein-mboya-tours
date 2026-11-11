/**
 * Purpose: vehicle Api client application module. Main declarations: getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";


/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL VEHICLES
// ============================================================

// Declare getVehicles for use by the surrounding module or function.
export const getVehicles = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/vehicles");
  // Return the value of data to the caller.
  return data;
};




// ============================================================
// GET SINGLE VEHICLE
// ============================================================

// Declare getVehicleById for use by the surrounding module or function.
export const getVehicleById = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get(`/vehicles/${id}`);
  // Return the value of data to the caller.
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

// Declare createVehicle for use by the surrounding module or function.
export const createVehicle = async (data) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.post(
    "/vehicles",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  // Return the data value to the caller.
  return response.data;
};




// ============================================================
// UPDATE VEHICLE
// ============================================================

// Declare updateVehicle for use by the surrounding module or function.
export const updateVehicle = async (id, data) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.put(
    `/vehicles/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  // Return the data value to the caller.
  return response.data;
};




// ============================================================
// DELETE VEHICLE
// ============================================================

// Declare deleteVehicle for use by the surrounding module or function.
export const deleteVehicle = async (id) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.delete(`/vehicles/${id}`);
  // Return the value of data to the caller.
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

// Declare getDrivers for use by the surrounding module or function.
export const getDrivers = async () => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.get("/staff/drivers");
  // Return the value of data to the caller.
  return data;
};




// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================

// Declare assignDriver for use by the surrounding module or function.
export const assignDriver = async (
  vehicleId,
  driverId
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/vehicles/${vehicleId}/assign-driver`,
    {
      driverId,
      driver: driverId,
    }
  );
  // Return the value of data to the caller.
  return data;
};




// ============================================================
// REMOVE DRIVER FROM VEHICLE
// ============================================================

// Declare removeDriver for use by the surrounding module or function.
export const removeDriver = async (vehicleId) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/vehicles/${vehicleId}/remove-driver`
  );
  // Return the value of data to the caller.
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

// Declare updateVehicleStatus for use by the surrounding module or function.
export const updateVehicleStatus = async (
  id,
  status
) => {
  // Declare { data } for use by the surrounding module or function.
  const { data } = await api.put(
    `/vehicles/${id}/status`,
    { status }
  );
  // Return the value of data to the caller.
  return data;
};
