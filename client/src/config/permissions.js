// Canonical application RBAC permission names.
// These names must match Permission documents created by the server and checked by permission middleware.

// Group permissions by the application module where administrators manage them.
export const PERMISSION_GROUPS = {
  // Permission needed to open the administrator dashboard.
  Dashboard: [
    "admin.dashboard", // Access the admin dashboard.
  ],

  // Permissions used to view and manage tours.
  Tours: [
    "tour.view", // View tour records.
    "tour.create", // Create a new tour.
    "tour.update", // Edit an existing tour.
    "tour.manage", // Perform general tour management.
    "tour.assign", // Assign tours to staff.
    "tour.availability", // Manage tour availability.
  ],

  // Permissions used by booking workflows.
  Bookings: [
    "booking.view", // View booking records.
    "booking.create", // Create bookings.
    "booking.update", // Edit bookings.
    "booking.manage", // Perform general booking management.
    "booking.cancel", // Cancel bookings.
  ],

  // Permissions for staff and operational resources.
  Staff: [
    "staff.manage", // Manage staff accounts.
    "guide.view", // View guide information.
    "vehicle.view", // View vehicle information.
  ],

  // Permissions for payments, refunds and finance visibility.
  Finance: [
    "finance.view", // View finance information.
    "payment.manage", // Manage payment records/workflows.
    "refund.manage", // Manage refund workflows.
  ],

  // Permissions for analytics and reporting.
  Reports: [
    "report.view", // View reports.
    "analytics.view", // View analytics dashboards.
  ],

  // Permissions for user administration.
  Users: [
    "user.manage", // Manage user accounts.
  ],

  // Permissions for customer management.
  Customers: [
    "customer.view", // View customer records.
    "manage_customers", // Create/update customer information.
  ],

  // Permission for destination administration.
  Destinations: [
    "manage_destinations", // Create and manage destinations.
  ],

  // Permission for review moderation/management.
  Reviews: [
    "review.manage", // Manage submitted reviews.
  ],

  // Permission for audit and system oversight.
  System: [
    "system.audit", // View or perform authorized system audits.
  ],

  // Permissions for role setup and core settings.
  Administration: [
    "roles.manage", // Create and manage roles.
    "settings.manage", // Change application settings.
    "notifications.view", // View application notifications.
  ],

  // Permissions for agents and commission visibility.
  Agents: [
    "commission.view", // View commission records.
  ],

  // Permissions available to guides for assigned tours and reporting.
  Guides: [
    "view_assigned_tours", // View tours assigned to the guide.
    "view_tour_guests", // View guests on assigned tours.
    "update_tour_status", // Update tour progress/status.
    "submit_tour_report", // Submit a report after a tour.
  ],
};

// Flatten the grouped permission arrays into one list for lookup and validation.
export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();
