package com.orbit.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.orbit.dto.AssignLeadDTO;
import com.orbit.entity.Lead;
import com.orbit.service.LeadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin("*")
@RequiredArgsConstructor

public class LeadController {

    private final LeadService leadService;

    @PostMapping
    public Lead createLead(@RequestBody Lead lead) {
        return leadService.saveLead(lead);
    }

    @GetMapping
    public List<Lead> getAllLeads() {
        return leadService.getAllLeads();
    }

    @GetMapping("/{id}")
    public Lead getLeadById(@PathVariable Long id) {
        return leadService.getLeadById(id);
    }

    @PutMapping("/{id}")
    public Lead updateLead(@PathVariable Long id, @RequestBody Lead lead) {
        return leadService.updateLead(id, lead);
    }

    @DeleteMapping("/{id}")
    public String deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return "Lead deleted successfully";
    }

    // 🔥 Assign Lead → Agent
    @PostMapping("/assign")
    public String assignLead(@RequestBody AssignLeadDTO dto) {
        leadService.assignLeadToAgent(dto.getLeadId(), dto.getAgentId());
        return "Lead assigned successfully";
    }

    // 🔥 Filter APIs
    @GetMapping("/status/{status}")
    public List<Lead> getByStatus(@PathVariable String status) {
        return leadService.getLeadsByStatus(status);
    }

    @GetMapping("/agent/{agentId}")
    public List<Lead> getByAgent(@PathVariable Long agentId) {
        return leadService.getLeadsByAgent(agentId);
    }

    @GetMapping("/manager/{managerId}")
    public List<Lead> getByManager(@PathVariable Long managerId) {
        return leadService.getLeadsByManager(managerId);
    }
}