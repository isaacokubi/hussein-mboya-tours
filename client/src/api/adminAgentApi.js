import axios from "./axios";

const normalizeAgentPayload = (payload, companyName = "") => {
  const data = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.agents)
        ? payload.agents
        : [];
  return data.map((agent) => ({
    ...agent,
    companyName: String(agent?.companyName || "").trim() || companyName,
  }));
};

export const getAgents = async () => {
  const [res, branding] = await Promise.all([
    axios.get("/admin/agents"),
    axios.get("/settings/public", { params: { _t: Date.now() } }).catch(() => null),
  ]);
  const settings = branding?.data?.settings || branding?.data?.data || {};
  const companyName = String(settings.companyName || settings.name || "").trim();
  return normalizeAgentPayload(res.data, companyName);
};

export const getAgentById = async (id) => {
  const [res, branding] = await Promise.all([
    axios.get(`/admin/agents/${id}`),
    axios.get("/settings/public", { params: { _t: Date.now() } }).catch(() => null),
  ]);
  const settings = branding?.data?.settings || branding?.data?.data || {};
  const companyName = String(settings.companyName || settings.name || "").trim();
  const agent = res.data?.data || {};
  return {
    ...agent,
    companyName: String(agent.companyName || "").trim() || companyName,
  };
};

export const approveAgent = async (id) => {
  const res = await axios.put(`/admin/agents/${id}/approve`);
  return res.data;
};

export const updateAgentStatus = async (id, status) => {
  const res = await axios.put(`/admin/agents/${id}/status`, { status });
  return res.data;
};
