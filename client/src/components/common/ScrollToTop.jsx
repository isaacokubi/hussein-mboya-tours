/**
 * Purpose: Scroll To Top reusable UI component. Main declarations: ScrollToTop.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect } from "react";
// Load react-router-dom so this module can use its exported dependencies.
import { useLocation } from "react-router-dom";

// Define ScrollToTop; its parameters and body implement this operation.
export default function ScrollToTop() {
  // Declare { pathname } for use by the surrounding module or function.
  const { pathname } = useLocation();

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Perform the side effect or state update expressed on the following line.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  // Return the expression shown below to the caller.
  return null;
}
