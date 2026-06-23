package com.orbit.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.orbit.entity.Lead;
import com.orbit.enums.LeadStatus;
import com.orbit.service.LeadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
@RequiredArgsConstructor

public class ReportController {

    private final LeadService leadService;

    // 🔥 0. General Reports Summary (Default Root Endpoint)
    @GetMapping
    public List<Map<String, Object>> getGeneralReports() {
        List<Lead> leads = leadService.getAllLeads();
        long totalLeads = leads.size();
        
        long booked = leads.stream()
                .filter(l -> l.getStatus() == LeadStatus.BOOKED)
                .count();
                
        long newLeads = leads.stream()
                .filter(l -> l.getStatus() == LeadStatus.NEW)
                .count();

        Map<String, Object> totalReport = new HashMap<>();
        totalReport.put("reportName", "Total Leads Report");
        totalReport.put("description", "Total number of leads registered in the CRM.");
        totalReport.put("count", totalLeads);

        Map<String, Object> bookedReport = new HashMap<>();
        bookedReport.put("reportName", "Booked (Converted) Leads Report");
        bookedReport.put("description", "Leads successfully converted to customers.");
        bookedReport.put("count", booked);

        Map<String, Object> newReport = new HashMap<>();
        newReport.put("reportName", "New Leads Report");
        newReport.put("description", "Recently registered leads waiting for contact.");
        newReport.put("count", newLeads);

        return List.of(totalReport, bookedReport, newReport);
    }

    // 🔥 1. Total Leads
    @GetMapping("/total-leads")
    public long getTotalLeads() {
        return leadService.getAllLeads().size();
    }

    // 🔥 2. Leads by Status (ENUM FIX)
    @GetMapping("/status")
    public Map<LeadStatus, Long> getLeadsByStatus() {

        List<Lead> leads = leadService.getAllLeads();

        Map<LeadStatus, Long> statusCount = new HashMap<>();

        for (Lead lead : leads) {
            LeadStatus status = lead.getStatus();
            statusCount.put(status, statusCount.getOrDefault(status, 0L) + 1);
        }

        return statusCount;
    }

    // 🔥 3. Leads by Agent
    @GetMapping("/agent/{agentId}")
    public List<Lead> getLeadsByAgent(@PathVariable Long agentId) {
        return leadService.getLeadsByAgent(agentId);
    }

    // 🔥 4. Conversion Report
    @GetMapping("/conversion")
    public long getConversionCount() {

        return leadService.getAllLeads()
                .stream()
                .filter(lead -> lead.getStatus() == LeadStatus.BOOKED)
                .count();
    }

    // 🔥 5. Dashboard Summary
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {

        List<Lead> leads = leadService.getAllLeads();

        long total = leads.size();

        long booked = leads.stream()
                .filter(l -> l.getStatus() == LeadStatus.BOOKED)
                .count();

        long newLeads = leads.stream()
                .filter(l -> l.getStatus() == LeadStatus.NEW)
                .count();

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalLeads", total);
        dashboard.put("bookedLeads", booked);
        dashboard.put("newLeads", newLeads);

        return dashboard;
    }
}