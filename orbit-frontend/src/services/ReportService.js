import api from "./api";

const getReports = async () => {
  const res = await api.get("/reports");
  return res.data;
};

const getAgentReport = async (agentId) => {
  const res = await api.get(`/reports/agent/${agentId}`);
  return res.data;
};

const reportService = {
  getReports,
  getAgentReport,
  getLeadsByStatus: async () => {
    const res = await api.get("/reports/status");
    return res.data;
  },
};

export default reportService;