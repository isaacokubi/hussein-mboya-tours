import axios from "./axios";

const clean = (value) => (value === null || value === undefined ? "" : String(value).trim());

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

const normalizeAgentPayload = (payload, companyName = "") => {
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.agents)
        ? payload.agents
        : [];
  return data.map((agent) => normalizeAgent(agent, companyName));
};

export const getAgents = async () => {
  const res = await axios.get("/admin/agents");
  return normalizeAgentPayload(res.data);
};

export const getAgentById = async (id) => {
  const res = await axios.get(`/admin/agents/${id}`);
  const agent = res.data?.data || res.data || {};
  return normalizeAgent(agent);
};

export const approveAgent = async (id) => {
  const res = await axios.put(`/admin/agents/${id}/approve`);
  return res.data;
};

export const updateAgentStatus = async (id, status) => {
  const normalizedStatus = clean(status).toLowerCase();
  if (!["active", "inactive", "suspended"].includes(normalizedStatus)) throw new Error("Invalid agent status.");
  const res = await axios.put(`/admin/agents/${id}/status`, { status: normalizedStatus });
  return res.data;
};
