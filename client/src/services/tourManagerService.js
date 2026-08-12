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

// Compatibility exports.
// These resource functions are implemented by tourApi.js.
export {
  assignDriver,
  assignVehicle,
  getDrivers,
  getVehicles,
} from "../api/tourApi";
