/**
 * Purpose: tour Manager Service business-logic service. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// client/src/services/tourManagerService.js

// Compatibility service layer.
// The actual Tour Manager API implementation lives in:
// client/src/api/tourManagerApi.js

// Expose the selected declarations or re-exported members to other parts of the application.
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
// Expose the selected declarations or re-exported members to other parts of the application.
export {
  assignDriver,
  assignVehicle,
  getDrivers,
  getVehicles,
} from "../api/tourApi";
