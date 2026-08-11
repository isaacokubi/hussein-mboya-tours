// client/src/services/tourManagerService.js

// Compatibility service layer.
// The actual Tour Manager API implementation lives in:
// client/src/api/tourManagerApi.js

export {
  getDashboardStats,
  getTours,
  createTour,
  updateTour,
  deleteTour,
  assignGuide,
  createItinerary,
  getItineraries,
  getBookings,
  getCustomers,
  getGuides,
  getReports,
} from "../api/tourManagerApi";

// Compatibility exports added by final_repair.py
export { assignDriver } from "../api/tourManagerApi";
export { assignVehicle } from "../api/tourManagerApi";
export { getDrivers } from "../api/tourManagerApi";
export { getVehicles } from "../api/tourManagerApi";
