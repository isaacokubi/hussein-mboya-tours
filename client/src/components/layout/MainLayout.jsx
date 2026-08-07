import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "../common/ScrollToTop";

export default function MainLayout({ children }) {
  return (
    <>
      {/* Scroll page to top on route change */}
      <ScrollToTop />

      {/* Main Navigation */}
      <Navbar />

      {/* Main Content */}
      <main
        className="
        min-h-screen
        bg-gray-50
        pt-20
        "
      >
        {children}
      </main>

      {/* Website Footer */}
      <Footer />
    </>
  );
}