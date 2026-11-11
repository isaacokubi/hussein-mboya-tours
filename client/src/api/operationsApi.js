/**
 * Purpose: operations Api client application module. Main declarations: getOperationsOverview.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";
// Declare getOperationsOverview for use by the surrounding module or function.
export const getOperationsOverview = async () => (await api.get("/admin/operations")).data;
