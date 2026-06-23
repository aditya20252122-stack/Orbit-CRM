import api from "./api";

const FollowUpService = {
  // Add Follow-up
  addFollowUp: async (leadId, followUpData) => {
    const res = await api.post(`/followups/${leadId}`, followUpData);
    return res.data;
  },

  // Get Follow-ups by Lead
  getFollowUps: async (leadId) => {
    const res = await api.get(`/followups/${leadId}`);
    return res.data;
  },
};

export default FollowUpService;
