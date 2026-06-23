package com.orbit.service;

import java.util.List;
import com.orbit.entity.Lead;

public interface LeadService {

    Lead saveLead(Lead lead);

    List<Lead> getAllLeads();

    Lead getLeadById(Long id);

    Lead updateLead(Long id, Lead lead);

    void deleteLead(Long id);

    List<Lead> getLeadsByStatus(String status);

    List<Lead> getLeadsByAgent(Long agentId);

    // 🔥 NEW
    void assignLeadToAgent(Long leadId, Long agentId);

    List<Lead> getLeadsByManager(Long managerId);
}