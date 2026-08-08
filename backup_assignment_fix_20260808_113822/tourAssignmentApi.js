// client/src/api/tourAssignmentApi.js

import api from "./axios";

// ============================================================
// GET TOURS
// ============================================================

export const getTours = async (params = {}) => {
  const { data } = await api.get("/tours", {
    params,
  });

  return Array.isArray(data?.tours)
    ? data.tours
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
};

// ============================================================
// GET GUIDES
// Backend: GET /api/staff/guides
// ============================================================

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

// ============================================================
// GET DRIVERS
// Backend: GET /api/staff/drivers
// ============================================================

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

// ============================================================
// GET VEHICLES
// ============================================================

export const getVehicles = async () => {
  const { data } = await api.get("/vehicles");

  return Array.isArray(data?.vehicles)
    ? data.vehicles
    : Array.isArray(data?.data?.vehicles)
    ? data.data.vehicles
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
};

// ============================================================
// ASSIGN TOUR
// ============================================================

export const assignTour = async (tourId, assignmentData) => {
  const { data } = await api.put(
    `/tour-assignments/${tourId}/assign`,
    assignmentData
  );

  return data;
};
