// client/src/config/permissions.js


export const PERMISSION_GROUPS = {

  Tours: [
    "create_tours",
    "update_tours",
    "delete_tours",
    "manage_tours",
  ],


  Bookings: [
    "manage_bookings",
    "view_bookings",
  ],


  Customers: [
    "view_customers",
    "manage_customers",
  ],


  Guides: [
    "assign_guides",
    "view_assigned_tours",
  ],


  Finance: [
    "view_finance",
    "manage_payments",
    "manage_invoices",
  ],


  Reports: [
    "view_reports",
  ],


  Users: [
    "manage_users",
  ],

};