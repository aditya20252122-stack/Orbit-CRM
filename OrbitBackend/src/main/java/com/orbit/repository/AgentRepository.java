package com.orbit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.orbit.entity.Agent;

import java.util.List;

public interface AgentRepository extends JpaRepository<Agent, Long> {

    // 🔍 Find agent by email (for login later)
    Agent findByEmail(String email);

    // 🔍 Get agents under a manager
    List<Agent> findByManagerId(Long managerId);
}