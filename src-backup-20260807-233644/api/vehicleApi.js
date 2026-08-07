import api from "./axios";


/*
|--------------------------------------------------------------------------
| VEHICLE MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL VEHICLES
// ============================================================

export const getVehicles = () => {
  return api.get("/vehicles");
};




// ============================================================
// GET SINGLE VEHICLE
// ============================================================

export const getVehicleById = (id) => {
  return api.get(`/vehicles/${id}`);
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

export const createVehicle = (data) => {
  return api.post(
    "/vehicles",
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};




// ============================================================
// UPDATE VEHICLE
// ============================================================

export const updateVehicle = (id, data) => {
  return api.put(
    `/vehicles/${id}`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};




// ============================================================
// DELETE VEHICLE
// ============================================================

export const deleteVehicle = (id) => {
  return api.delete(`/vehicles/${id}`);
};




/*
|--------------------------------------------------------------------------
| DRIVER MANAGEMENT
|--------------------------------------------------------------------------
*/


// ============================================================
// GET ALL DRIVERS
// ============================================================

export const getDrivers = () => {
  return api.get("/staff/drivers");
};




// ============================================================
// ASSIGN DRIVER TO VEHICLE
// ============================================================

export const assignDriver = (
  vehicleId,
  driverId
) => {
  return api.put(
    `/vehicles/${vehicleId}/assign-driver`,
    {
      driverId,
    }
  );
};




// ============================================================
// REMOVE DRIVER FROM VEHICLE
// ============================================================

export const removeDriver = (vehicleId) => {
  return api.put(
    `/vehicles/${vehicleId}/remove-driver`
  );
};




/*
|--------------------------------------------------------------------------
| VEHICLE STATUS
|--------------------------------------------------------------------------
*/


// ============================================================
// UPDATE VEHICLE STATUS
// ============================================================

export const updateVehicleStatus = (
  id,
  status
) => {
  return api.put(
    `/vehicles/${id}/status`,
    {
      status,
    }
  );
};