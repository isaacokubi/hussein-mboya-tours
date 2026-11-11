/**
 * Purpose: public Package Api client application module. Main declarations: getPublicPackages.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

// Define getPublicPackages; its parameters and body implement this operation.
export async function getPublicPackages() {
  // Declare response for use by the surrounding module or function.
  const response = await api.get("/packages");
  // Return the expression shown below to the caller.
  return Array.isArray(response.data?.packages) ? response.data.packages : [];
}
