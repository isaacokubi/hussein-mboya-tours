/**
 * Purpose: admin Agent Api client application module. Main declarations: clean, normalizeAgent, normalizeAgentPayload, getAgents, getAgentById.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "./axios";

// Declare clean for use by the surrounding module or function.
const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());

// Declare normalizeAgent for use by the surrounding module or function.
const normalizeAgent = (agent, companyName = "") => ({
  ...agent,
  companyName: clean(agent?.companyName) || clean(companyName),
  email: clean(agent?.email) || clean(agent?.user?.email),
  phone: clean(agent?.phone) || clean(agent?.user?.phone),
  location: clean(agent?.location),
  status: clean(agent?.status).toLowerCase() || "inactive",
  isApproved: agent?.isApproved === true,
  isActive: agent?.isApproved === true && clean(agent?.status).toLowerCase() === "active",
  totalBookings: Number(agent?.totalBookings || 0),
  totalCommission: Number(agent?.totalCommission || 0),
  pendingCommission: Number(agent?.pendingCommission || 0),
  paidCommission: Number(agent?.paidCommission || 0),
});

// Declare normalizeAgentPayload for use by the surrounding module or function.
const normalizeAgentPayload = (payload, companyName = "") => {
  // Declare data for use by the surrounding module or function.
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.agents)
        ? payload.agents
        : [];
  // Return the result of data.map() to the caller.
  return data.map((agent) => normalizeAgent(agent, companyName));
};

// Declare getAgents for use by the surrounding module or function.
export const getAgents = async () => {
  // Declare res for use by the surrounding module or function.
  const res = await axios.get("/admin/agents");
  // Return the result of normalizeAgentPayload() to the caller.
  return normalizeAgentPayload(res.data);
};

// Declare getAgentById for use by the surrounding module or function.
export const getAgentById = async (id) => {
  // Declare res for use by the surrounding module or function.
  const res = await axios.get(`/admin/agents/${id}`);
  // Declare agent for use by the surrounding module or function.
  const agent = res.data?.data || res.data || {};
  // Return the result of normalizeAgent() to the caller.
  return normalizeAgent(agent);
};

// Declare approveAgent for use by the surrounding module or function.
export const approveAgent = async (id) => {
  // Declare res for use by the surrounding module or function.
  const res = await axios.put(`/admin/agents/${id}/approve`);
  // Return the data value to the caller.
  return res.data;
};

// Declare updateAgentStatus for use by the surrounding module or function.
export const updateAgentStatus = async (id, status) => {
  // Declare normalizedStatus for use by the surrounding module or function.
  const normalizedStatus = clean(status).toLowerCase();
  // Check the condition (!["active", "inactive", "suspended"].includes(normalizedStatus)) and run the matching branch.
  if (!["active", "inactive", "suspended"].includes(normalizedStatus)) throw new Error("Invalid agent status.");
  // Declare res for use by the surrounding module or function.
  const res = await axios.put(`/admin/agents/${id}/status`, { status: normalizedStatus });
  // Return the data value to the caller.
  return res.data;
};
