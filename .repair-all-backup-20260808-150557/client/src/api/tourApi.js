import api from "./axios";

/*
|--------------------------------------------------------------------------
| PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async (category = null) => {
  const { data } = await api.get("/tours", {
    params: category ? { category } : {},
  });

  return data;
};

export const getFeaturedTours = async () => {
  const { data } = await api.get("/tours/featured");

  console.log("FEATURED API RAW RESPONSE:", data);

  return data?.data || [];
};

/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/

export const getTourById = async (id) => {
  const { data } = await api.get(`/tours/${id}`);

  return data?.data || data;
};

export const getTour = async (id) => {
  const { data } = await api.get(`/tours/${id}`);

  return data?.data || data;
};

/*
|--------------------------------------------------------------------------
| TOUR MANAGER
|--------------------------------------------------------------------------
*/

export const getManagerTours = async (params = {}) => {
  const { data } = await api.get("/tours", {
    params,
  });

  return data;
};

/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (payload) => {
  const { data } = await api.post("/tours", payload);

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const updateTour = async (id, payload) => {
  const { data } = await api.put(
    `/tour-manager/tours/${id}`,
    payload
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/tour-manager/tours/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| STAFF
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Assignment uses Staff.js on the backend.
|
| Therefore guides/drivers used for tour assignment should come
| from /staff/guides and /staff/drivers rather than /users/guides.
|--------------------------------------------------------------------------
*/

export const getGuides = async () => {
  const { data } = await api.get("/staff/guides");

  return Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.guides)
      ? data.guides
      : Array.isArray(data)
        ? data
        : [];
};

export const getDrivers = async () => {
  const { data } = await api.get("/staff/drivers");

  return Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.drivers)
      ? data.drivers
      : Array.isArray(data)
        ? data
        : [];
};

/*
|--------------------------------------------------------------------------
| CANONICAL TOUR RESOURCE ASSIGNMENT
|--------------------------------------------------------------------------
|
| PUT /api/tour-assignments/:id/assign
|
| Supported fields:
| - guideId
| - driverId
| - vehicleId
|
| Undefined field = keep existing assignment
| null / ""         = remove assignment
|--------------------------------------------------------------------------
*/

export const assignTourResources = async (
  tourId,
  assignmentData
) => {
  const { data } = await api.put(
    `/tour-assignments/${tourId}/assign`,
    assignmentData
  );

  return data;
};

export const assignGuide = async (
  tourId,
  guideId
) => {
  return assignTourResources(tourId, {
    guideId,
  });
};

export const assignDriver = async (
  tourId,
  driverId
) => {
  return assignTourResources(tourId, {
    driverId,
  });
};

export const assignVehicle = async (
  tourId,
  vehicleId
) => {
  return assignTourResources(tourId, {
    vehicleId,
  });
};

/*
|--------------------------------------------------------------------------
| VEHICLES
|--------------------------------------------------------------------------
*/

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");

  console.log(
    "FULL VEHICLES RESPONSE:",
    JSON.stringify(data, null, 2)
  );

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.vehicles)
      ? data.vehicles
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.vehicles)
          ? data.data.vehicles
          : [];
};

/*
|--------------------------------------------------------------------------
| DESTINATIONS
|--------------------------------------------------------------------------
*/

export const getDestinations = async () => {
  const { data } = await api.get("/destinations");

  return data;
};

/*
|--------------------------------------------------------------------------
| TOUR AVAILABILITY
|--------------------------------------------------------------------------
*/

export const getTourAvailability = async (id) => {
  const { data } = await api.get(
    `/tour-manager/tours/${id}/availability`
  );

  return data;
};

export const updateTourAvailability = async (
  id,
  payload
) => {
  const { data } = await api.put(
    `/tour-manager/tours/${id}/availability`,
    payload
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

export const getTourReports = async (params = {}) => {
  const { data } = await api.get(
    "/tour-manager/reports",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GET TOUR BY SLUG
|--------------------------------------------------------------------------
*/

export const getTourBySlug = async (slug) => {
  const { data } = await api.get(
    `/tours/slug/${slug}`
  );

  return data?.data || data;
};
