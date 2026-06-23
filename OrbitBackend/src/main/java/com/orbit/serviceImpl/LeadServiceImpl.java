package com.orbit.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.orbit.entity.Agent;
import com.orbit.entity.Lead;
import com.orbit.entity.Manager;
import com.orbit.enums.LeadStatus;
import com.orbit.repository.AgentRepository;
import com.orbit.repository.LeadRepository;
import com.orbit.repository.ManagerRepository;
import com.orbit.service.LeadService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final AgentRepository agentRepository;
    private final ManagerRepository managerRepository;
    // ✅ CREATE LEAD
    @Override
    public Lead saveLead(Lead lead) {

        // 🔥 Handle agent assignment properly if provided
        if (lead.getAgent() != null && lead.getAgent().getId() != null) {
            Agent agent = agentRepository.findById(lead.getAgent().getId())
                    .orElseThrow(() -> new RuntimeException("Agent not found"));
            lead.setAgent(agent);
        } else {
            lead.setAgent(null);
        }

        // 🎯 Auto-assign Manager based on Lead's Area
        if (lead.getArea() != null && !lead.getArea().trim().isEmpty()) {
            List<Manager> managers = managerRepository.findByArea(lead.getArea().trim());
            if (managers != null && !managers.isEmpty()) {
                lead.setManager(managers.get(0));
            }
        }

        // ✅ Auto set created date
        if (lead.getCreatedAt() == null) {
            lead.setCreatedAt(LocalDateTime.now());
        }

        return leadRepository.save(lead);
    }

    // ✅ GET ALL
    @Override
    public List<Lead> getAllLeads() {
        return leadRepository.findAll();
    }

    // ✅ GET BY ID
    @Override
    public Lead getLeadById(Long id) {
        return leadRepository.findById(id).orElse(null);
    }

    // ✅ UPDATE
    @Override
    public Lead updateLead(Long id, Lead lead) {
        Lead existing = leadRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(lead.getName());
            existing.setEmail(lead.getEmail());
            existing.setPhone(lead.getPhone());
            existing.setStatus(lead.getStatus());
            existing.setSource(lead.getSource());
            existing.setNotes(lead.getNotes());
            existing.setPriority(lead.getPriority());
            existing.setArea(lead.getArea()); // Save updated area

            // 🎯 Re-evaluate and update Manager if the area has changed
            if (lead.getArea() != null && !lead.getArea().trim().isEmpty()) {
                List<Manager> managers = managerRepository.findByArea(lead.getArea().trim());
                if (managers != null && !managers.isEmpty()) {
                    existing.setManager(managers.get(0));
                } else {
                    existing.setManager(null);
                }
            } else {
                existing.setManager(null); // Clear manager if area is removed
            }

            // 🔥 Handle agent assignment properly if provided
            if (lead.getAgent() != null && lead.getAgent().getId() != null) {
                Agent agent = agentRepository.findById(lead.getAgent().getId())
                        .orElseThrow(() -> new RuntimeException("Agent not found"));
                existing.setAgent(agent);
            } else {
                existing.setAgent(null);
            }

            return leadRepository.save(existing);
        }

        return null;
    }

    // ✅ DELETE
    @Override
    public void deleteLead(Long id) {
        leadRepository.deleteById(id);
    }

    // 🔥 GET BY STATUS
    @Override
    public List<Lead> getLeadsByStatus(String status) {
        return leadRepository.findByStatus(
                LeadStatus.valueOf(status.toUpperCase())
        );
    }

    // ✅ GET BY AGENT
    @Override
    public List<Lead> getLeadsByAgent(Long agentId) {
        return leadRepository.findByAgentId(agentId);
    }

    // 🔥 ASSIGN LEAD → AGENT
    @Override
    public void assignLeadToAgent(Long leadId, Long agentId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        lead.setAgent(agent);
        lead.setAssignedDate(LocalDateTime.now());
        lead.setPriority("MEDIUM");

        leadRepository.save(lead);
    }

    @Override
    public List<Lead> getLeadsByManager(Long managerId) {
        Manager manager = managerRepository.findById(managerId).orElse(null);
        if (manager != null && manager.getArea() != null && !manager.getArea().trim().isEmpty()) {
            return leadRepository.findByManagerIdOrArea(managerId, manager.getArea().trim());
        }
        return leadRepository.findByManagerId(managerId);
    }
}