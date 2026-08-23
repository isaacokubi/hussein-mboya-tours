import Navbar from "./Navbar";
import TenantFooter from "./TenantFooter";
import ScrollToTop from "../common/ScrollToTop";

export default function MainLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen bg-gray-50 pt-20">{children}</main>
      <TenantFooter />
    </>
  );
}
