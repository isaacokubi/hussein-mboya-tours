/**
 * Purpose: Main Layout reusable UI component. Main declarations: MainLayout.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Navbar from "./Navbar";
// Load ./TenantFooter so this module can use its exported dependencies.
import TenantFooter from "./TenantFooter";
// Load ../common/ScrollToTop so this module can use its exported dependencies.
import ScrollToTop from "../common/ScrollToTop";

// Define MainLayout; its parameters and body implement this operation.
export default function MainLayout({ children }) {
  // Return the expression shown below to the caller.
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">{children}</main>
      <TenantFooter />
    </>
  );
}
