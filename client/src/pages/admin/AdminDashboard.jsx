import AdminDashboardView from "../../components/admin/dashboard/AdminDashboard";
import ModuleCoverage from "../../components/admin/dashboard/ModuleCoverage";

export default function AdminDashboard() {
  return <div className="space-y-6"><AdminDashboardView /><ModuleCoverage /></div>;
}
