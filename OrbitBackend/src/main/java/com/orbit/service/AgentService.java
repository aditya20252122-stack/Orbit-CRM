package com.orbit.service;

import java.util.List;
import com.orbit.entity.Agent;

public interface AgentService {

    Agent saveAgent(Agent agent);

    List<Agent> getAllAgents();

    Agent getAgentById(Long id);

    Agent updateAgent(Long id, Agent agent);

    void deleteAgent(Long id);

    // 🔥 Custom
    List<Agent> getAgentsByManager(Long managerId);

    // 🔐 For fetching during login (used by AuthService)
    Agent getAgentByEmail(String email);
}