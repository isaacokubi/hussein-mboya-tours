import Dashboard from "./Dashboard";

/**
 * Canonical customer dashboard compatibility entry point.
 * Keep /customer-dashboard and /dashboard on the same implementation so
 * booking totals, payment rules and navigation cannot drift between pages.
 */
export default function CustomerDashboard() {
  return <Dashboard />;
}
