// client/src/services/tourManagerService.js

import api from "./axios";

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

// ============================================================
// GET DASHBOARD STATS
// ============================================================

export const getDashboardStats = async () => {
  const { data } = await api.get(
    "/tourmanager/dashboard"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/

// ============================================================
// GET TOURS
// ============================================================

export const getTours = async (params = {}) => {
  const { data } = await api.get(
    "/tourmanager/tours",
    {
      params,
    }
  );

  return data;
};

// ============================================================
// CREATE TOUR
// ============================================================

export const createTour = async (tourData) => {
  const { data } = await api.post(
    "/tourmanager/tours",
    tourData
  );

  return data;
};

// ============================================================
// UPDATE TOUR
// ============================================================

export const updateTour = async (
  id,
  tourData
) => {
  const { data } = await api.put(
    `/tourmanager/tours/${id}`,
    tourData
  );

  return data;
};

// ============================================================
// DELETE TOUR
// ============================================================

export const deleteTour = async (id) => {
  const { data } = await api.delete(
    `/tourmanager/tours/${id}`
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GUIDE ASSIGNMENT
|--------------------------------------------------------------------------
*/

// ============================================================
// ASSIGN GUIDE
// ============================================================

export const assignGuide = async (
  assignmentData
) => {
  const { data } = await api.put(
    "/tourmanager/assign-guide",
    assignmentData
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| ITINERARIES
|--------------------------------------------------------------------------
*/

// ============================================================
// CREATE ITINERARY
// ============================================================

export const createItinerary = async (
  itineraryData
) => {
  const { data } = await api.post(
    "/tourmanager/itineraries",
    itineraryData
  );

  return data;
};

// ============================================================
// GET ITINERARIES
// ============================================================

export const getItineraries = async () => {
  const { data } = await api.get(
    "/tourmanager/itineraries"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

// ============================================================
// GET BOOKINGS
// ============================================================

export const getBookings = async (params = {}) => {
  const { data } = await api.get(
    "/tourmanager/bookings",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| CUSTOMERS
|--------------------------------------------------------------------------
*/

// ============================================================
// GET CUSTOMERS
// ============================================================

export const getCustomers = async (params = {}) => {
  const { data } = await api.get(
    "/tourmanager/customers",
    {
      params,
    }
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| GUIDES
|--------------------------------------------------------------------------
*/

// ============================================================
// GET GUIDES
// ============================================================

export const getGuides = async () => {
  const { data } = await api.get(
    "/tourmanager/guides"
  );

  return data;
};

/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

// ============================================================
// GET REPORTS
// ============================================================

export const getReports = async (params = {}) => {
  const { data } = await api.get(
    "/tourmanager/reports",
    {
      params,
    }
  );

  return data;
};