import api from "./api";

const LeadService = {

  // GET all leads
  getAllLeads: async () => {
    const res = await api.get("/leads");
    return res.data;
  },

  // GET single lead by ID
  getLeadById: async (id) => {
    const res = await api.get(`/leads/${id}`);
    return res.data;
  },

  // POST create a new lead
  createLead: async (leadData) => {
    const res = await api.post("/leads", leadData);
    return res.data;
  },

  // PUT update an existing lead
  updateLead: async (id, leadData) => {
    const res = await api.put(`/leads/${id}`, leadData);
    return res.data;
  },

  // DELETE a lead
  deleteLead: async (id) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },

  // POST assign lead to agent
  assignLead: async (leadId, agentId) => {
    const res = await api.post("/leads/assign", { leadId, agentId });
    return res.data;
  },

  // GET leads by agent ID
  getLeadsByAgent: async (agentId) => {
    const res = await api.get(`/leads/agent/${agentId}`);
    return res.data;
  },

  // GET leads by manager ID
  getLeadsByManager: async (managerId) => {
    const res = await api.get(`/leads/manager/${managerId}`);
    return res.data;
  },
};

export default LeadService;