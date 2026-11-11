/**
 * Purpose: Admin Dashboard page-level UI component. Main declarations: AdminDashboard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import AdminDashboardView from "../../components/admin/dashboard/AdminDashboard";
// Load ../../components/admin/dashboard/ModuleCoverage so this module can use its exported dependencies.
import ModuleCoverage from "../../components/admin/dashboard/ModuleCoverage";

// Define AdminDashboard; its parameters and body implement this operation.
export default function AdminDashboard() {
  // Return the expression shown below to the caller.
  return <div className="space-y-6"><AdminDashboardView /><ModuleCoverage /></div>;
}
