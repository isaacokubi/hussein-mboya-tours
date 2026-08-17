// client/src/config/permissions.js
//
// Canonical application RBAC permission names.
// These names must match the Permission documents created by
// server/controllers/adminRoleController.js and consumed by
// server/middleware/permissionMiddleware.js.

export const PERMISSION_GROUPS = {
  Dashboard: [
    "admin.dashboard",
  ],

  Tours: [
    "tour.view",
    "tour.create",
    "tour.update",
    "tour.manage",
    "tour.assign",
    "tour.availability",
  ],

  Bookings: [
    "booking.view",
    "booking.create",
    "booking.update",
    "booking.manage",
    "booking.cancel",
  ],

  Staff: [
    "staff.manage",
    "guide.view",
    "vehicle.view",
  ],

  Finance: [
    "finance.view",
    "payment.manage",
    "refund.manage",
  ],

  Reports: [
    "report.view",
    "analytics.view",
  ],

  Users: [
    "user.manage",
  ],

    Customers: [
      "customer.view",
      "manage_customers",
    ],

    Destinations: [
      "manage_destinations",
    ],

    Reviews: [
      "review.manage",
    ],

    System: [
      "system.audit",
    ],


    Administration: [
    "roles.manage",
    "settings.manage",
    "notifications.view",
  ],

  Agents: [
    "commission.view",
  ],

  Guides: [
    "view_assigned_tours",
    "view_tour_guests",
    "update_tour_status",
    "submit_tour_report",
  ],
};

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();
