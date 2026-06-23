package com.orbit.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.orbit.entity.Agent;
import com.orbit.service.AgentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/agents")
@CrossOrigin("*")
@RequiredArgsConstructor   // 🔥 Lombok injection

public class AgentController {

    private final AgentService agentService;

    // ✅ Create Agent
    @PostMapping
    public Agent createAgent(@RequestBody Agent agent) {
        return agentService.saveAgent(agent);
    }

    // ✅ Get All Agents
    @GetMapping
    public List<Agent> getAllAgents() {
        return agentService.getAllAgents();
    }

    // ✅ Get Agent by ID
    @GetMapping("/{id}")
    public Agent getAgentById(@PathVariable Long id) {
        return agentService.getAgentById(id);
    }

    // ✅ Update Agent
    @PutMapping("/{id}")
    public Agent updateAgent(@PathVariable Long id, @RequestBody Agent agent) {
        return agentService.updateAgent(id, agent);
    }

    // ✅ Delete Agent
    @DeleteMapping("/{id}")
    public String deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return "Agent deleted successfully";
    }

    // 🔥 Get Agents by Manager
    @GetMapping("/manager/{managerId}")
    public List<Agent> getAgentsByManager(@PathVariable Long managerId) {
        return agentService.getAgentsByManager(managerId);
    }

    // 🔍 Find agent by email
    @GetMapping("/email/{email}")
    public Agent getAgentByEmail(@PathVariable String email) {
        return agentService.getAgentByEmail(email);
    }
}